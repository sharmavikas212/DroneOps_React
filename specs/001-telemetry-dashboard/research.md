# Technical Research: Core Telemetry Dashboard & Session Recording

**Feature**: `001-telemetry-dashboard`  
**Date**: 2026-11-23  
**Status**: Complete  

---

## 1. Local Persistence Architecture (`expo-sqlite`)

### Context & Problem
The system must persist consolidated post-flight summaries (start/end timestamps, duration, max altitude, average speed, minimum battery level) to local offline storage on mobile devices (Android/iOS) when a flight terminates. It must not persist raw high-frequency telemetry ticks.

### Decision
Use `expo-sqlite` (modern synchronous initialization `openDatabaseSync` with asynchronous query methods `runAsync` and `getAllAsync`). Encapsulate database operations behind a clean `FlightRecordDao` interface and `FlightDatabase` class under `src/data/local/`.

### Rationale
- **Constitution Alignment**: Principle IV explicitly specifies SQLite (`expo-sqlite`) for local flight summary storage.
- **Modern Expo Standards**: The modern Expo SQLite API (SDK 51+) provides native Promise-based queries (`db.runAsync`, `db.getAllAsync`) and type-safe parameter binding, eliminating legacy callback spaghetti.
- **Decoupled DAO Pattern**: Wrapping SQLite queries in a `FlightRecordDao` allows tests to substitute an in-memory fake (`FakeFlightRecordDao`) without requiring native SQLite bindings in pure Node.js unit tests.

### Alternatives Considered
- **AsyncStorage**: Simple key-value store. Rejected because it lacks relational querying, structured schema versioning, and fails to match the native Android Room implementation.
- **WatermelonDB / Realm**: Heavy ORM and reactive database engines. Rejected as an unnecessary bloat violation of Constitution Principle II (Zero-Bloat Wiring).

---

## 2. Telemetry Streaming & Subscription Abstraction

### Context & Problem
Upstream presentation layers need to receive continuous telemetry updates without coupling to the underlying transport (simulator, mock test fake, network socket, or hardware SDK).

### Decision
Define a minimal, zero-dependency `TelemetrySource` interface in `src/data/source/TelemetrySource.ts`:
```typescript
export interface TelemetrySource {
  connect(): void;
  disconnect(): void;
  subscribe(listener: (packet: DroneTelemetry) => void): () => void;
  onConnectionChange?(listener: (state: ConnectionState) => void): () => void;
}
```

### Rationale
- **Zero-Bloat & Dependency Free**: Adheres to Constitution Principle II prohibiting external reactive libraries (RxJS, MobX, Redux) for internal wiring.
- **Unsubscribe Cleanup**: Returning an unsubscription function (`() => void`) makes integration with React `useEffect` clean and leak-free.
- **Portability & Testability**: `FakeTelemetrySource` can easily simulate packet emissions, connection events, delays, and drops deterministically in Jest tests.

### Alternatives Considered
- **RxJS / Observables**: Robust stream handling but adds significant external bundle weight and complexity for a simple 1:1 telemetry subscription.
- **Node.js `EventEmitter`**: Polyfilling `events` in React Native creates unnecessary cross-platform runtime dependencies.
- **Direct Global State**: Directly mutating a global store from a simulator destroys layer boundaries.

---

## 3. 3-Second Heartbeat Watchdog & Connection State Machine

### Context & Problem
Connection status must be distinct and explicit (`Connecting`, `Connected`, `Disconnected`, `Error`). A 3-second watchdog timer must initiate immediately upon connection attempt (preventing infinite `Connecting` state) and reset on every incoming packet. If 3 seconds elapse with no packet, connection must transition to `Disconnected` (or `Error` if initial connect timed out), retaining last-known telemetry with a stale indicator.

### Decision
Implement the watchdog timer in the presentation state layer (`useTelemetry` hook / state coordinator) using a resettable timer pattern.
- State model: `{ status: ConnectionState, telemetry: DroneTelemetry | null, isStale: boolean }`.
- When connection starts: set status to `Connecting`, arm 3000ms watchdog timer.
- When packet arrives: set status to `Connected`, update `telemetry`, set `isStale: false`, reset (cancel & re-arm) 3000ms watchdog timer.
- When watchdog triggers:
  - If previous status was `Connecting`: transition to `Error` / `Disconnected`.
  - If previous status was `Connected`: transition to `Disconnected`, retain `telemetry`, set `isStale: true`.
- When valid packet arrives during `Disconnected`: transition immediately to `Connected`, set `isStale: false`, re-arm watchdog.

### Rationale
- **Constitution Mandate**: Enforces Principle III (Explicit Connection State & 3-Second Watchdog).
- **Deterministic Virtual Clocks**: Using standard `setTimeout` / `clearTimeout` allows 100% deterministic testing with `jest.useFakeTimers()` (`jest.advanceTimersByTime(3000)`).
- **Eliminates UI Stutter**: Avoids continuous polling intervals (`setInterval`), only scheduling work when packets arrive or timers expire.

