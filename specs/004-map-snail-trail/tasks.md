---
description: "Task list for Tactical Map & Live Snail Trail Visualization implementation"
---

# Tasks: Tactical Map & Live Snail Trail Visualization

**Input**: Design documents from `specs/004-map-snail-trail/`  
**Prerequisites**: [plan.md](./plan.md) (required), [spec.md](./spec.md) (required), [data-model.md](./data-model.md), [contracts/](./contracts/), [research.md](./research.md), [quickstart.md](./quickstart.md), [.specify/memory/constitution.md](../../.specify/memory/constitution.md)

**Tests**: Tests are mandatory per Constitution Principle V ("Automated tests MUST be 100% deterministic") and verification gates. Deterministic unit tests are included for each user story and must use fake timers (`jest.useFakeTimers()`) and controllable test inputs.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., [US1], [US2], [US3], [US4], [US5]). Omitted for Setup, Foundational, and Polish phases.
- Exact file paths are included in all task descriptions.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Mathematical projection models, viewport interfaces, and geometric calculation utilities.

- [X] T001 [P] Define `MapViewportState` and `TrailSegment` interfaces in `src/presentation/state/MapViewportState.ts` citing constraints from `data-model.md` for `MapViewportState.centerCoordinate`, `MapViewportState.zoomLevel`, `MapViewportState.metersPerPixel`, `MapViewportState.isAutoFollow`, `MapViewportState.panOffset`, `MapViewportState.viewportWidth`, and `MapViewportState.viewportHeight`
- [X] T002 [P] Implement pure coordinate projection and distance calculations in `src/presentation/utils/tacticalProjection.ts` implementing `geoToScreen`, `screenToGeo`, `calculateDistanceMeters`, and `calculateBearingDegrees` citing constraints from `data-model.md` for `GeoCoordinate.latitude`, `GeoCoordinate.longitude`, `ScreenPoint.x`, and `ScreenPoint.y` conforming to `specs/004-map-snail-trail/contracts/tactical-projection.contract.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Projection unit test coverage and camera viewport tracking hook that MUST be complete before user story UI integration.

⚠️ **CRITICAL**: No user story UI work can begin until this foundational phase is complete.

- [X] T003 [P] Create unit test suite for tactical coordinate projection in `tests/unit/presentation/tacticalProjection.test.ts` verifying forward projection, inverse projection, heading orientation, distance calculation, and scale transformations under boundary coordinates
- [X] T004 [P] Create unit test suite for viewport tracking hook in `tests/unit/presentation/useMapViewport.test.ts` verifying default auto-follow tracking, zoom-level clamping, manual pan offset handling, and re-centering resets citing constraints from `data-model.md` for `MapViewportState.zoomLevel` and `MapViewportState.isAutoFollow`
- [X] T005 Implement `useMapViewport` presentation hook in `src/presentation/hooks/useMapViewport.ts` managing reactive viewport state, camera center coordinates, zoom adjustments, manual pan offsets, and re-center handler citing constraints from `data-model.md` for `MapViewportState.centerCoordinate`, `MapViewportState.zoomLevel`, `MapViewportState.panOffset`, and `MapViewportState.isAutoFollow`

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 - Real-Time Drone Position & Heading on Tactical Map (Priority: P1) 🎯 MVP

**Goal**: Operator can view the drone's real-time geographic position and heading direction on a tactical map view with smooth updates (< 100ms) and an idle state when awaiting telemetry.

**Independent Test**: Connect to active telemetry stream, verify that the drone marker appears at the transmitted coordinates and rotates smoothly to match compass heading (0–359°) (FR-001, FR-002, FR-015, FR-016, SC-001).

### Tests for User Story 1

> **NOTE: Write these tests FIRST and ensure they FAIL before implementing component updates.**

- [X] T006 [P] [US1] Unit test for `DroneMarker` rotation and positioning in `tests/unit/presentation/DroneMarker.test.tsx` verifying screen coordinates and compass heading transform citing constraints from `data-model.md` for `ScreenPoint.x` and `ScreenPoint.y`
- [X] T007 [P] [US1] Unit test for `TacticalMap` base container in `tests/unit/presentation/TacticalMap.test.tsx` verifying idle state ("Awaiting Telemetry Signal"), radar grid rendering, and live drone marker positioning citing constraints from `data-model.md` for `GeoCoordinate.latitude` and `GeoCoordinate.longitude`

### Implementation for User Story 1

- [X] T008 [P] [US1] Implement `DroneMarker` component in `src/presentation/components/DroneMarker.tsx` rendering a high-visibility directional chevron rotated to heading angle with nominal cyan styling conforming to `specs/004-map-snail-trail/contracts/tactical-map-components.contract.ts`
- [X] T009 [US1] Implement tactical radar container `TacticalMap` in `src/presentation/components/TacticalMap.tsx` rendering concentric range rings, cardinal axes, idle status banner, and the drone marker using `useMapViewport` and `tacticalProjection` conforming to `specs/004-map-snail-trail/contracts/tactical-map-components.contract.ts`
- [X] T010 [US1] Integrate `TacticalMap` into `app/(tabs)/index.tsx` replacing textual-only GPS breadcrumb display with the tactical visual map, wired to `useTelemetryContext` with zero business logic per Constitution Principle II

**Checkpoint**: User Story 1 is fully functional and testable independently as an MVP.

---

## Phase 4: User Story 2 - Live Snail Trail (Breadcrumb Path) Visualization (Priority: P1)

**Goal**: Operator can observe a continuous in-memory flight path ("snail trail") tracing behind the drone connecting historical flight coordinates in chronological order.

**Independent Test**: Stream multiple coordinates and verify that a continuous polyline trail connects historical points from takeoff to current position, supporting 3,600+ points smoothly (FR-003, FR-005, FR-006, SC-002, SC-003, SC-005).

### Tests for User Story 2

> **NOTE: Write these tests FIRST and ensure they FAIL before implementing trail components.**

- [X] T011 [P] [US2] Unit test for `SnailTrail` path projection and rendering in `tests/unit/presentation/SnailTrail.test.tsx` verifying sequential coordinate connections and stationary hover deduplication citing constraints from `data-model.md` for `BreadcrumbPoint.latitude`, `BreadcrumbPoint.longitude`, and `BreadcrumbPoint.timestamp`

### Implementation for User Story 2

- [X] T012 [P] [US2] Implement `SnailTrail` component in `src/presentation/components/SnailTrail.tsx` rendering connecting line segments and breadcrumb nodes across sequential projected points citing constraints from `data-model.md` for `ScreenPoint.x` and `ScreenPoint.y` conforming to `specs/004-map-snail-trail/contracts/tactical-map-components.contract.ts`
- [X] T013 [US2] Embed `SnailTrail` into `TacticalMap.tsx` in `src/presentation/components/TacticalMap.tsx` mapping in-memory `breadcrumbs` to screen points using `tacticalProjection.geoToScreen` with stationary hover deduplication

**Checkpoint**: User Stories 1 AND 2 work together independently.

---

## Phase 5: User Story 3 - Launch / Home Position Reference (Priority: P2)

**Goal**: Operator can view a distinct Launch/Home origin marker pinned at the coordinate where telemetry began.

**Independent Test**: Initiate a flight session, verify that the first received GPS coordinate is designated as the Launch/Home point and remains visible throughout the flight (FR-004, FR-005).

### Tests for User Story 3

> **NOTE: Write these tests FIRST and ensure they FAIL before implementing Home marker.**

- [X] T014 [P] [US3] Unit test for `HomeMarker` in `tests/unit/presentation/HomeMarker.test.tsx` verifying origin pin positioning and visual distinction from drone marker citing constraints from `data-model.md` for `HomePoint.latitude` and `HomePoint.longitude`

### Implementation for User Story 3

- [X] T015 [P] [US3] Implement `HomeMarker` component in `src/presentation/components/HomeMarker.tsx` displaying a high-contrast launch anchor symbol conforming to `specs/004-map-snail-trail/contracts/tactical-map-components.contract.ts`
- [X] T016 [US3] Integrate `HomeMarker` into `TacticalMap.tsx` in `src/presentation/components/TacticalMap.tsx` pinning the marker at `breadcrumbs[0]` coordinates when flight telemetry is active

**Checkpoint**: User Stories 1, 2, AND 3 work together independently.

---

## Phase 6: User Story 4 - Map Viewport Controls: Auto-Centering & Manual Exploration (Priority: P2)

**Goal**: Operator can track the drone with auto-centering ("Auto-Follow"), manually drag/zoom to explore surrounding terrain, and tap "RE-CENTER" to smoothly refocus on the drone in < 300ms.

**Independent Test**: Drag map to pause auto-follow, verify "RE-CENTER" button appears, tap "RE-CENTER" to restore auto-follow within 300ms (FR-007, FR-008, FR-009, FR-010, SC-004).

### Tests for User Story 4

> **NOTE: Write these tests FIRST and ensure they FAIL before implementing controls.**

- [X] T017 [P] [US4] Unit test for `MapControls` in `tests/unit/presentation/MapControls.test.tsx` verifying zoom in/out button callbacks and "RE-CENTER" visibility conditioned on `isAutoFollow` citing constraints from `data-model.md` for `MapViewportState.isAutoFollow` and `MapViewportState.zoomLevel`

### Implementation for User Story 4

- [X] T018 [P] [US4] Implement tactical `MapControls` component in `src/presentation/components/MapControls.tsx` rendering zoom in (`+`), zoom out (`-`), and conditional "RE-CENTER" buttons conforming to `specs/004-map-snail-trail/contracts/tactical-map-components.contract.ts`
- [X] T019 [US4] Add manual pan touch handlers and integrate `MapControls` into `TacticalMap.tsx` in `src/presentation/components/TacticalMap.tsx` wiring `onZoomIn`, `onZoomOut`, and `onRecenter` to `useMapViewport`

**Checkpoint**: User Stories 1, 2, 3, AND 4 work together independently.

---

## Phase 7: User Story 5 - Signal Loss Indication & Mission Reset Trail Clearance (Priority: P3)

**Goal**: Operator sees vehicle marker and trail transition to amber caution upon 3-second watchdog timeout retaining last known position; upon flight termination, in-memory trail and markers are completely purged per Principle IV.

**Independent Test**: Interrupt telemetry for > 3 seconds to verify stale caution styling; conclude flight to verify that in-memory trail is completely purged with zero coordinates written to SQLite (FR-011, FR-012, FR-013, FR-014, SC-006, SC-007).

### Tests for User Story 5

> **NOTE: Write these tests FIRST and ensure they FAIL before implementing stale styling updates.**

- [X] T020 [P] [US5] Unit test for stale state and trail clearance in `tests/unit/presentation/TacticalMapStaleReset.test.tsx` verifying amber styling during watchdog timeout and complete trail purging upon `clearBreadcrumbs()`

### Implementation for User Story 5

- [X] T021 [US5] Update `DroneMarker.tsx` and `SnailTrail.tsx` in `src/presentation/components/DroneMarker.tsx` and `src/presentation/components/SnailTrail.tsx` adding amber caution styling (`colors.warning`) when `isStale === true`
- [X] T022 [US5] Update `TacticalMap.tsx` in `src/presentation/components/TacticalMap.tsx` displaying tactical caution banner ("SIGNAL LOST - LAST KNOWN POSITION") during stale connection and ensuring `breadcrumbs.length === 0` resets markers and trails
- [X] T023 [US5] Verify tab navigation state preservation between `app/(tabs)/index.tsx` and `app/(tabs)/history.tsx` ensuring `useTelemetryContext` preserves live breadcrumbs across tab switches without resetting coordinates

**Checkpoint**: All user stories are fully functional and independently testable.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Verification against quickstart scenarios, static type checks, and complete automated test suite execution.

- [X] T024 [P] Update navigation documentation in `docs/migration-matrix.md` reflecting tactical map HUD integration
- [X] T025 Execute static type check (`npm run typecheck`) and resolve any TypeScript strict mode diagnostics across all new and updated files
- [X] T026 Execute automated test suite (`npm test`) ensuring 100% test pass rate with deterministic fakes under `jest.useFakeTimers()`
- [X] T027 Execute end-to-end verification following all 6 scenarios in `specs/004-map-snail-trail/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories.
- **User Stories (Phase 3–7)**:
  - User Story 1 (P1): Can start immediately after Phase 2 (MVP).
  - User Story 2 (P1): Can start after Phase 2; integrates with `TacticalMap` from US1.
  - User Story 3 (P2): Can start after Phase 2; integrates with `TacticalMap`.
  - User Story 4 (P2): Can start after Phase 2; integrates with `useMapViewport` and `TacticalMap`.
  - User Story 5 (P3): Integrates stale states and reset logic into US1–US4 components.
