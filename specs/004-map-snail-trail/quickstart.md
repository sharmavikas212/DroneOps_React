# Quickstart & Verification Guide: Tactical Map & Live Snail Trail Visualization

**Feature**: Tactical Map & Live Snail Trail Visualization  
**Branch**: `004-map-snail-trail`  
**Date**: 2026-11-24  
**Spec Reference**: [spec.md](./spec.md)  
**Research Reference**: [research.md](./research.md)  
**Data Model Reference**: [data-model.md](./data-model.md)  
**Contracts Reference**: [contracts/](./contracts/)

---

## Prerequisites

- Node.js v18+ LTS
- Project dependencies installed (`npm install`)
- TypeScript compiler (`npx tsc --noEmit`)

---

## Verification Commands

### 1. Static Type Checking
Verify all data models, projection services, viewport hooks, and tactical map components compile cleanly under TypeScript strict mode:
```bash
npm run typecheck
```
*Expected Outcome*: Exits cleanly with code 0 and zero type diagnostics.

### 2. Automated Deterministic Test Suite
Execute the entire Jest test suite including mathematical projection tests and component rendering tests:
```bash
npm test
```
*Expected Outcome*: All test suites pass cleanly with 100% deterministic test execution under fake timers.

---

## Runnable Verification Scenarios

### Scenario 1: Initial Idle State & First Telemetry Lock (FR-001, FR-004, FR-015)
- **Preconditions**: Application launched on the Dashboard (`/`); telemetry disconnected.
- **Action**: Inspect the tactical map view.
- **Verification**:
  - The map renders a tactical grid with an idle indicator ("Awaiting Telemetry Signal").
  - Tap "CONNECT STREAM".
  - Upon receiving the first telemetry packet, the idle banner clears.
  - A Home/Launch marker appears at the initial GPS coordinate.
  - A cyan drone marker appears at the exact coordinates oriented to the reported compass heading.

### Scenario 2: Live Motion & Snail Trail Accumulation (FR-002, FR-003, FR-005, SC-001, SC-002)
- **Preconditions**: Active flight telemetry streaming from the simulator.
- **Action**: Observe the tactical map for 30–60 seconds.
- **Verification**:
  - The drone marker moves across the tactical map, updating position within 100 ms of each telemetry tick.
  - The vehicle chevron rotates smoothly to match compass heading changes.
  - A high-visibility cyan snail trail connects historical points from the Launch marker to the current drone position.
  - Frame rates remain smooth (60 fps) without stutter or memory spikes.

### Scenario 3: Auto-Follow & Viewport Centering Controls (FR-007, FR-008, FR-009, FR-010, SC-004)
- **Preconditions**: Drone in flight with auto-follow engaged.
- **Action**:
  1. Manually drag/pan the map away from the drone.
  2. Verify auto-follow pauses and the "RE-CENTER" button becomes visible.
  3. Tap the "RE-CENTER" button.
- **Verification**:
  - Auto-follow pauses immediately upon manual pan; the drone marker moves off-center while the trail continues extending.
  - Tapping "RE-CENTER" smoothly re-centers the viewport on the drone and re-engages auto-follow in under 300 ms.
  - Tapping `+` and `-` adjusts the zoom level smoothly.

### Scenario 4: Signal Loss Watchdog & Stale State Retention (FR-011, FR-012, SC-006)
- **Preconditions**: Active flight in progress with accumulated snail trail.
- **Action**: Pause/disconnect the telemetry stream for > 3 seconds (triggering the watchdog timeout).
- **Verification**:
  - The connection status transitions to "Disconnected" and `isStale` becomes `true`.
  - The tactical map marker transitions to an amber caution color.
  - A stale warning overlay ("TACTICAL SIGNAL LOST - LAST KNOWN POSITION") appears.
  - The last known drone position, heading, and the entire historical snail trail remain visibly rendered on the map.
  - Resuming telemetry returns the marker to live cyan and dismisses the caution badge.

### Scenario 5: Flight Termination & In-Memory Trail Reset (FR-006, FR-013, SC-005)
- **Preconditions**: Active flight with dozens of breadcrumb points.
- **Action**: Conclude the flight (battery hits 0% or flight ends).
- **Verification**:
  - Flight summary record is persisted to SQLite.
  - In-memory breadcrumb array is cleared (`clearBreadcrumbs()`).
  - The tactical map resets its trail and Home marker for the next flight session.
  - Zero breadcrumb points or trail coordinates are written to the SQLite database.

### Scenario 6: Tab Navigation State Preservation (FR-014, SC-007)
- **Preconditions**: Active flight with accumulating breadcrumb trail.
- **Action**: Navigate to the History tab (`/history`), wait 5 seconds, and switch back to the Dashboard (`/`).
- **Verification**:
  - Live telemetry continues streaming uninterrupted in the background.
  - Returning to the Dashboard displays the up-to-date snail trail with 100% of points preserved and zero desynchronization.
