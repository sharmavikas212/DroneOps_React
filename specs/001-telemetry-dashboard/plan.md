# Implementation Plan: Core Telemetry Dashboard & Session Recording

**Branch**: `001-telemetry-dashboard` | **Date**: 2026-11-23 | **Spec**: [specs/001-telemetry-dashboard/spec.md](./spec.md)

**Input**: Feature specification from `specs/001-telemetry-dashboard/spec.md`

## Summary

Implement the foundational telemetry ingestion and flight monitoring layer for DroneOps React Native. This includes an explicit 4-state connection state machine (`Connecting`, `Connected`, `Disconnected`, `Error`), an automated 3-second heartbeat watchdog timer that retains last-known telemetry as stale data upon packet cessation, in-memory tactical GPS breadcrumb tracking, and automated post-flight session summary persistence using local SQLite (`expo-sqlite`).

## Technical Context

**Language/Version**: TypeScript 5.3+ (Strict Mode enabled), Node.js v18+ LTS  
**Primary Dependencies**: React Native 0.76+, Expo SDK 52+, Expo Router, `expo-sqlite`  
**Storage**: `expo-sqlite` (Local SQLite database table `flight_records`)  
**Testing**: Jest with `jest.useFakeTimers()`, controllable test doubles (`FakeTelemetrySource`, `FakeFlightRecordDao`)  
**Target Platform**: Mobile (Android & iOS via React Native / Expo)  
**Project Type**: Mobile Application  
**Performance Goals**: UI updates within 100ms of packet arrival (SC-001); 3-second disconnect detection (SC-002); 60 fps stutter-free HUD rendering  
**Constraints**: Fully offline-capable; zero network dependency for local summary persistence; flat long-term memory footprint (breadcrumb trails cleared on session end, no raw packet persistence)  
**Scale/Scope**: Single active drone stream; real-time HUD dashboard; 3-second fail-safe watchdog; SQLite summary storage  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Requirement / Constraint | Status | Notes |
|---|---|---|---|
| **I. Scope & Explainability** | Drone telemetry operations only; telemetry simulated; explainable design | **PASS** | Clear focus on HUD, watchdog, and summary persistence. |
| **II. Strict Layer Boundaries** | `app/` (screens) -> `src/presentation/` (state/watchdog) -> `src/data/repository/` (aggregator) -> `src/data/source/` & `src/data/local/` | **PASS** | Layer separation enforced; zero external state bloat (no Redux/MobX). |
| **III. Explicit Connection State & 3s Watchdog** | Explicit 4 states (`Connecting`, `Connected`, `Disconnected`, `Error`); 3s watchdog; stale retention | **PASS** | Handled in `useTelemetryDashboard` presentation hook. |
| **IV. Summary-Only Persistence & In-Memory Traces** | Persist only completed summaries to SQLite; live GPS trail in-memory only | **PASS** | SQLite schema stores single consolidated summary; breadcrumbs cleared on termination. |
| **V. Deterministic Testing & Controllable Fakes** | 100% deterministic tests; fake timers; controllable fakes | **PASS** | Full test harness using `jest.useFakeTimers()` and `FakeTelemetrySource`. |
| **Governance: Commit Approval** | No automatic git commits or pushes without explicit user confirmation | **PASS** | All artifacts remain in working tree. |

*Result*: **All Gates Passed** (No violations detected, no complexity justifications required).

## Project Structure

### Documentation (this feature)

```text
specs/001-telemetry-dashboard/
├── spec.md              # Feature specification
├── plan.md              # This implementation plan
├── research.md          # Technical research & architecture decisions
├── data-model.md        # Entities, schema, and state transitions
├── quickstart.md        # Runnable verification and testing guide
├── contracts/           # TypeScript interface contracts
│   ├── telemetry-source.contract.ts
│   ├── flight-record-dao.contract.ts
│   ├── telemetry-repository.contract.ts
│   └── dashboard-state.contract.ts
└── checklists/          # Verification checklists
```

### Source Code (repository root)

```text
app/
├── _layout.tsx                     # Root app layout & theme provider
└── (tabs)/
    ├── _layout.tsx                 # Tab navigation layout
    └── index.tsx                   # Primary Telemetry Dashboard Screen

src/
├── data/
│   ├── local/
│   │   ├── FlightDatabase.ts       # SQLite initialization & schema migration
│   │   ├── FlightRecordDao.ts      # SQLite CRUD implementation
│   │   └── models/
│   │       └── FlightRecordEntity.ts
│   ├── model/
│   │   └── DroneTelemetry.ts       # Core telemetry packet types
│   ├── repository/
│   │   └── DroneTelemetryRepository.ts # Stream coordination & summary aggregation
│   └── source/
│       ├── TelemetrySource.ts      # TelemetrySource interface
│       └── FakeTelemetrySource.ts  # Controllable fake telemetry source
├── presentation/
│   ├── components/
│   │   ├── ConnectionStatusBadge.tsx # High-contrast connection state badge
│   │   ├── StaleDataWarningBanner.tsx# Visible stale telemetry notification
│   │   └── TelemetryGrid.tsx         # Real-time metrics grid (altitude, speed, etc.)
│   ├── hooks/
│   │   └── useTelemetryDashboard.ts # Watchdog timer, link state, and live trail
│   └── state/
│       └── DashboardUiState.ts     # Presentation state definitions
└── theme/
    └── colors.ts                   # Utilitarian tactical dark theme tokens

tests/
├── unit/
│   ├── data/
│   │   ├── FlightRecordDao.test.ts
│   │   └── DroneTelemetryRepository.test.ts
│   └── presentation/
│       └── useTelemetryDashboard.test.ts
└── fakes/
    ├── FakeFlightRecordDao.ts      # In-memory mock DAO for fast deterministic tests
    └── FakeTelemetrySource.ts      # Controllable packet emitter test double
```

**Structure Decision**: Standard React Native / Expo modular architecture following strict layer boundaries defined in Constitution Principle II. Screens in `app/` are lightweight UI views consuming state from `src/presentation/hooks/`, backed by repository and local storage under `src/data/`.

## Complexity Tracking

*No constitution violations or unwarranted architectural complexities. Zero entries.*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| None | N/A | N/A |
