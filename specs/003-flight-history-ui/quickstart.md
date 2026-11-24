# Quickstart & Verification Guide: Flight History UI

**Feature**: Flight History UI (Browse, Search, Inspect, Delete)  
**Branch**: `003-flight-history-ui`  
**Date**: 2026-11-24  
**Spec Reference**: [spec.md](./spec.md)  
**Data Model**: [data-model.md](./data-model.md)  
**Contracts**: [contracts/](./contracts/)

---

## Prerequisites

- Node.js v18+ LTS
- Project dependencies installed (`npm install`)
- TypeScript compiler (`npx tsc --noEmit`)

---

## Verification Commands

### 1. Static Type Checking
Verify all data models, controllers, presentation hooks, and UI components compile without type errors:
```bash
npm run typecheck
```
*Expected Outcome*: Exits cleanly with code 0 and no diagnostic errors.

### 2. Automated Deterministic Test Suite
Execute the entire Jest test suite including controller unit tests and component rendering tests:
```bash
npm test
```
*Expected Outcome*: All test suites pass cleanly using 100% deterministic test doubles (`FakeFlightRecordDao`).

---

## Runnable Verification Scenarios

### Scenario 1: Chronological Browsing & Metric Display (FR-001, FR-002, FR-003, SC-001)
- **Preconditions**: SQLite contains multiple completed flight records with diverse timestamps and metrics.
- **Action**: Open the History tab (`/history`).
- **Verification**:
  - All records are listed in reverse-chronological order (most recent first).
  - Each card displays formatted start time, duration in minutes/seconds, peak altitude (`m`), average speed (`m/s`), and min battery percentage.
  - Minimum battery percentage reflects correct semantic colors: Green (> 50%), Amber (20-50%), Red (< 20%).

### Scenario 2: Real-Time Search & Query Reset (FR-004, FR-005, FR-006, SC-002)
- **Action**: Enter a partial date string (e.g. `"Nov 24"` or `"2026-11"`) or partial UUID into the search bar.
- **Verification**:
  - The list immediately filters in < 100ms, displaying only matching flight records.
  - The result count badge reflects the number of filtered records (e.g. `"2 of 10"`).
  - Tapping the clear button (`✕`) immediately restores the full list and clears the text input.

### Scenario 3: Empty Search Result & Quick Clear (FR-007, SC-006)
- **Action**: Enter a search query with no matching records (e.g. `"nomatch999"`).
- **Verification**:
  - The record list is replaced by a tactical "No matching flight records found" indicator.
  - A quick-action button ("Clear Search") is displayed.
  - Tapping "Clear Search" resets the filter and restores all records.

### Scenario 4: Detail Modal Inspection & Return (FR-008, FR-009, FR-010, SC-003)
- **Action**: Tap any flight record card from the list.
- **Verification**:
  - The `FlightDetailModal` overlay opens in < 100ms.
  - All detailed metrics are visible: Flight UUID, Start Timestamp, End Timestamp, Duration, Peak Altitude, Average Speed, and Minimum Battery.
  - Tapping the Close (`✕`) button dismisses the modal, returning to the exact list scroll position without reloading.

### Scenario 5: Safe Individual Record Deletion with Confirmation (FR-011, FR-012, FR-014, SC-004, SC-005)
- **Action**:
  1. Tap the delete icon button on a flight card or inside the detail modal.
  2. Verify the `TacticalConfirmDialog` appears with title "DELETE FLIGHT RECORD" and a warning that deletion is permanent.
  3. Tap "DELETE".
- **Verification**:
  - The record is permanently removed from SQLite and memory in < 100ms.
  - The visible list updates immediately and the total record count decrements by 1.
  - If the detail modal was open for this record, it automatically closes.

### Scenario 6: Cancellation of Deletion Prompt (FR-012, SC-004)
- **Action**:
  1. Tap the delete icon button on a flight card.
  2. In the confirmation dialog, tap "CANCEL".
- **Verification**:
  - The confirmation dialog closes.
  - The flight record remains in the list and in SQLite with zero modification.

### Scenario 7: Bulk Purge of Flight History with Confirmation (FR-013, FR-014, FR-015, SC-004)
- **Action**:
  1. Tap the "Clear All" action button in the History screen header.
  2. Confirm the safety dialog warning that all records will be permanently erased.
  3. Tap "PURGE ALL".
- **Verification**:
  - All records are erased from SQLite.
  - The UI immediately transitions to `EmptyHistoryState` ("NO FLIGHT LOGS RECORDED").

### Scenario 8: Error Banner & Recovery on Storage Failure (FR-017, SC-006)
- **Action**: Trigger a DAO failure (simulated via `FakeFlightRecordDao` throwing an error).
- **Verification**:
  - A non-blocking tactical warning banner is displayed at the top of the screen ("⚠️ Failed to load flight records").
  - The application remains responsive without crashing.
