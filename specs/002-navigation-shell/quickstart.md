# Quickstart & Verification Guide: Navigation Shell & Tab Routing

**Feature**: Navigation Shell & Tab Routing (Dashboard & History)  
**Branch**: `002-navigation-shell`  
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
Verify all navigation routes, presentation hooks, and contracts compile without type errors:
```bash
npm run typecheck
```
*Expected Outcome*: Exits cleanly with code 0 and no diagnostics.

### 2. Automated Deterministic Test Suite
Execute the entire Jest test suite including navigation shell and presentation tests:
```bash
npm test
```
*Expected Outcome*: All test suites pass cleanly with 100% deterministic fake timers and mock DAOs.

---

## Runnable Verification Scenarios

### Scenario 1: Cold Launch & Default Landing (FR-003, SC-003)
- **Action**: Launch application or mount `<TabLayout />` in test harness.
- **Verification**:
  - The initial rendered route is `index` (Dashboard).
  - The bottom navigation bar is visible with two tabs: "Dashboard" (`⌖`) and "History" (`▤`).
  - "Dashboard" tab displays the active tactical color (`#00E5FF`), while "History" displays inactive color (`#78909C`).

### Scenario 2: Tab Switching Latency & Navigation (FR-001, FR-002, FR-004, SC-001)
- **Action**: Tap on the "History" tab, then tap on the "Dashboard" tab.
- **Verification**:
  - Tapping "History" switches views within 100ms.
  - Active tab indicator shifts immediately to "History".
  - Tapping "Dashboard" returns to the telemetry HUD view within 100ms.

### Scenario 3: Telemetry & Watchdog Continuity Across Tabs (FR-006, FR-007, SC-002, SC-005)
- **Action**:
  1. On Dashboard, connect to telemetry stream (e.g. using `FakeTelemetrySource`).
  2. Confirm incoming telemetry packets and `connectionState === 'Connected'`.
  3. Navigate to the "History" tab and wait 5 simulated seconds.
  4. Emit new telemetry packets during this period.
  5. Navigate back to the "Dashboard" tab.
- **Verification**:
  - Connection remains `Connected`.
  - The 3-second watchdog timer did NOT trigger an erroneous disconnect.
  - Telemetry packet counters and breadcrumbs reflect all packets emitted during navigation.
  - Dashboard view renders the latest live state immediately with zero lag or reconnection cycle.

### Scenario 4: Empty History State Rendering (FR-008)
- **Action**: Navigate to History tab with an empty SQLite database (0 flight records).
- **Verification**:
  - History screen renders the high-contrast empty state banner: `"No flight logs recorded"`.
  - No blank, frozen, or error screen occurs.

### Scenario 5: Populated Flight History Display
- **Action**: Seed SQLite with 2 completed flight summaries and navigate to History tab.
- **Verification**:
  - History screen renders both flight summary cards displaying duration, max altitude, average speed, and date.
