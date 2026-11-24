# Quickstart & Validation Guide: Core Telemetry Dashboard & Session Recording

**Feature**: `001-telemetry-dashboard`  
**Date**: 2026-11-23  
**Status**: Ready for Verification  

---

## 1. Overview & Prerequisites

This quickstart guide provides step-by-step instructions to validate the real-time telemetry dashboard, the 3-second heartbeat watchdog, and SQLite session persistence end-to-end.

### Prerequisites
- Node.js v18 or higher LTS
- npm or pnpm
- Working directory: repository root (`DroneOps_React`)

### Setup Commands
```bash
# Install dependencies
npm install

# Type verification
npx tsc --noEmit
```

---

## 2. Automated Test Validation Scenarios

Run the deterministic test suite executing the scenarios specified in [spec.md](./spec.md):

```bash
# Run all unit and integration tests with deterministic virtual clocks
npm test
```

### Scenario 1: Real-Time Telemetry Streaming & HUD Updates (User Story 1 / SC-001)
- **Objective**: Verify incoming packets update state and append breadcrumb coordinates within 100ms.
- **Test Command**:
  ```bash
  npm test -- -t "DashboardViewModel updates telemetry and appends breadcrumbs"
  ```
- **Expected Outcome**:
  - `connectionState` is `Connected`.
  - `telemetry` reflects incoming altitude, airspeed, heading, and battery.
  - `isStale` is `false`.
  - `breadcrumbs` array contains appended coordinate points.

### Scenario 2: 3-Second Heartbeat Watchdog Disconnect (User Story 2 / SC-002, SC-003)
- **Objective**: Verify that pausing the packet stream for >= 3.0s transitions state to `Disconnected` and marks data as stale while retaining last-known values.
- **Test Command**:
  ```bash
  npm test -- -t "watchdog timer transitions to Disconnected after 3 seconds"
  ```
- **Expected Outcome**:
  - Advancing virtual clock by 3000ms (`jest.advanceTimersByTime(3000)`) triggers transition to `Disconnected`.
  - `telemetry` retains the last emitted coordinates and metrics (not set to null).
  - `isStale` is `true`.

### Scenario 3: Watchdog Connecting Timeout (FR-003 / Edge Case)
- **Objective**: Verify that initiating a connection that receives zero packets times out to `Error` or `Disconnected` at 3.0s without hanging.
- **Test Command**:
  ```bash
  npm test -- -t "connection attempt aborts after 3-second timeout"
  ```
- **Expected Outcome**:
  - State starts in `Connecting`.
  - At 3000ms virtual clock advancement, state transitions to `Error` / `Disconnected`.

### Scenario 4: Stream Resumption & Stale Flag Dismissal (Acceptance Scenario 2.3)
- **Objective**: Verify that receiving a valid packet after disconnect immediately returns link to `Connected` and clears the stale badge.
- **Test Command**:
  ```bash
  npm test -- -t "incoming packet clears stale indicator and restores Connected"
  ```
- **Expected Outcome**:
  - Link immediately returns to `Connected`.
  - `isStale` resets to `false`.
  - Watchdog timer is re-armed for another 3000ms.

### Scenario 5: Flight Termination & SQLite Session Recording (User Story 3 / SC-004, SC-005, SC-006)
- **Objective**: Verify that stream termination or battery hitting 0% computes the flight summary, persists a single record to SQLite, and clears in-memory breadcrumbs.
- **Test Command**:
  ```bash
  npm test -- -t "flight completion persists summary record and clears breadcrumbs"
  ```
- **Expected Outcome**:
  - SQLite query via `FlightRecordDao.getAllFlightRecords()` returns 1 record.
  - Record contains accurate `durationSeconds`, `maxAltitudeMeters`, `averageSpeedMps`, and `minBatteryPercentage`.
  - In-memory `breadcrumbs` array is reset to `[]`.
  - Temporary signal interruptions during flight did NOT split the session into multiple records.

---

## 3. Manual Interactive Verification (Expo Dev Server)

```bash
# Start the Expo application
npx expo start
```

1. **Dashboard Launch**: Open app on Android / iOS emulator. Verify utilitarian dark theme UI with high-contrast tactical HUD tiles.
2. **Connection**: Trigger connect. Verify `Connecting` badge turns to `Connected` (Green/Cyan) when simulated packets arrive.
3. **Telemetry Movement**: Watch altitude, speed, and heading update live. Confirm breadcrumb trail visualizes path.
4. **Disconnect Simulation**: Halt simulation feed. At exactly 3.0s, confirm status changes to `Disconnected` (Red/Amber), with warning badge indicating stale data while retaining last visible telemetry.
5. **Reconnection**: Resume feed. Confirm badge returns to `Connected` and stale banner vanishes.
6. **Flight Completion**: Conclude flight (battery 0% or manual disconnect). Navigate to history or query database to confirm single persistent summary record.
