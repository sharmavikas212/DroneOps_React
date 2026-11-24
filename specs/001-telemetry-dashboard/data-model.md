# Data Model: Core Telemetry Dashboard & Session Recording

**Feature**: `001-telemetry-dashboard`  
**Date**: 2026-11-23  
**Status**: Complete  

---

## 1. Entities

### 1.1 `DroneTelemetry`
Represents an instantaneous telemetry packet emitted by a telemetry source.

| Field | Type | Description | Validation Rules |
|---|---|---|---|
| `timestamp` | `number` | Unix epoch timestamp in milliseconds | Integer > 0 |
| `latitude` | `number` | Geographic latitude in decimal degrees | `-90.0 <= latitude <= 90.0` |
| `longitude` | `number` | Geographic longitude in decimal degrees | `-180.0 <= longitude <= 180.0` |
| `altitudeMeters` | `number` | Height above ground level in meters | `>= 0.0` |
| `airspeedMps` | `number` | True airspeed in meters per second | `>= 0.0` |
| `headingDegrees` | `number` | Compass heading relative to true north | `0.0 <= headingDegrees < 360.0` |
| `batteryPercentage` | `number` | Remaining battery state of charge | `0.0 <= batteryPercentage <= 100.0` |

### 1.2 `ConnectionState`
Represents the discrete operational status of the telemetry link.

```typescript
export type ConnectionState = 'Connecting' | 'Connected' | 'Disconnected' | 'Error';
```

- **`Connecting`**: Initial connection attempt or reconnection attempt in progress.
- **`Connected`**: Telemetry link active and receiving packets within the 3-second watchdog window.
- **`Disconnected`**: Watchdog timeout triggered due to >= 3.0s cessation of packets, or explicit stream disconnect.
- **`Error`**: Handshake or connection failure (e.g., initial 3s timeout before receiving any packet).

### 1.3 `DashboardUiState`
Represents the reactive state consumed by presentation screens and HUD widgets.

| Field | Type | Description |
|---|---|---|
| `connectionState` | `ConnectionState` | Current explicit connection state |
| `telemetry` | `DroneTelemetry \| null` | Latest known telemetry packet (or null if never connected) |
| `isStale` | `boolean` | Flag indicating whether telemetry is retained stale data |
| `breadcrumbs` | `BreadcrumbPoint[]` | In-memory tactical GPS trail for active flight session |
| `errorMessage` | `string \| null` | Optional error details if `connectionState === 'Error'` |

### 1.4 `BreadcrumbPoint`
Represents a single transient GPS coordinate retained in memory during active flight.

| Field | Type | Description |
|---|---|---|
| `latitude` | `number` | Latitude coordinate |
| `longitude` | `number` | Longitude coordinate |
| `timestamp` | `number` | Epoch time when point was plotted |

*Lifecycle*: Initialized to empty array `[]`. Cleared immediately upon flight termination (FR-010 / SC-005).

### 1.5 `FlightRecord` (Persistent SQLite Entity)
Represents the consolidated mission summary persisted to local SQLite when a flight terminates.

| Column | SQLite Type | TypeScript Type | Constraints / Rules |
|---|---|---|---|
| `id` | `TEXT` | `string` | PRIMARY KEY (UUID v4 or nanoid) |
| `startTimeMillis` | `INTEGER` | `number` | NOT NULL, epoch milliseconds |
| `endTimeMillis` | `INTEGER` | `number` | NOT NULL, `>= startTimeMillis` |
| `durationSeconds` | `INTEGER` | `number` | NOT NULL, `>= 0` |
| `maxAltitudeMeters`| `REAL` | `number` | NOT NULL, `>= 0.0` |
| `averageSpeedMps` | `REAL` | `number` | NOT NULL, `>= 0.0` |
| `minBatteryPercentage` | `REAL` | `number` | NOT NULL, `0.0 <= value <= 100.0` |

---

## 2. State Machine Transitions

```
                    ┌─────────────────────────┐
                    │          Idle           │
                    └────────────┬────────────┘
                                 │ connect()
                                 ▼
                    ┌─────────────────────────┐
      ┌─────────────│       Connecting        │─────────────┐
      │ 3s watchdog └─────────────────────────┘ Handshake   │
      │ timeout                  │              Packet      │
      ▼                          ▼                          ▼
┌───────────┐             ┌─────────────┐             ┌───────────┐
│   Error   │             │  Connected  │◄────────────│  Active   │
└───────────┘             └──────┬──────┘ Packet rcvd │ (Flying)  │
      ▲                          │        resets 3s   └───────────┘
      │                          │ 3s watchdog
      │                          │ timeout
      │                          ▼
      │                   ┌─────────────┐
      └───────────────────│Disconnected │
                          │ (Stale Data)│
                          └──────┬──────┘
                                 │ Packet resumes
                                 ▼
                          ┌─────────────┐
                          │  Connected  │
                          └─────────────┘
```

### Connection State Rules:
1. **Connect Trigger**: On `connect()`, state becomes `Connecting`, arm 3000ms watchdog timer.
2. **First Packet**: State transitions to `Connected`, `telemetry` set, `isStale = false`, reset watchdog to 3000ms.
3. **Connecting Timeout**: If 3000ms expires while in `Connecting`, state transitions to `Error` (or `Disconnected`).
4. **Subsequent Packets**: State remains `Connected`, `telemetry` updated, `isStale = false`, reset watchdog to 3000ms.
5. **Connected Timeout**: If 3000ms expires without packet, state transitions to `Disconnected`, `telemetry` is **retained**, `isStale = true`.
6. **Recovery**: When packet arrives while `Disconnected`, state immediately transitions to `Connected`, `isStale = false`, reset watchdog to 3000ms.

### Flight Lifecycle & Summary Persistence Rules:
1. **Flight Start**: Begins upon first valid telemetry packet received. Aggregator initializes start time and baseline metrics.
2. **Flight Progression**: As packets arrive, running aggregates update in O(1):
   - `maxAltitudeMeters = max(maxAltitudeMeters, packet.altitudeMeters)`
   - `minBatteryPercentage = min(minBatteryPercentage, packet.batteryPercentage)`
   - `totalSpeedSum += packet.airspeedMps; sampleCount += 1`
   - `lastPacketTime = packet.timestamp`
3. **Micro-Drops & Intermittent Disconnects**: If connection drops (< 3s or intermittent watchdog disconnect), the flight session remains open and active.
4. **Flight Termination**: Triggers strictly when:
   - Stream explicitly signals completion / disconnection (`disconnect()` or stream EOF), OR
   - Battery level drops to `0%`.
5. **Persistence**:
   - Calculate `averageSpeedMps = totalSpeedSum / sampleCount`
   - Calculate `durationSeconds = round((lastPacketTime - startTime) / 1000)`
   - Insert new `FlightRecord` into SQLite database via `FlightRecordDao.insertFlightRecord(record)`
   - Reset breadcrumb trail in presentation memory to empty `[]`.
6. **Zero-Packet Guard**: If a connection drops before any valid telemetry is received (`sampleCount === 0`), no `FlightRecord` is created.
