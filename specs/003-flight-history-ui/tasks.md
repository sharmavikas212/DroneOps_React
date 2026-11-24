---
description: "Task list for Flight History UI (Browse, Search, Inspect Details, and Delete) implementation"
---

# Tasks: Flight History UI (Browse, Search, Inspect, Delete)

**Input**: Design documents from `specs/003-flight-history-ui/`  
**Prerequisites**: [plan.md](./plan.md) (required), [spec.md](./spec.md) (required), [data-model.md](./data-model.md), [contracts/](./contracts/), [research.md](./research.md), [quickstart.md](./quickstart.md), [.specify/memory/constitution.md](../../.specify/memory/constitution.md)

**Tests**: Tests are mandatory per Constitution Principle V ("Automated tests MUST be 100% deterministic") and verification gates. Deterministic unit tests are included for each user story and must use fake timers (`jest.useFakeTimers()`) and controllable test doubles (`FakeFlightRecordDao`).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., [US1], [US2], [US3], [US4], [US5]). Omitted for Setup, Foundational, and Polish phases.
- Exact file paths are included in all task descriptions.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Presentation state models, deletion target interfaces, and base types for flight history management.

- [X] T001 Expand `FlightHistoryUiState` interface and initial state in `src/presentation/state/FlightHistoryUiState.ts` citing constraints from `data-model.md` for `FlightHistoryUiState.searchQuery`, `FlightHistoryUiState.filteredRecords`, `FlightHistoryUiState.selectedRecord`, `FlightHistoryUiState.isDeleting`, `FlightHistoryUiState.isEmpty`, and `FlightHistoryUiState.isSearchEmpty` conforming to `contracts/flight-history-controller.contract.ts`
- [X] T002 [P] Define `DeleteTarget` interface in `src/presentation/state/FlightHistoryUiState.ts` citing constraints from `data-model.md` for `DeleteTarget.type`, `DeleteTarget.recordId`, `DeleteTarget.recordSummary`, and `DeleteTarget.totalCount`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core controller evolution, in-memory search filtering, selection handling, and DAO deletion logic that MUST be complete before user story UI integration.

⚠️ **CRITICAL**: No user story UI work can begin until this foundational phase is complete.

- [X] T003 [P] Create unit test suite for `FlightHistoryController` in `tests/unit/presentation/FlightHistoryController.test.ts` testing initial state, record loading, search query filtering, detail selection, single deletion, bulk clearing, and error handling using `FakeFlightRecordDao`
- [X] T004 Enhance `FlightHistoryController` in `src/presentation/state/FlightHistoryController.ts` implementing `setSearchQuery`, `clearSearchQuery`, `selectRecord`, `deleteRecord`, and `clearAllRecords` methods citing constraints from `data-model.md` for `FlightHistoryUiState.records`, `FlightHistoryUiState.isLoading`, and `FlightHistoryUiState.errorMessage` conforming to `contracts/flight-history-controller.contract.ts`
- [X] T005 Update presentation hook `useFlightHistory` in `src/presentation/hooks/useFlightHistory.ts` exposing reactive state (`searchQuery`, `filteredRecords`, `selectedRecord`, `isDeleting`, `isSearchEmpty`) and handlers (`setSearchQuery`, `clearSearchQuery`, `selectRecord`, `deleteRecord`, `clearAllRecords`) conforming to `contracts/flight-history-controller.contract.ts`

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 - Chronological Flight Log Browsing & Overview (Priority: P1) 🎯 MVP

**Goal**: Operator can view a reverse-chronological list of flight cards with key summary metrics (time, duration, peak alt, avg speed, min battery with status colors), pull-to-refresh, and empty/error states.

**Independent Test**: Load the History view with saved flight records and verify all records appear in reverse-chronological order with timestamps, formatted duration, peak altitude, average speed, and minimum battery percentage color-coded (FR-001, FR-002, FR-003, FR-015, FR-016, FR-017, SC-001, SC-006).

### Tests for User Story 1

> **NOTE: Write these tests FIRST and ensure they FAIL before implementing component updates.**

- [X] T006 [P] [US1] Unit test for `FlightHistoryCard` metric formatting and battery status colors in `tests/unit/presentation/FlightHistoryCard.test.tsx` citing constraints from `data-model.md` for `FlightRecord.startTimeMillis`, `FlightRecord.durationSeconds`, `FlightRecord.maxAltitudeMeters`, `FlightRecord.averageSpeedMps`, and `FlightRecord.minBatteryPercentage`

### Implementation for User Story 1