### Alternatives Considered
- **Interval Polling**: Polling a timestamp delta on a periodic interval (e.g. every 500ms). Rejected because it introduces timer drift, inaccurate timeout latency (up to 3.5s instead of exactly 3s), and unnecessary CPU cycles.
- **State in Repository vs Presentation**: Keeping UI watchdog purely in repository. Rejected because the visual freshness and watchdog state directly control UI HUD badging and stale visual banners.

---

## 4. Flight Session Aggregation & Lifecycle Management

### Context & Problem
The system must calculate summary metrics (duration, max altitude, average speed, minimum battery level) when a flight terminates. Temporary signal disconnects (< 3 seconds or intermittent watchdog timeouts during flight) must NOT split a flight into multiple fragmented records. Termination occurs strictly when the flight concludes (battery reaches 0% or telemetry stream terminates).

### Decision
Implement an incremental running aggregator (`FlightSessionTracker`) within `DroneTelemetryRepository`:
- Tracks `startTimeMillis`, `lastPacketTimeMillis`, `maxAltitudeMeters`, `totalSpeedSum`, `speedSampleCount`, and `minBatteryPercentage`.
- Incremental O(1) calculations on each incoming packet:
  - `maxAltitudeMeters = Math.max(maxAltitudeMeters, packet.altitudeMeters)`
  - `minBatteryPercentage = Math.min(minBatteryPercentage, packet.batteryPercentage)`
  - `totalSpeedSum += packet.airspeedMps; speedSampleCount += 1`
- When flight terminates (stream end event or `packet.batteryPercentage <= 0`):
  - `averageSpeedMps = totalSpeedSum / Math.max(speedSampleCount, 1)`
  - `durationSeconds = Math.round((lastPacketTimeMillis - startTimeMillis) / 1000)`
  - Build `FlightRecord` entity and persist via `FlightRecordDao.insertFlightRecord(record)`.
- If connection drops and reconnects while flight is still ongoing (battery > 0%), the aggregator continues accumulating into the same session.
- If zero valid packets were received (e.g., immediate connection error), no flight record is generated (prevents zero-duration junk records).

### Rationale
- **Constitution Compliance**: Enforces Principle IV (Summary-Only Persistence) and FR-007, FR-008, FR-009.
- **Zero Memory Bloat**: Running O(1) metrics require constant memory regardless of whether the flight lasts 5 minutes or 5 hours.
- **Consolidation**: Avoids multiple fragmented records during flaky field RF links.

### Alternatives Considered
- **Array Storage of All Telemetry Ticks**: Buffering every packet in memory and reducing at the end. Rejected due to unbounded memory growth on long flights.
- **Persisting Ticks to SQLite & Querying `AVG`/`MAX`**: Rejected by Constitution Principle IV ("Individual telemetry ticks MUST NEVER be persisted").

---

## 5. In-Memory Breadcrumb Trail Management

### Context & Problem
FR-006 and SC-005 require maintaining an in-memory breadcrumb trail of coordinates during an active flight for tactical map/HUD visualization, which must be cleared immediately upon flight termination to keep memory footprint flat.

### Decision
Store breadcrumbs as a simple coordinate array `Array<{ latitude: number; longitude: number; timestamp: number }>` in the presentation state. Upon session conclusion / reset, the array reference is cleared (`[]`).

### Rationale
- **Zero Disk I/O**: Keeps high-frequency coordinate tracking strictly in transient memory.
- **Instant Garbage Collection**: Replacing the array with `[]` allows instant reclamation of point memory.
- **Fulfills SC-005**: 100% flat memory footprint across consecutive flights.

### Alternatives Considered
- **Persisting Breadcrumbs to Disk**: Rejected by Constitution Principle IV.
- **Complex Spatial Tree**: Unnecessary overhead for 1 Hz telemetry visualization.

---

## 6. Testing Strategy & Controllable Fakes

### Context & Problem
Automated tests must be 100% deterministic (Constitution Principle V). No real delays or uncontrolled random outputs are allowed.

### Decision
- **Virtual Clocks**: Use `jest.useFakeTimers()` in all test suites testing timeouts, watchdog triggers, and session durations.
- **`FakeTelemetrySource`**: Controllable test double providing explicit methods:
  - `emitPacket(packet: DroneTelemetry)`
  - `simulateDisconnect()`
  - `simulateStreamEnd()`
- **`FakeFlightRecordDao`**: In-memory array-backed implementation of `FlightRecordDao` for repository tests, allowing instant verification without native SQLite mocks.

### Rationale
- Guarantees fast, reproducible tests in CI and local CLI without flaky race conditions.
- Strict adherence to Constitution Principle V.
