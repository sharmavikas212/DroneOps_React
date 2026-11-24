# Feature Specification: Navigation Shell & Tab Routing (Dashboard & History)

**Feature Branch**: `002-navigation-shell`

**Created**: 2026-11-24

**Status**: Draft

**Input**: User description: "002 navigation shell Expo Router tab navigation connecting Dashboard and History screens."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Primary Tab Navigation Between Live Dashboard and History (Priority: P1)

As a drone operator or field supervisor, I need a persistent, intuitive navigation shell with dedicated tabs for "Dashboard" and "History", so that I can seamlessly switch between real-time telemetry monitoring and recorded flight log review with a single touch.

**Why this priority**: Without navigation connecting views, the operator cannot access completed flight logs or move between core operational screens.

**Independent Test**: Can be tested independently by launching the application, tapping the History tab to display the history interface, and tapping the Dashboard tab to return to the live telemetry view.

**Acceptance Scenarios**:

1. **Given** the application is launched, **When** the initial interface loads, **Then** the Dashboard screen is displayed as the default view and the bottom navigation bar is visible with distinct tabs for Dashboard and History.
2. **Given** the user is viewing the Dashboard screen, **When** the user taps the History tab in the navigation bar, **Then** the application navigates to the History screen, updating the active tab indicator immediately.
3. **Given** the user is viewing the History screen, **When** the user taps the Dashboard tab, **Then** the application navigates back to the Dashboard screen with the Dashboard tab indicated as active.

---

### User Story 2 - Continuous Telemetry & State Preservation During Navigation (Priority: P2)

As a drone operator with an active or pending flight, I need the telemetry monitoring session, connection watchdog timer, and live data stream to persist uninterrupted when navigating between tabs, so that switching to view flight history does not disrupt ongoing flight safety monitoring or cause connection timeouts.

**Why this priority**: In tactical drone operations, navigating across screens to inspect past logs must never terminate background telemetry listeners, drop flight session statistics, or trigger false watchdog disconnects.

**Independent Test**: Can be tested by starting an active telemetry stream on the Dashboard, switching to the History tab for 10 seconds, and switching back to the Dashboard to confirm that the live stream continued uninterrupted, telemetry updated, and no false disconnect occurred.

**Acceptance Scenarios**:

1. **Given** an active telemetry connection on the Dashboard, **When** the operator navigates to the History screen and returns after several seconds, **Then** the telemetry connection remains active, the 3-second watchdog timer has not expired, and current live telemetry values are immediately visible.
2. **Given** an active flight session, **When** the operator is viewing the History tab, **Then** incoming flight telemetry continues to be processed in the background so that session summary statistics and live coordinate trails remain complete.
3. **Given** a connection drop or watchdog alert occurring while the operator is on the History screen, **When** the operator returns to the Dashboard, **Then** the latest connection status (e.g., Disconnected with stale indicator) is accurately reflected without desynchronization.

---

### User Story 3 - Utilitarian Visual Indicators & Shell Ergonomics (Priority: P3)

As a field drone operator working in varied outdoor light conditions, I need clear, high-contrast visual indications of the currently selected tab, consistent dark-mode styling, and proper safe area positioning, so that I maintain immediate situational awareness of which screen is active without accidental mis-taps.

**Why this priority**: High-stress field operations require an unambiguous visual hierarchy where active vs. inactive screen states are immediately discernible and navigation targets are ergonomic on mobile devices.

**Independent Test**: Can be tested by inspecting the navigation bar across screens to verify high-contrast active vs. inactive tab styling and confirming that navigation targets respect device display insets.

**Acceptance Scenarios**:

1. **Given** any screen in the application, **When** viewing the navigation bar, **Then** the active tab is highlighted with a high-contrast accent indicator and distinct label/icon, while inactive tabs remain subdued but legible.
2. **Given** a mobile device with hardware notches, bottom gesture bars, or varying aspect ratios, **When** the navigation bar is rendered, **Then** touch targets respect safe area insets and are fully accessible without overlap or clipping.

---

### Edge Cases

- **Rapid Tab Switching**: When an operator rapidly alternates between the Dashboard and History tabs, transitions execute cleanly without visual glitching, race conditions, or interrupted background telemetry subscriptions.
- **Empty History State**: When an operator navigates to the History screen before any completed flights have been recorded, the History view displays an informative empty state message ("No flight logs recorded") rather than a blank or unresponsive screen.
- **Connection Loss While on History Tab**: If telemetry drops for greater than 3 seconds while the operator is on the History screen, the connection watchdog correctly registers the disconnect and ensures the state is accurately presented upon returning to the Dashboard.
- **Application Cold Start**: Cold app launches always land predictably on the Dashboard tab, establishing the primary flight monitoring view immediately.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a persistent bottom navigation bar accessible across primary screens.
- **FR-002**: System MUST provide dedicated navigation destinations for "Dashboard" (real-time telemetry) and "History" (recorded flight logs).
- **FR-003**: System MUST designate the Dashboard screen as the default landing view upon cold application launch.
- **FR-004**: System MUST switch to the targeted destination within 100 milliseconds upon user selection of any navigation tab.
- **FR-005**: System MUST visually distinguish the active tab from inactive tabs using a high-contrast tactical indicator.
- **FR-006**: System MUST maintain active telemetry streaming, heartbeat watchdog monitoring, and session recording processes continuously in the background when the user navigates away from the Dashboard screen.
- **FR-007**: System MUST preserve and render the current live telemetry state immediately when navigating back to the Dashboard screen without reinitializing the telemetry connection.
- **FR-008**: System MUST display an informative empty state message on the History screen when no recorded flight summaries are available.
- **FR-009**: System MUST accommodate device display insets (notches, navigation bars, gesture bars) ensuring all tab touch targets remain fully visible and responsive.

### Key Entities

- **Navigation Route**: Represents a primary application destination (`Dashboard`, `History`) with its associated display title, icon, and screen view.
- **Navigation State**: Represents the current active route and navigation history within the application shell.
- **Flight Record (History View)**: Represents historical flight session summaries displayed within the History destination.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Screen transition between Dashboard and History occurs within 100 milliseconds of tab interaction.
- **SC-002**: 100% of telemetry packets and watchdog heartbeats received while on the History screen are processed without packet loss or spurious timeouts.
- **SC-003**: 100% of application cold launches land reliably on the Dashboard screen.
- **SC-004**: Active vs. inactive navigation tabs are distinguishable in under 1 second under tactical outdoor lighting conditions.
- **SC-005**: Returning to Dashboard after background navigation displays live metrics with zero manual refresh or desynchronization lag.

## Assumptions

- **Navigation Pattern**: A bottom tab bar provides the standard ergonomic pattern for one-handed handheld mobile device operation in field conditions.
- **Telemetry Independence**: Presentation state and telemetry subscription mechanisms are decoupled from screen unmount lifecycles, ensuring background navigation does not tear down live monitoring.
- **Screen Inventory**: The navigation shell connects Dashboard and History screens; future modules will integrate into the same navigation shell pattern.
- **Theme Consistency**: The navigation shell adheres strictly to the Dark Mode First utilitarian theme defined in the constitution.