- [X] T007 [US1] Update `FlightHistoryCard` in `src/presentation/components/FlightHistoryCard.tsx` adding `onPress` and `onDeletePress` props and touchable interaction citing constraints from `data-model.md` for `FlightRecord.startTimeMillis`, `FlightRecord.durationSeconds`, `FlightRecord.maxAltitudeMeters`, `FlightRecord.averageSpeedMps`, and `FlightRecord.minBatteryPercentage` conforming to `contracts/flight-history-components.contract.ts`
- [X] T008 [US1] Update `app/(tabs)/history.tsx` to render reverse-chronological flight summaries with pull-to-refresh, count badge, and error alert using `useFlightHistory` with zero business logic per Constitution Principle II

**Checkpoint**: User Story 1 is fully functional and testable independently as an MVP.

---

## Phase 4: User Story 2 - Instant Search & Filter by Flight Date or Identifier (Priority: P2)

**Goal**: Operator can filter flight logs in real time by typing into a search input, see matching count, clear query with one tap, or view "No matching records" state.

**Independent Test**: Enter partial date string or UUID in search bar and verify list filters in < 100ms; tap clear button to immediately restore all records; enter non-matching query to verify "No matching flight records" state (FR-004, FR-005, FR-006, FR-007, SC-002, SC-006).

### Tests for User Story 2

> **NOTE: Write these tests FIRST and ensure they FAIL before implementing search components.**

- [X] T009 [P] [US2] Unit test for `FlightSearchBar` query input, clear button, and result count badge in `tests/unit/presentation/FlightSearchBar.test.tsx`

### Implementation for User Story 2

- [X] T010 [P] [US2] Implement tactical `FlightSearchBar` component in `src/presentation/components/FlightSearchBar.tsx` with search icon, text input, clear button, and result count badge conforming to `contracts/flight-history-components.contract.ts`
- [X] T011 [US2] Integrate `FlightSearchBar` and "No matching flight records" tactical state with quick-clear action into `app/(tabs)/history.tsx` wired to `searchQuery`, `filteredRecords`, `setSearchQuery`, and `clearSearchQuery` from `useFlightHistory`

**Checkpoint**: User Stories 1 AND 2 work together independently.

---

## Phase 5: User Story 3 - Inspecting In-Depth Flight Details (Priority: P2)

**Goal**: Operator can tap any flight card to open a tactical in-screen modal displaying all flight summary attributes (UUID, exact start/end timestamps, duration, max altitude, avg speed, min battery) and dismiss it without losing list scroll position or search filter.

**Independent Test**: Tap a flight card to verify `FlightDetailModal` opens in < 100ms showing complete operational metrics; dismiss modal and assert return to exact previous scroll position and search state (FR-008, FR-009, FR-010, SC-003).

### Tests for User Story 3

> **NOTE: Write these tests FIRST and ensure they FAIL before implementing detail modal.**

- [X] T012 [P] [US3] Unit test for `FlightDetailModal` metric rendering, timestamp formatting, and dismiss/delete callbacks in `tests/unit/presentation/FlightDetailModal.test.tsx` citing constraints from `data-model.md` for `FlightRecord.id` and `FlightRecord.endTimeMillis`

### Implementation for User Story 3

- [X] T013 [P] [US3] Implement `FlightDetailModal` component in `src/presentation/components/FlightDetailModal.tsx` displaying complete mission metadata, dismiss button, and delete action button citing constraints from `data-model.md` for `FlightRecord.id` and `FlightRecord.endTimeMillis` conforming to `contracts/flight-history-components.contract.ts`
- [X] T014 [US3] Integrate `FlightDetailModal` into `app/(tabs)/history.tsx` wired to `selectedRecord` and `selectRecord` from `useFlightHistory`

**Checkpoint**: User Stories 1, 2, AND 3 work together independently.

---

## Phase 6: User Story 4 - Safe Deletion of Individual Flight Records (Priority: P3)

**Goal**: Operator can delete an individual flight record with explicit confirmation in a tactical dialog, updating storage and UI immediately.

**Independent Test**: Tap delete on a flight card or in detail view, verify confirmation dialog appears, cancel to confirm record remains intact; re-trigger delete, confirm dialog, and assert record is permanently removed from storage and UI immediately (FR-011, FR-012, FR-014, SC-004, SC-005).

### Tests for User Story 4

> **NOTE: Write these tests FIRST and ensure they FAIL before implementing confirmation dialog.**

- [X] T015 [P] [US4] Unit test for `TacticalConfirmDialog` danger styling, confirmation dispatch, cancellation, and loading state in `tests/unit/presentation/TacticalConfirmDialog.test.tsx`

