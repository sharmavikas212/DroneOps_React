# DroneOps Migration Matrix & Roadmap
**Native Android (`sharmavikas212/DroneOps`) → React Native (`sharmavikas212/DroneOps_React`)**

> **Purpose**: This document serves as the persistent source of truth for transitioning the native Android application to React Native. Any agent or developer can refer directly to this document to know what has been specified, what is implemented, and what remains without needing to query GitHub.

---

## 1. Native Android Source Inventory

The native Android application (`sharmavikas212/DroneOps` on branch `master`) contains the following components under `app/src/main/java/com/example/droneops/`:

| Layer | Native File | Description / Responsibility |
|---|---|---|
| **Entry & Nav** | `MainActivity.kt` | Single-activity entry point orchestrating Compose navigation between Dashboard and History. |
| **Presentation** | `presentation/dashboard/DroneDashboardScreen.kt` | Real-time flight dashboard UI, telemetry tiles, and connection indicators. |
| | `presentation/dashboard/DroneDashboardViewModel.kt` | Manages live UI state, watchdog timer logic, and repository subscriptions. |
| | `presentation/dashboard/DroneDashboardUiState.kt` | Data class representing state (`Connecting`, `Connected`, `Disconnected`, metrics). |
| | `presentation/history/FlightHistoryScreen.kt` | List screen displaying past recorded flights and summary statistics. |
| | `presentation/history/FlightHistoryViewModel.kt` | Loads and manages historical flight records from local SQLite. |
| | `presentation/history/FlightHistoryUiState.kt` | UI state representing history loading, list of records, and empty states. |
| **Data / Storage** | `data/local/DroneDatabase.kt` | Room SQLite database definition. |
| | `data/local/FlightRecordEntity.kt` | SQLite schema: `id`, `startTimeMillis`, `endTimeMillis`, `durationSeconds`, `maxAltitudeMeters`, `averageSpeedMps`, `minBatteryPercentage`. |
| | `data/local/FlightRecordDao.kt` | CRUD queries (`insert`, `getAllRecords`, `deleteRecord`). |
| **Data / Stream** | `data/model/DroneTelemetry.kt` | Telemetry packet payload (GPS coordinates, altitude, speed, heading, battery). |
| | `data/repository/DroneTelemetryRepository.kt` | Ingests telemetry, computes running flight aggregates, and triggers database save on completion. |
| | `data/source/TelemetrySource.kt` | Abstract interface providing a telemetry stream (`Flow<DroneTelemetry>`). |
| | `data/source/SimulatedTelemetrySource.kt` | Generates simulated drone telemetry ticks with realistic flight movement. |
| **UI & Theme** | `ui/theme/Color.kt`, `Theme.kt`, `Type.kt` | Utilitarian tactical dark theme color tokens and typography. |
| | Custom widgets (`PulseIndicator.kt`, `TelemetryGrid.kt`) | Reusable HUD widgets and pulsating heartbeat status indicators. |
| **Tests** | `test/.../DroneDashboardViewModelTest.kt` | Unit tests for dashboard state transitions and watchdog timer. |
| | `test/.../FlightHistoryViewModelTest.kt` | Unit tests for history loading and record deletion. |
| | `test/.../FakeTelemetrySource.kt` | Controllable fake telemetry source for deterministic testing. |

---

## 2. Transition Status Matrix

| Module | Native Android Equivalent | React Native Target Layer | Status | SpecKit Reference |
|---|---|---|---|---|
| **Telemetry HUD & Watchdog** | `DroneDashboardScreen`, `DroneDashboardViewModel` | `app/(tabs)/index.tsx`, `src/presentation/` | **Implemented** | [001-telemetry-dashboard](../specs/001-telemetry-dashboard/spec.md) |
| **Flight Summary Persistence** | `DroneDatabase`, `FlightRecordDao`, `FlightRecordEntity` | `src/data/local/` (`expo-sqlite`) | **Implemented** | [001-telemetry-dashboard](../specs/001-telemetry-dashboard/spec.md) |
| **Multi-Screen Navigation Shell** | `MainActivity.kt` (Compose NavHost) | `app/_layout.tsx` (Expo Router Tabs/Stack) | **Implemented** | [002-navigation-shell](../specs/002-navigation-shell/spec.md) |
| **Flight History Screen & UI** | `FlightHistoryScreen`, `FlightHistoryViewModel` | `app/(tabs)/history.tsx`, `src/presentation/` | **Pending Spec** | Planned `003-flight-history-ui` |
| **Telemetry Simulator Engine** | `SimulatedTelemetrySource.kt` | `src/data/source/SimulatedTelemetrySource.ts` | **Pending Spec** | Planned `004-telemetry-simulator` |
| **Tactical HUD Widgets & Design** | `PulseIndicator.kt`, `TelemetryGrid.kt`, `ui/theme/` | `src/presentation/components/`, `src/theme/` | **Pending Spec** | Planned `005-tactical-hud` |

---

## 3. Phased Roadmap

### Phase 1: Core Telemetry Dashboard & Database Layer (Completed)
- **Goal**: Implement the core state machine, 3-second watchdog timer, and `expo-sqlite` summary storage.
- **Spec**: [specs/001-telemetry-dashboard/spec.md](../specs/001-telemetry-dashboard/spec.md)

### Phase 2: Expo Router Navigation Shell (Completed)
- **Goal**: Establish the app structure using Expo Router with tab-based navigation (`Dashboard` and `History`).
- **Spec**: [specs/002-navigation-shell/spec.md](../specs/002-navigation-shell/spec.md)

### Phase 3: Flight History Screen & UI (Current Phase)
- **Goal**: Build the UI to browse, search, inspect, and delete historical flight records saved in SQLite.
- **Next Command**: `/speckit-specify` for `003-flight-history-ui`.

### Phase 4: Telemetry Simulator & Test Harness
- **Goal**: Recreate the native flight simulation mathematics, waypoint progression, battery drain curves, and controllable fake harness for Jest.
- **Next Command**: `/speckit-specify` for `004-telemetry-simulator`.

### Phase 5: Tactical UI Polish & Component Library
- **Goal**: Implement reusable pulse indicator badges, telemetry grid cards, and high-visibility outdoor styling matching the DroneOps visual design.
