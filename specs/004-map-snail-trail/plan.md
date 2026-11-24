# Implementation Plan: Tactical Map & Live Snail Trail Visualization

**Branch**: `004-map-snail-trail` | **Date**: 2026-11-24 | **Spec**: [specs/004-map-snail-trail/spec.md](./spec.md)

**Input**: Feature specification from `specs/004-map-snail-trail/spec.md`

## Summary

Implement a real-time tactical 2D vector map HUD on the primary Dashboard displaying live drone geographic position, directional heading, a persistent launch/home origin marker, and a continuous in-memory "snail trail" (flight breadcrumb path). The implementation introduces a pure mathematical coordinate projection utility (`tacticalProjection.ts`), an ergonomic viewport tracking hook (`useMapViewport`), and a high-contrast tactical map presentation hierarchy (`TacticalMap`, `DroneMarker`, `HomeMarker`, `SnailTrail`, `MapControls`). All coordinate trail data remains strictly in-memory per Constitution Principle IV, auto-follow tracking accommodates manual panning/zooming with a sub-300ms "RE-CENTER" control, and signal interruptions trigger 3-second watchdog amber stale indicators per Constitution Principle III.

## Technical Context

**Language/Version**: TypeScript 5.3+ (Strict Mode enabled), Node.js v18+ LTS  
**Primary Dependencies**: React Native 0.88+, Expo SDK 58+ (Expo Router 58+, `react-native-safe-area-context`)  
**Storage**: N/A for breadcrumbs (strictly in-memory per Principle IV); existing `expo-sqlite` used only for post-flight summary persistence  
**Testing**: Jest with `jest.useFakeTimers()`, pure mathematical projection unit tests, component rendering tests  
**Target Platform**: Mobile (Android & iOS via React Native / Expo) and Web (`react-native-web`)  
**Project Type**: Mobile Application HUD / Ground Control Station  
**Performance Goals**: Drone position/heading update latency `< 100ms` (SC-001); 60 fps rendering / `< 16ms` frame time (SC-002); support for `>= 3,600` breadcrumb points (SC-003); re-center transition `< 300ms` (SC-004)  
**Constraints**: Zero business logic in `app/` screens (Principle II); in-memory-only live trail (Principle IV); 100% offline-capable with zero external mapping API keys or tile network dependencies; Dark Mode First utilitarian aesthetic  
**Scale/Scope**: Real-time HUD component embedded in the Dashboard screen tracking active flight coordinates and breadcrumb paths across typical mission durations (up to 1 hour at 1 Hz)  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Requirement / Constraint | Status | Notes |
|---|---|---|---|
| **I. Scope & Explainability** | Focused on drone operations telemetry dashboards; simulated telemetry; explainable architecture | **PASS** | Utilitarian tactical HUD with clean, interview-explainable 2D coordinate projections and zero bloated dependencies. |
| **II. Strict Layer Boundaries** | `app/` (screens) -> `src/presentation/` (state/hooks/components) -> `src/data/` | **PASS** | `app/(tabs)/index.tsx` acts purely as a renderer. Viewport tracking logic lives in `useMapViewport`; trail coordinates are provided via `useTelemetryContext`. |
| **III. Explicit Connection State & 3s Watchdog** | Decoupled link state; 3-second watchdog; stale data retention | **PASS** | Map marker and trail visually transition to amber caution upon watchdog timeout, retaining last known position and path. |
| **IV. Summary-Only Persistence & In-Memory Traces** | Snail trail MUST be kept strictly in memory and discarded when flight finishes; zero tick persistence | **PASS** | In-memory `BreadcrumbPoint[]` is cleared upon flight termination; zero coordinates are persisted to SQLite. |
| **V. Deterministic Testing & Controllable Fakes** | 100% deterministic tests; fake timers; controllable fakes | **PASS** | Mathematical projections and map rendering are tested deterministically without real timers or network requests. |
| **Governance: Commit Approval** | No automatic git commits or pushes without explicit user confirmation | **PASS** | All generated code and artifacts remain in working tree for review. |

*Result*: **All Gates Passed** (No violations detected; no complexity justifications required).

## Project Structure

### Documentation (this feature)

```text
specs/004-map-snail-trail/
├── spec.md              # Feature specification
├── plan.md              # This implementation plan
├── research.md          # Technical research & architecture decisions (Phase 0)
├── data-model.md        # Entities, state models, and lifecycle (Phase 1)
├── quickstart.md        # Runnable verification and testing guide (Phase 1)
├── contracts/           # TypeScript interface contracts (Phase 1)
│   ├── tactical-map-components.contract.ts
│   └── tactical-projection.contract.ts
└── checklists/          # Requirements quality checklist
    └── requirements.md
```

### Source Code (repository root)

```text
app/
└── (tabs)/
    └── index.tsx                    # Primary Dashboard screen (embeds TacticalMap)

src/
├── presentation/
│   ├── components/
│   │   ├── TacticalMap.tsx          # Main tactical HUD map container with radar grid
│   │   ├── DroneMarker.tsx          # Rotating tactical chevron / heading indicator
│   │   ├── HomeMarker.tsx           # Launch / Home origin pin marker
│   │   ├── SnailTrail.tsx           # Continuous polyline / breadcrumb path renderer
│   │   └── MapControls.tsx          # High-contrast zoom (+/-) and Re-center controls
│   ├── hooks/
│   │   └── useMapViewport.ts        # Presentation hook managing viewport camera, pan, zoom, auto-follow
│   └── utils/
│       └── tacticalProjection.ts    # Pure projection arithmetic (geoToScreen, screenToGeo, bearing, distance)
└── theme/
    └── colors.ts                    # Tactical theme tokens (background, primary cyan, warning amber)
```

**Structure Decision**: Standard DroneOps layered architecture. `src/presentation/utils/tacticalProjection.ts` provides pure, testable coordinate transformations. `useMapViewport` encapsulates camera pan/zoom/auto-follow behavior. `TacticalMap` assembles markers, trails, and controls into an integrated HUD component mounted inside `app/(tabs)/index.tsx`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*No violations detected.*