### Implementation for User Story 4

- [X] T016 [P] [US4] Implement `TacticalConfirmDialog` component in `src/presentation/components/TacticalConfirmDialog.tsx` with tactical danger styling, warning message, confirm and cancel buttons conforming to `contracts/flight-history-components.contract.ts`
- [X] T017 [US4] Wire single-record deletion confirmation into `app/(tabs)/history.tsx` connecting card delete and detail modal delete actions to `deleteRecord` from `useFlightHistory`

**Checkpoint**: User Stories 1, 2, 3, AND 4 work together independently.

---

## Phase 7: User Story 5 - Bulk Purge of Flight History (Priority: P3)

**Goal**: Operator can clear all flight logs via a "Clear All" action in the History screen header, guarded by a safety confirmation dialog.

**Independent Test**: Tap "Clear All" in History header, verify double-confirmation warning appears; cancel and assert logs remain; re-trigger, confirm purge, and assert all records are removed from SQLite and `EmptyHistoryState` displays immediately (FR-013, FR-014, FR-015, SC-004, SC-005, SC-006).

### Tests for User Story 5

> **NOTE: Write these tests FIRST and ensure they FAIL before implementing bulk clear header.**

- [X] T018 [P] [US5] Unit test for bulk clear confirmation, state purge, and transition to empty state in `tests/unit/presentation/FlightHistoryBulkClear.test.tsx`

### Implementation for User Story 5

- [X] T019 [US5] Add "Clear All" action button to `app/(tabs)/history.tsx` header wired to `TacticalConfirmDialog` and `clearAllRecords` from `useFlightHistory`

**Checkpoint**: All 5 user stories are complete and functional.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Static typing verification, automated test regression, and quickstart scenario validation across all stories.

- [X] T020 [P] Run static typecheck (`npm run typecheck`) and verify zero diagnostic errors across all components, hooks, and tests
- [X] T021 [P] Run full Jest test suite (`npm test`) ensuring 100% deterministic test pass rate
- [X] T022 Execute end-to-end quickstart validation scenarios from `specs/003-flight-history-ui/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories.
- **User Stories (Phase 3+)**: All depend on Foundational phase completion:
  - User Story 1 (P1): Can start after Foundational phase (Phase 2).
  - User Story 2 (P2): Can start after Foundational phase (Phase 2); integrates with US1 list view.
  - User Story 3 (P2): Can start after Foundational phase (Phase 2); integrates with US1 flight cards.
  - User Story 4 (P3): Can start after Foundational phase (Phase 2); integrates with US1 cards and US3 modal.
  - User Story 5 (P3): Can start after Phase 6 (US4 dialog component); integrates with screen header.
- **Polish (Phase 8)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Independent of other stories. Provides baseline card list in `history.tsx`.
- **US2 (P2)**: Independent logic; attaches `FlightSearchBar` above the US1 list in `history.tsx`.
- **US3 (P2)**: Independent modal component; attaches `onPress` callback to US1 cards.
- **US4 (P3)**: Depends on `TacticalConfirmDialog` (T016); attaches delete callbacks to US1 cards and US3 modal.
- **US5 (P3)**: Reuses `TacticalConfirmDialog` (T016); adds bulk clear button in header.

### Parallel Opportunities

- **Setup**: T001 and T002 can run in parallel.
- **Foundational**: T003 (test) and T004/T005 (controller/hook) can run in parallel / TDD.
- **User Stories**:
  - T006, T009, T012, T015, T018 (test suites) can all be authored in parallel across stories.
  - T010 (`FlightSearchBar`), T013 (`FlightDetailModal`), and T016 (`TacticalConfirmDialog`) are separate component files and can be implemented in parallel.
- **Polish**: T020 and T021 can run in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Phase 1: Setup (`FlightHistoryUiState`).
2. Complete Phase 2: Foundational (`FlightHistoryController`, `useFlightHistory`).
3. Complete Phase 3: User Story 1 (`FlightHistoryCard`, `history.tsx`).
4. **STOP and VALIDATE**: Verify reverse-chronological browsing, metric cards, pull-to-refresh, empty state, and error handling.

### Incremental Delivery
1. Foundation + US1 (MVP): Chronological browsing of flight summaries.
2. Add US2: Real-time search by date or flight ID with quick-clear.
3. Add US3: In-depth metric detail inspection modal.
4. Add US4: Safe individual record deletion with confirmation.
5. Add US5: Bulk flight history purge with confirmation.
6. Phase 8 Polish: Full regression typecheck and quickstart validation.
