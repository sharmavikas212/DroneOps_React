# Research & Technical Decisions: Navigation Shell & Tab Routing

**Feature**: Navigation Shell & Tab Routing (Dashboard & History)  
**Branch**: `002-navigation-shell`  
**Date**: 2026-11-24  
**Spec Reference**: [spec.md](./spec.md)

---

## 1. Expo Router File-Based Tab Navigation Structure

### Context
The application requires a persistent bottom tab navigation shell connecting the primary real-time flight monitoring screen (`Dashboard`) and historical flight log review screen (`History`). Cold starts must land directly on `Dashboard`.

### Decision
Utilize Expo Router's native file-based `(tabs)` route grouping:
- `app/(tabs)/_layout.tsx`: Defines the `<Tabs>` navigator, tab bar styling, icons, and safe area insets.
- `app/(tabs)/index.tsx`: The default initial route rendering the live telemetry HUD (`Dashboard`).
- `app/(tabs)/history.tsx`: The secondary route rendering recorded flight summaries and empty states (`History`).

### Rationale
- Standard Expo Router SDK 52+ file routing provides deterministic route matching, deep linking, and hardware back-button handling on Android.
- `index.tsx` automatically resolves as the default tab route (`/`), satisfying FR-003 and SC-003 without manual redirects.
- Screen transitions execute well within the 100ms threshold (SC-001) as tab views are natively cached within the tab shell container.

### Alternatives Considered
- **Custom Stack / Floating Navigation Bar**: Rejected because manual routing creates edge cases with Android hardware back buttons, deep linking, and safe-area insets without engineering benefit.
- **Drawer Navigation**: Rejected because tactical flight monitoring requires immediate, single-tap switching between live metrics and mission logs; drawer gestures are error-prone in outdoor field conditions.

---

## 2. Background Telemetry Continuity Across Tab Navigation

### Context
FR-006 and FR-007 require that active telemetry streaming, heartbeat watchdog monitoring (3-second timer), and session recording continue uninterrupted when navigating to the History screen. Returning to the Dashboard must immediately display live metrics without reconnection delay.

Currently, `app/(tabs)/index.tsx` instantiates `useTelemetryDashboard` locally. When unmounted or blurred, local component lifecycles risk disposing the controller or tearing down active timers.

### Decision
Introduce a lightweight React Context (`TelemetryContext` and `TelemetryProvider`) positioned at `app/(tabs)/_layout.tsx`:
- The provider instantiates and manages the lifecycle of `TelemetryDashboardController`.
- A dedicated hook `useTelemetryContext()` exposes the reactive `DashboardUiState` and control actions (`connect`, `disconnect`).
- Both `Dashboard` (`index.tsx`) and any other screen or layout component consume the shared context without owning its lifecycle.

### Rationale
- Conforms directly to Constitution Principle II: *"Dependency Wiring: Use manual dependency construction or lightweight React Context. Redux, MobX, heavy DI containers, and unnecessary Clean Architecture boilerplate are prohibited."*
- Decouples the presentation controller from the individual screen component lifecycle, guaranteeing that watchdog ticks and telemetry packets process uninterrupted while the user inspects history (SC-002).
- Zero third-party state libraries; pure React built-in primitives (`useSyncExternalStore` + Context).

### Alternatives Considered
- **Redux Toolkit / Zustand**: Rejected by Constitution Principle II as unnecessary state-bloat boilerplate.
- **Global Module Singleton**: Rejected because singletons hinder deterministic test isolation across parallel test suites. A React Context Provider accepts optional injected props (`source`, `repository`, `controller`), allowing unit tests to supply controllable test fakes (`FakeTelemetrySource`, `FakeFlightRecordDao`) cleanly.

---

## 3. History Screen Presentation & Empty State Architecture

### Context
FR-008 requires the History screen to present recorded flight logs or an informative tactical empty state ("No flight logs recorded") when no summaries exist. Per Constitution Principle II, screens in `app/` must have zero business logic.

### Decision
Create a presentation hook `useFlightHistory` in `src/presentation/hooks/useFlightHistory.ts`:
- Consumes `FlightRecordDao` (or an injected DAO fake in tests).
- Manages state: `records: FlightRecordEntity[]`, `isLoading: boolean`, `errorMessage: string | null`, and `refresh(): Promise<void>`.
- `app/(tabs)/history.tsx` renders purely declarative UI: loading indicator, high-contrast tactical empty state banner, or the list of flight summary cards.

### Rationale
- Maintains strict layer boundaries: UI components in `app/(tabs)/history.tsx` only render state and trigger refresh actions.
- Facilitates 100% deterministic unit testing of history state transitions using `FakeFlightRecordDao`.

### Alternatives Considered
- **Direct SQLite queries in screen component**: Rejected; violates Constitution Principle II.
- **Bundling history state into TelemetryDashboardController**: Rejected; violates single-responsibility principle. Telemetry live stream coordination is distinct from SQLite summary querying.

---

## 4. Utilitarian Tactical Theming & Iconography

### Context
FR-005 and SC-004 require high-contrast visual distinction of the active tab within 1 second under outdoor tactical lighting conditions. The application constitution mandates a Dark Mode First utilitarian theme and forbids extraneous libraries without justification.

### Decision
- **Color Palette**: Leverage existing `colors` tokens from `src/theme/colors.ts`:
  - Active Tab: `colors.metric.cyan` (`#00E5FF`)
  - Inactive Tab: `colors.textSecondary` (`#78909C`)
  - Tab Bar Background: `colors.surface` (`#111622`)
  - Top Border: `colors.border` (`#1F293D`)
- **Iconography**: Render crisp, tactical symbol glyphs (`⌖` Tactical Reticle for Dashboard, `▤` Log Sheet for History) via React Native `<Text>` elements or minimal SVG views styled with active/inactive tints.
- **Safe Area**: Configure `tabBarStyle` to respect bottom safe area insets via `react-native-safe-area-context`.

### Rationale
- Zero additional dependency installation (no `@expo/vector-icons` bloat).
- High-contrast cyan on deep slate ensures immediate legibility in direct sunlight or nighttime operations.

---

## 5. Deterministic Testing Strategy

### Context
Constitution Principle V mandates: *"Automated tests MUST be 100% deterministic. Real delays and uncontrolled random simulator outputs in automated tests are strictly forbidden."*

### Decision
1. **Context & Persistence Tests (`TelemetryContext.test.tsx`)**:
   - Verify that switching subscribers or unmounting a child component does not terminate the telemetry connection or disarm the 3-second watchdog.
   - Use `FakeTelemetrySource` and `jest.useFakeTimers()`.
2. **History Presentation Hook Tests (`useFlightHistory.test.ts`)**:
   - Verify empty state detection when `FakeFlightRecordDao` has zero records.
   - Verify populating records when `FakeFlightRecordDao` contains completed flight summaries.
   - Verify error state handling when database queries fail.
3. **Tab Layout Configuration Tests (`TabLayout.test.tsx`)**:
   - Verify tab route definitions (`index` and `history`), default route, and visual styling properties.

---

## Summary of Technical Choices

| Requirement | Selected Approach | Principle Justification |
|---|---|---|
| Tab Routing | Expo Router `(tabs)` (`index.tsx` & `history.tsx`) | Standard file-based routing |
| Background Continuity | Lightweight React `TelemetryContext` | Constitution Principle II & III |
| History Presentation | `useFlightHistory` hook + `FlightRecordDao` | Strict layer separation |
| Theming & Icons | Utilitarian dark theme + tactical glyphs | Dark Mode First & Zero Bloat |
| Testing | Fake timers + Controllable Fakes | Constitution Principle V |
