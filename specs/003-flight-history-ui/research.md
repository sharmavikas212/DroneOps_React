# Research & Technical Decisions: Flight History UI (Browse, Search, Inspect, Delete)

**Feature**: Flight History UI  
**Branch**: `003-flight-history-ui`  
**Date**: 2026-11-24  
**Spec Reference**: [spec.md](./spec.md)

---

## 1. Search & Filter Architecture (In-Memory Filter vs. SQLite Query)

### Context
FR-003, FR-004, FR-005, and SC-002 require real-time text searching across flight records by date, timestamp, and flight identifier with sub-100ms response time.

### Decision
Implement in-memory filtering directly in `FlightHistoryController` across the loaded `FlightRecord[]` collection:
- `searchQuery` state string tracks user input.
- Filtering normalizes the search query (lowercase, trimmed) and matches against:
  1. Formatted flight date/time strings (e.g., month, day, year, time components).
  2. ISO timestamp strings and epoch millisecond representations.
  3. Unique flight record identifier (`record.id`).
- `filteredRecords` is recalculated synchronously in the controller upon every query change.

### Rationale
- **Performance**: In accordance with Constitution Principle IV, only completed flight summaries are stored (not high-frequency raw telemetry ticks). A single ground station typically stores between tens and hundreds of flight summaries (rarely exceeding 1,000). In-memory array filtering on 1,000 summary objects executes in under 2ms, comfortably exceeding SC-002 (< 100ms) with zero UI lag.
- **Simplicity & Zero Disk I/O**: Eliminates debouncing complexity, SQLite connection contention, and asynchronous query race conditions during rapid keyboard typing.
- **Deterministic Testing**: Testing the controller's search filtering requires zero async delays or complex mock SQL statements.

### Alternatives Considered
- **SQLite `LIKE` / Full-Text Search (FTS)**: Querying SQLite on every keystroke introduces disk I/O latency, requires debouncing, and adds migration complexity without perceptible benefit for small-to-medium dataset sizes.
- **React Component Local State Filter**: Placing filtering inside `history.tsx` violates Constitution Principle II (screens must contain zero business logic).

---

## 2. Flight Detail Inspection Presentation (In-Screen Modal vs. Stack Route)

### Context
FR-008, FR-009, and FR-010 require inspecting full flight details (exact start/end timestamps, duration, peak altitude, average speed, min battery, and UUID) upon selecting a card, with immediate return to the exact scroll position and active search state upon dismiss.

### Decision
Implement an in-screen tactical modal overlay (`FlightDetailModal`) controlled by `FlightHistoryController.state.selectedRecord`:
- Tapping a flight card dispatches `selectRecord(record)` to the controller.
- The modal renders over the history view displaying complete metrics, formatted timestamps, and an integrated "Delete Log" button.
- Dismissing the modal dispatches `selectRecord(null)` to the controller.

### Rationale
- **State Preservation**: Because the modal renders within the same screen hierarchy, the underlying list scroll offset, active search query, and keyboard state remain completely intact when the modal is closed (FR-010).
- **Sub-100ms Transition**: Opening and closing an in-tree modal is an instant state transition (< 50ms), satisfying SC-003 without screen push transitions or layout re-mounts.
- **Clean Architecture**: Follows Constitution Principle II; navigation routes remain lean (`/` and `/history`).

### Alternatives Considered
- **Expo Router Stack Navigation (`/history/[id]`)**: Pushing a new screen route onto the navigation stack requires route parameter serialization, re-fetching or passing entity data, and resets list scroll position upon popping back to the tab.

---

## 3. Safe Deletion & Confirmation Mechanism (Tactical Dialog vs. Native Alert)

### Context
FR-011, FR-012, FR-013, and SC-004 mandate safe deletion of individual records and bulk purging with explicit confirmation dialogs to prevent accidental data loss in stressful field conditions.

### Decision
Implement a custom in-tree confirmation modal (`TacticalConfirmDialog`):
- Modal displays a high-contrast warning icon, title, description (specifying the target record date/ID or total record count for bulk clear), and dual action buttons: "Cancel" (neutral slate) and "Delete" / "Purge" (high-visibility danger red).
- The dialog supports both single-record deletion confirmation and bulk-clear confirmation.
- Confirmation triggers `controller.deleteRecord(id)` or `controller.clearAllRecords()`.

### Rationale
- **Utilitarian Tactical Styling**: Native mobile alerts (`Alert.alert`) have platform-dependent, OS-enforced light/dark styling that cannot match the DroneOps Dark Mode First tactical theme (deep slate, cyan/red borders).
- **Cross-Platform & Headless Testability**: Native `Alert.alert` is difficult to test deterministically in Jest without heavy native module mocks and behaves inconsistently in React Native Web. A custom component renders predictable test IDs (`confirm-dialog-confirm`, `confirm-dialog-cancel`) and executes 100% deterministically in unit tests (Constitution Principle V).

### Alternatives Considered
- **React Native `Alert.alert`**: Standard mobile alert, but cannot be customized with tactical styling and complicates automated testing in headless environments.
- **Swipe-to-Delete without Confirmation**: Rejected because accidental swipes in tactical outdoor environments would permanently destroy mission logs without recovery.

---

## 4. Presentation State & Controller Evolution

### Context
The existing `FlightHistoryController` and `FlightHistoryUiState` currently only support loading and displaying all records. They must be expanded to manage search queries, filtered results, selected record inspection, deletion loading states, and error handling.

### Decision
Enhance `FlightHistoryUiState` and `FlightHistoryController`:
- **State Properties**:
  - `records: FlightRecord[]`: Full chronological dataset from SQLite.
  - `searchQuery: string`: Current user search text.
  - `filteredRecords: FlightRecord[]`: Filtered subset matching `searchQuery`.
  - `selectedRecord: FlightRecord | null`: Record currently viewed in detail modal.
  - `isDeleting: boolean`: True during asynchronous delete/clear operations.
  - `isLoading: boolean`: True during initial fetch or pull-to-refresh.
  - `errorMessage: string | null`: Error message if load or delete operations fail.
  - `isEmpty: boolean`: True when `records.length === 0` (global empty state).
  - `isSearchEmpty: boolean`: True when `records.length > 0` but `filteredRecords.length === 0`.
- **Controller Methods**:
  - `loadRecords()`: Loads records from `dao`, updates `records`, and evaluates `filteredRecords`.
  - `setSearchQuery(query: string)`: Updates query and re-evaluates `filteredRecords`.
  - `clearSearchQuery()`: Resets query to empty string.
  - `selectRecord(record: FlightRecord | null)`: Sets the currently inspected record.
  - `deleteRecord(id: string)`: Calls `dao.deleteFlightRecord(id)`, removes the record from both `records` and `filteredRecords`, and clears `selectedRecord` if it matches.
  - `clearAllRecords()`: Calls `dao.clearAllFlightRecords()`, purges all records, and sets `isEmpty: true`.
- **Presentation Hook**:
  - `useFlightHistory()`: Subscribes to the controller and exposes reactive state and handler functions to `FlightHistoryScreen`.

### Rationale
- Completely adheres to Constitution Principle II (strict layer boundaries, zero business logic in UI) and Principle V (deterministic testing using `FakeFlightRecordDao`).
- All state changes are synchronized through the controller's subscription mechanism.
