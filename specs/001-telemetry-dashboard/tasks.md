---
description: "Task list for Core Telemetry Dashboard & Session Recording implementation"
---

# Tasks: Core Telemetry Dashboard & Session Recording

**Input**: Design documents from `specs/001-telemetry-dashboard/`  
**Prerequisites**: [plan.md](./plan.md) (required), [spec.md](./spec.md) (required), [data-model.md](./data-model.md), [contracts/](./contracts/), [research.md](./research.md), [quickstart.md](./quickstart.md), [.specify/memory/constitution.md](../../.specify/memory/constitution.md)

**Tests**: Tests are mandatory per Constitution Principle V ("Automated tests MUST be 100% deterministic") and verification gates. Test tasks are included for each user story and must use virtual clocks (`jest.useFakeTimers()`).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., [US1], [US2], [US3]). Omitted for Setup, Foundational, and Polish phases.
- Exact file paths are included in all task descriptions.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, tooling configuration, and baseline application structure.

- [X] T001 Initialize Expo React Native project configuration, `package.json`, and TypeScript strict config in `tsconfig.json` per plan.md
- [X] T002 [P] Configure Jest test framework and TypeScript runner in `jest.config.js` with virtual timer support
- [X] T003 [P] Implement tactical utilitarian dark theme color tokens and HUD styling constants in `src/theme/colors.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core interfaces, data types, and test doubles that MUST be complete before ANY user story can be implemented.

⚠️ **CRITICAL**: No user story work can begin until this foundational phase is complete.

- [X] T004 Define core telemetry types and validation helpers in `src/data/model/DroneTelemetry.ts` enforcing constraints from data-model.md for `DroneTelemetry.timestamp`, `DroneTelemetry.latitude`, `DroneTelemetry.longitude`, `DroneTelemetry.altitudeMeters`, `DroneTelemetry.airspeedMps`, `DroneTelemetry.headingDegrees`, and `DroneTelemetry.batteryPercentage`
- [X] T005 [P] Implement `TelemetrySource` interface and subscription types in `src/data/source/TelemetrySource.ts` conforming to contracts/telemetry-source.contract.ts and `ConnectionState` in data-model.md
- [X] T006 [P] Create controllable test double `FakeTelemetrySource` in `tests/fakes/FakeTelemetrySource.ts` with packet injection and stream control methods per Constitution Principle V
- [X] T007 [P] Implement SQLite database manager and table creation in `src/data/local/FlightDatabase.ts` creating table `flight_records` with constraints from data-model.md for `FlightRecord.id`, `FlightRecord.startTimeMillis`, `FlightRecord.endTimeMillis`, `FlightRecord.durationSeconds`, `FlightRecord.maxAltitudeMeters`, `FlightRecord.averageSpeedMps`, and `FlightRecord.minBatteryPercentage`
- [X] T008 [P] Create in-memory mock `FakeFlightRecordDao` in `tests/fakes/FakeFlightRecordDao.ts` implementing contracts/flight-record-dao.contract.ts for deterministic unit testing

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 - Real-Time Flight Telemetry Monitoring (Priority: P1) 🎯 MVP

**Goal**: Operator can connect to a telemetry stream and view real-time flight metrics (altitude, airspeed, heading, battery level) with live GPS coordinate breadcrumbs updating within 100ms.

**Independent Test**: Connect to `FakeTelemetrySource`, emit packets, and verify dashboard state and tactical HUD widgets render updated telemetry and append breadcrumbs within 100ms without interface stutter (SC-001).

### Tests for User Story 1

> **NOTE: Write these tests FIRST and ensure they FAIL before implementing hook and UI logic.**

- [X] T009 [P] [US1] Unit test for real-time telemetry streaming and breadcrumb trail updates in `tests/unit/presentation/useTelemetryDashboard.test.ts`

### Implementation for User Story 1

- [X] T010 [US1] Define presentation UI state and breadcrumb models in `src/presentation/state/DashboardUiState.ts` citing constraints from data-model.md for `DashboardUiState.connectionState`, `DashboardUiState.telemetry`, `DashboardUiState.isStale`, `DashboardUiState.breadcrumbs`, `DashboardUiState.errorMessage`, `BreadcrumbPoint.latitude`, `BreadcrumbPoint.longitude`, and `BreadcrumbPoint.timestamp`
- [X] T011 [US1] Implement primary presentation hook `useTelemetryDashboard` in `src/presentation/hooks/useTelemetryDashboard.ts` subscribing to `TelemetrySource` and maintaining in-memory breadcrumbs
- [X] T012 [P] [US1] Implement tactical HUD metric card grid `TelemetryGrid` in `src/presentation/components/TelemetryGrid.tsx` rendering altitude, airspeed, heading, and battery
- [X] T013 [P] [US1] Implement connection status badge `ConnectionStatusBadge` in `src/presentation/components/ConnectionStatusBadge.tsx` displaying current `ConnectionState`
- [X] T014 [US1] Integrate `TelemetryGrid`, `ConnectionStatusBadge`, and `useTelemetryDashboard` into primary dashboard screen `app/(tabs)/index.tsx`

**Checkpoint**: At this point, User Story 1 is fully functional and testable independently as an MVP.

---

## Phase 4: User Story 2 - Automated Disconnect Detection & Stale Telemetry Retention (Priority: P2)

**Goal**: Automated 3-second heartbeat watchdog timer detects signal loss, transitions link status to `Disconnected` (or `Error`), and retains last-known telemetry values with a visible stale-data warning rather than clearing the display.

**Independent Test**: Interrupt packet stream for >= 3000ms using virtual timers (`jest.advanceTimersByTime(3000)`) and assert state transitions to `Disconnected` with `isStale: true` while preserving last-known metrics; verify packet resumption clears stale flag (SC-002, SC-003).

### Tests for User Story 2

> **NOTE: Write these tests FIRST and ensure they FAIL before implementing watchdog logic.**

- [X] T015 [P] [US2] Unit tests for 3-second heartbeat watchdog timer, timeout transitions, stale data retention, and recovery in `tests/unit/presentation/useTelemetryWatchdog.test.ts`

### Implementation for User Story 2

- [X] T016 [US2] Implement 3-second heartbeat watchdog timer logic and state transitions in `src/presentation/hooks/useTelemetryDashboard.ts` adhering to watchdog rules in data-model.md and research.md
- [X] T017 [P] [US2] Implement stale data warning banner `StaleDataWarningBanner` in `src/presentation/components/StaleDataWarningBanner.tsx` displaying visual alert when `isStale` is true
- [X] T018 [US2] Integrate `StaleDataWarningBanner` and watchdog recovery handling into `app/(tabs)/index.tsx`

**Checkpoint**: User Stories 1 AND 2 work together independently; link disconnects cleanly trigger watchdog warnings while retaining situational awareness.

---

## Phase 5: User Story 3 - Flight Termination & Session Summary Recording (Priority: P3)

**Goal**: Calculate and persist an end-of-flight summary (start time, end time, duration, peak altitude, average speed, minimum battery) to local SQLite when flight finishes (stream ends or battery reaches 0%), preventing session fragmentation across micro-drops and clearing in-memory breadcrumbs.

**Independent Test**: Simulate flight packets, trigger stream termination or 0% battery, and verify via `FlightRecordDao` that exactly one consolidated summary record is persisted to SQLite with accurate aggregates and in-memory breadcrumbs are cleared (SC-004, SC-005, SC-006).

### Tests for User Story 3

> **NOTE: Write these tests FIRST and ensure they FAIL before implementing repository and DAO logic.**

- [X] T019 [P] [US3] Unit tests for `FlightRecordDao` SQLite CRUD operations in `tests/unit/data/FlightRecordDao.test.ts`
- [X] T020 [P] [US3] Unit tests for `DroneTelemetryRepository` running session aggregation, micro-drop resilience, and flight termination persistence in `tests/unit/data/DroneTelemetryRepository.test.ts`

### Implementation for User Story 3

- [X] T021 [US3] Implement SQLite DAO `FlightRecordDao` in `src/data/local/FlightRecordDao.ts` executing queries with constraints from data-model.md for `FlightRecord.id`, `FlightRecord.startTimeMillis`, `FlightRecord.endTimeMillis`, `FlightRecord.durationSeconds`, `FlightRecord.maxAltitudeMeters`, `FlightRecord.averageSpeedMps`, and `FlightRecord.minBatteryPercentage`
- [X] T022 [US3] Implement running session aggregator and flight lifecycle coordination in `src/data/repository/DroneTelemetryRepository.ts` adhering to contracts/telemetry-repository.contract.ts
- [X] T023 [US3] Wire repository flight termination and breadcrumb cleanup into `src/presentation/hooks/useTelemetryDashboard.ts` to clear in-memory coordinates upon session completion per FR-010 and SC-005

**Checkpoint**: All three user stories are complete and independently verifiable. Real-time telemetry, fail-safe watchdog, and SQLite session persistence operate cohesively.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: System integration, route scaffolding, type verification, and end-to-end test execution.

- [X] T024 [P] Scaffold root navigation shell and tab layout in `app/_layout.tsx` and `app/(tabs)/_layout.tsx`
- [X] T025 Execute TypeScript compiler check (`npx tsc --noEmit`) and resolve any strict typing issues across codebase
- [X] T026 Run full test suite (`npm test`) validating all scenarios in quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

```
┌──────────────────────────────────────────────┐
│             Phase 1: Setup                   │
└──────────────────────┬───────────────────────┘
                       │