- **Polish (Phase 8)**: Depends on completion of all user story implementations.

### Parallel Opportunities

- Phase 1: T001 and T002 can run in parallel.
- Phase 2: T003 and T004 unit tests can run in parallel.
- Phase 3: T006 and T007 tests can run in parallel; T008 can be implemented in parallel with T007.
- Phase 4: T011 test and T012 component can run in parallel.
- Phase 5: T014 test and T015 component can run in parallel.
- Phase 6: T017 test and T018 component can run in parallel.
- Phase 7: T020 test and T021 component updates can run in parallel.
- Phase 8: T024 can run in parallel with test verification.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (`MapViewportState.ts`, `tacticalProjection.ts`).
2. Complete Phase 2: Foundational (`tacticalProjection.test.ts`, `useMapViewport.ts`, `useMapViewport.test.ts`).
3. Complete Phase 3: User Story 1 (`DroneMarker.tsx`, `TacticalMap.tsx`, `app/(tabs)/index.tsx`).
4. **STOP and VALIDATE**: Verify real-time drone positioning, heading rotation, and idle state on the Dashboard.

### Incremental Delivery

1. Setup + Foundational → Core projection and viewport tracking ready.
2. User Story 1 → Real-time drone position & heading on tactical map (MVP).
3. User Story 2 → In-memory live snail trail (breadcrumb path) tracing aircraft motion.
4. User Story 3 → Launch / Home origin reference marker.
5. User Story 4 → Map viewport controls: Auto-follow, manual pan/zoom, "RE-CENTER" control.
6. User Story 5 → Signal loss caution styling & in-memory trail reset upon flight termination.
7. Polish → Full test suite verification, typecheck, and quickstart validation.
