# Implementation Plan: Navigation Shell & Tab Routing (Dashboard & History)

**Branch**: `002-navigation-shell` | **Date**: 2026-11-24 | **Spec**: [specs/002-navigation-shell/spec.md](./spec.md)

**Input**: Feature specification from `specs/002-navigation-shell/spec.md`

## Summary

Implement the navigation shell and tab routing connecting the primary real-time flight telemetry dashboard (`Dashboard`) and historical mission summaries screen (`History`) in DroneOps. The technical approach utilizes Expo Router's file-based `(tabs)` navigator, a lightweight React Context (`TelemetryContext`) at the tab layout level to ensure continuous, uninterrupted telemetry streaming and 3-second watchdog monitoring across tab switches, and a presentation hook (`useFlightHistory`) adhering strictly to layer boundaries and utilitarian tactical dark theming.

## Technical Context

**Language/Version**: TypeScript 5.3+ (Strict Mode enabled), Node.js v18+ LTS  
**Primary Dependencies**: React Native 0.88+, Expo SDK 58+ (Expo Router 58+, `react-native-safe-area-context`)  
**Storage**: `expo-sqlite` (read access via `FlightRecordDao` for History tab)  
**Testing**: Jest with `jest.useFakeTimers()`, controllable test doubles (`FakeTelemetrySource`, `FakeFlightRecordDao`)  
**Target Platform**: Mobile (Android & iOS via React Native / Expo)  
**Project Type**: Mobile Application  
**Performance Goals**: Tab switching transition `< 100ms` (SC-001); 0% packet loss during background navigation (SC-002); 100% reliable cold-start landing on Dashboard (SC-003); active tab identification `< 1s` in tactical field conditions (SC-004)  
**Constraints**: Zero business logic in `app/` screens; no heavy state-management libraries (Redux/MobX); strictly offline-capable; utilitarian Dark Mode First theming  
**Scale/Scope**: Two primary navigation destinations (`Dashboard` at `/` and `History` at `/history`); background telemetry stream continuity; safe area inset compliance  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Requirement / Constraint | Status | Notes |
|---|---|---|---|
| **I. Scope & Explainability** | Focus on drone operations navigation shell; clean, explainable architecture | **PASS** | Clear, minimalist tab shell connecting live telemetry and past flight logs. |
| **II. Strict Layer Boundaries** | `app/` (screens) -> `src/presentation/` (state/hooks/context) -> `src/data/` (storage/source) | **PASS** | Screens contain zero business logic. Lightweight React Context manages presentation persistence without external DI containers or Redux. |
| **III. Explicit Connection State & 3s Watchdog** | Telemetry and 3-second watchdog must persist across navigation | **PASS** | TelemetryController maintained at `(tabs)/_layout.tsx` via `TelemetryProvider`, ensuring background continuity during navigation. |
| **IV. Summary-Only Persistence & In-Memory Traces** | History screen displays completed flight summaries only | **PASS** | History view queries `FlightRecordDao` for consolidated summaries; no raw packet logs. |
| **V. Deterministic Testing & Controllable Fakes** | 100% deterministic tests; fake timers; controllable fakes | **PASS** | All new components and hooks tested using `jest.useFakeTimers()`, `FakeTelemetrySource`, and `FakeFlightRecordDao`. |
| **Governance: Commit Approval** | No automatic git commits or pushes without explicit user confirmation | **PASS** | All artifacts remain in the working tree. |

*Result*: **All Gates Passed** (No violations detected; no complexity justifications required).

## Project Structure

### Documentation (this feature)

```text
specs/002-navigation-shell/
├── spec.md              # Feature specification
├── plan.md              # This implementation plan
├── research.md          # Technical research & architecture decisions (Phase 0)
├── data-model.md        # Entities, state models, and lifecycle (Phase 1)
├── quickstart.md        # Runnable verification and testing guide (Phase 1)
├── contracts/           # TypeScript interface contracts (Phase 1)
│   ├── navigation-shell.contract.ts
│   ├── telemetry-context.contract.ts
│   └── flight-history.contract.ts
└── checklists/          # Requirements and quality checklists
    └── requirements.md
```

### Source Code (repository root)

```text
app/
├── _layout.tsx                     # Root stack container & dark status bar
└── (tabs)/
    ├── _layout.tsx                 # Tab navigation layout + TelemetryProvider
    ├── index.tsx                   # Dashboard screen (live telemetry HUD)
    └── history.tsx                 # History screen (flight log list & empty state)

src/
├── data/
│   ├── local/
│   │   ├── FlightDatabase.ts       # SQLite database & migrations
│   │   ├── FlightRecordDao.ts      # SQLite DAO
│   │   └── models/
│   │       └── FlightRecordEntity.ts # Database entity
│   ├── model/
│   │   └── DroneTelemetry.ts       # Telemetry data types
│   ├── repository/
│   │   └── DroneTelemetryRepository.ts # Telemetry stream aggregator & persistence
│   └── source/
│       ├── TelemetrySource.ts      # Source interface
│       ├── SimulatedTelemetrySource.ts # Development simulated feed
│       └── FakeTelemetrySource.ts  # Controllable fake source for tests
├── presentation/
│   ├── components/
│   │   ├── ConnectionStatusBadge.tsx # High-contrast connection state badge
│   │   ├── StaleDataWarningBanner.tsx# Watchdog warning banner
│   │   ├── TelemetryGrid.tsx         # Live metrics grid
│   │   ├── TabBarIcon.tsx            # Utilitarian tactical tab icon glyph
│   │   └── EmptyHistoryState.tsx     # Tactical empty state banner for History
│   ├── context/
│   │   └── TelemetryContext.tsx      # React Context & Provider for telemetry continuity
│   ├── hooks/
│   │   ├── useTelemetryDashboard.ts  # Hook subscribing to controller
│   │   ├── useTelemetryContext.ts    # Consumer hook for TelemetryContext
│   │   └── useFlightHistory.ts       # History screen presentation hook
│   └── state/
│       ├── DashboardUiState.ts       # Dashboard UI state & breadcrumbs
│       ├── FlightHistoryUiState.ts   # History UI state definitions
│       └── TelemetryDashboardController.ts # 3s watchdog, telemetry listener, breadcrumbs
└── theme/
    └── colors.ts                     # Tactical dark theme color tokens

tests/
├── unit/
│   ├── presentation/
│   │   ├── TelemetryContext.test.tsx # Context persistence across navigation
│   │   ├── useFlightHistory.test.ts  # History hook states (empty, populated, error)
│   │   └── useTelemetryDashboard.test.ts
│   └── data/
│       ├── FlightRecordDao.test.ts
│       └── DroneTelemetryRepository.test.ts
└── fakes/
    ├── FakeFlightRecordDao.ts        # In-memory fake DAO
    └── FakeTelemetrySource.ts        # Controllable fake telemetry source
```

**Structure Decision**: Standard mobile application layout conforming to Constitution Principle II. File-based routing located under `app/(tabs)/`, pure presentation hooks and context under `src/presentation/`, offline persistence encapsulated under `src/data/local/`, and 100% deterministic tests under `tests/`.

## Complexity Tracking

> *No Constitution violations detected. All gates passed without architectural deviations.*