┌──────────────────────▼───────────────────────┐
│          Phase 2: Foundational               │ (BLOCKS all user stories)
└──────┬───────────────┬────────────────┬──────┘
       │               │                │
┌──────▼──────┐ ┌──────▼──────┐  ┌──────▼──────┐
│  Phase 3:   │ │  Phase 4:   │  │  Phase 5:   │
│ User Story 1│ │ User Story 2│  │ User Story 3│
│    (P1)     │ │    (P2)     │  │    (P3)     │
└──────┬──────┘ └──────┬──────┘  └──────┬──────┘
       │               │                │
       └───────────────┼────────────────┘
                       │
┌──────────────────────▼───────────────────────┐
│              Phase 6: Polish                 │
└──────────────────────────────────────────────┘
```

- **Setup (Phase 1)**: Can begin immediately. No dependencies.
- **Foundational (Phase 2)**: Depends on Phase 1 completion. Blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion. Can be delivered as standalone MVP.
- **User Story 2 (Phase 4)**: Depends on Phase 2 and hooks into `useTelemetryDashboard` from Phase 3.
- **User Story 3 (Phase 5)**: Depends on Phase 2 foundational DAO and integrates into repository and presentation layers.
- **Polish (Phase 6)**: Depends on all user story phases being completed.

### Parallel Opportunities

- **Phase 1 (Setup)**: T002 and T003 can execute in parallel after T001.
- **Phase 2 (Foundational)**: T005, T006, T007, and T008 can all execute in parallel once T004 is defined.
- **Phase 3 (User Story 1)**: T009 (test), T012 (`TelemetryGrid`), and T013 (`ConnectionStatusBadge`) can be developed in parallel before T014 integration.
- **Phase 4 (User Story 2)**: T015 (test) and T017 (`StaleDataWarningBanner`) can be developed in parallel.
- **Phase 5 (User Story 3)**: T019 (DAO test) and T020 (repository test) can be written in parallel.
- **Phase 6 (Polish)**: T024 can proceed in parallel with unit test verification.

---

## Parallel Execution Examples

### User Story 1 (P1)
```bash
# Launch UI components and tests in parallel:
Task: "Unit test for real-time telemetry streaming in tests/unit/presentation/useTelemetryDashboard.test.ts"
Task: "Implement tactical HUD metric card grid in src/presentation/components/TelemetryGrid.tsx"
Task: "Implement connection status badge in src/presentation/components/ConnectionStatusBadge.tsx"
```

### User Story 2 (P2)
```bash
# Launch test and stale UI banner in parallel:
Task: "Unit tests for 3-second heartbeat watchdog timer in tests/unit/presentation/useTelemetryWatchdog.test.ts"
Task: "Implement stale data warning banner in src/presentation/components/StaleDataWarningBanner.tsx"
```

### User Story 3 (P3)
```bash
# Launch DAO and repository unit tests in parallel:
Task: "Unit tests for FlightRecordDao SQLite CRUD operations in tests/unit/data/FlightRecordDao.test.ts"
Task: "Unit tests for DroneTelemetryRepository in tests/unit/data/DroneTelemetryRepository.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Phase 1: Setup (T001 - T003)
2. Complete Phase 2: Foundational (T004 - T008)
3. Complete Phase 3: User Story 1 (T009 - T014)
4. **Validate**: Verify real-time streaming HUD in emulator with `FakeTelemetrySource`. This delivers a functional, demonstratable MVP!

### Incremental Delivery
1. Add User Story 2 (T015 - T018): Introduce the 3-second watchdog timer, stale retention, and visual warning banner.
2. Add User Story 3 (T019 - T023): Introduce SQLite persistence for mission summaries, running session aggregation, and automatic breadcrumb memory reclamation.
3. Polish (T024 - T026): Navigation shell, final TypeScript compilation check, and complete deterministic test suite pass.
