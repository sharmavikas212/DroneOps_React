# Implementation Plan: Flight History UI (Browse, Search, Inspect, Delete)

**Branch**: `003-flight-history-ui` | **Date**: 2026-11-24 | **Spec**: [specs/003-flight-history-ui/spec.md](./spec.md)

**Input**: Feature specification from `specs/003-flight-history-ui/spec.md`

## Summary

Implement the user interface and presentation state to browse, search, inspect in-depth details, and safely delete historical flight summaries stored in SQLite for DroneOps. The technical approach expands the existing presentation layer (`FlightHistoryController`, `FlightHistoryUiState`, `useFlightHistory`) with synchronous in-memory search filtering, an in-screen tactical inspection modal (`FlightDetailModal`), an accessible search component (`FlightSearchBar`), and a high-contrast danger confirmation dialog (`TacticalConfirmDialog`) for individual record deletion and bulk history purging. All operations adhere strictly to Constitution Principle II (strict layer boundaries, zero business logic in screens) and Principle V (deterministic testing with `FakeFlightRecordDao`).

## Technical Context

**Language/Version**: TypeScript 5.3+ (Strict Mode enabled), Node.js v18+ LTS  
**Primary Dependencies**: React Native 0.88+, Expo SDK 58+ (Expo Router 58+, `react-native-safe-area-context`)  
**Storage**: `expo-sqlite` (CRUD operations via `FlightRecordDao` adhering to Principle IV)  
**Testing**: Jest with `jest.useFakeTimers()`, controllable test doubles (`FakeFlightRecordDao`)  
**Target Platform**: Mobile (Android & iOS via React Native / Expo) and Web  
**Project Type**: Mobile Application  
**Performance Goals**: Search filter latency `< 100ms` (SC-002); detail modal open `< 100ms` (SC-003); deletion UI sync `< 100ms` (SC-005); record location in 50+ list `< 5s` (SC-001)  
**Constraints**: Zero business logic in `app/` screens; no heavy state-management libraries (Redux/MobX); strictly offline-capable; utilitarian Dark Mode First theming  
**Scale/Scope**: History view managing local flight summaries (typically 1 to 500+ records); instant search filtering; single-record and bulk deletion safety  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Requirement / Constraint | Status | Notes |
|---|---|---|---|
| **I. Scope & Explainability** | Focused on drone operations flight history review; clean, explainable architecture | **PASS** | Utilitarian mission log management with straightforward, interview-explainable state transitions. |
| **II. Strict Layer Boundaries** | `app/` (screens) -> `src/presentation/` (state/hooks) -> `src/data/` (storage) | **PASS** | Screens contain zero business logic. `FlightHistoryController` handles filtering, selection, and deletion orchestration. Storage is accessed via `IFlightRecordDao`. |
| **III. Explicit Connection State & 3s Watchdog** | Background telemetry & watchdog must remain unaffected | **PASS** | Telemetry background continuity is maintained at `(tabs)/_layout.tsx`; history operations do not touch telemetry connection. |
| **IV. Summary-Only Persistence & In-Memory Traces** | Only post-flight summaries are browsed, searched, and deleted | **PASS** | Queries and deletes operate solely on `FlightRecord` summary entities. |
| **V. Deterministic Testing & Controllable Fakes** | 100% deterministic tests; fake timers; controllable fakes | **PASS** | Controller and UI components tested using `FakeFlightRecordDao` with deterministic async resolution. |
| **Governance: Commit Approval** | No automatic git commits or pushes without explicit user confirmation | **PASS** | All generated code and artifacts remain in working tree for inspection. |

*Result*: **All Gates Passed** (No violations detected; no complexity justifications required).

## Project Structure

### Documentation (this feature)

```text
specs/003-flight-history-ui/
├── spec.md              # Feature specification
├── plan.md              # This implementation plan
├── research.md          # Technical research & architecture decisions (Phase 0)
├── data-model.md        # Entities, state models, and lifecycle (Phase 1)
├── quickstart.md        # Runnable verification and testing guide (Phase 1)
├── contracts/           # TypeScript interface contracts (Phase 1)
│   ├── flight-history-controller.contract.ts
│   └── flight-history-components.contract.ts
└── checklists/          # Requirements quality checklist
    └── requirements.md
```

### Source Code (repository root)

```text
app/
└── (tabs)/
    └── history.tsx                 # History screen view (renders state, forwards events)

src/
├── data/
│   └── local/
│       ├── FlightRecordDao.ts      # SQLite DAO (already provides insert, get, delete, clear)
│       └── models/
│           └── FlightRecordEntity.ts # Summary entity interface
├── presentation/
│   ├── components/
│   │   ├── FlightHistoryCard.tsx   # Card with press and delete action callbacks
│   │   ├── FlightSearchBar.tsx     # Tactical search input with clear button & badge
│   │   ├── FlightDetailModal.tsx   # Detailed mission metrics inspection modal
│   │   ├── TacticalConfirmDialog.tsx # High-contrast danger confirmation dialog
│   │   └── EmptyHistoryState.tsx   # Existing empty state banner
│   ├── hooks/
│   │   └── useFlightHistory.ts     # Presentation hook exposing reactive state and handlers
│   └── state/
│       ├── FlightHistoryUiState.ts # UI state interface with search, selection, and deletion
│       └── FlightHistoryController.ts # In-memory filter, selection, and DAO deletion logic
└── theme/
    └── colors.ts                   # Tactical color tokens
```

**Structure Decision**: Standard DroneOps layered architecture. `app/(tabs)/history.tsx` acts purely as a dumb renderer and event dispatcher; `FlightHistoryController` encapsulates search filtering, detail selection, and deletion dispatching behind `IFlightRecordDao`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*No violations detected.*
