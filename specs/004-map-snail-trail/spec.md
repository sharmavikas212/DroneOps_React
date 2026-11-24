# Feature Specification: Tactical Map & Live Snail Trail Visualization

**Feature Branch**: `004-map-snail-trail`

**Created**: 2026-11-24

**Status**: Draft

**Input**: User description: "004-map-snail-trail"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Real-Time Drone Position & Heading on Tactical Map (Priority: P1)

As a drone operator in the field, I need a visual tactical map view displaying the drone's real-time geographic position and orientation (heading direction), so that I have immediate spatial situational awareness of where the aircraft is located relative to its operating area and its current flight direction.

**Why this priority**: Real-time spatial awareness is the core visual requirement for flight operations. Textual coordinates alone are difficult to parse under field conditions; visual positioning on a map provides immediate clarity.

**Independent Test**: Can be tested independently by connecting to an active telemetry feed and verifying that the drone marker appears at the transmitted coordinates and rotates smoothly to match the reported compass heading (0–359°).

**Acceptance Scenarios**:

1. **Given** an active telemetry stream with valid GPS coordinates and compass heading, **When** the tactical map view renders, **Then** the drone marker is displayed at the exact geographic coordinates with a directional indicator oriented to the aircraft's current heading.
2. **Given** an aircraft in motion, **When** new GPS coordinates arrive, **Then** the drone position marker updates smoothly on the map within 100 ms without interface stutter or flickering.
3. **Given** an initial state before any telemetry connection is established, **When** the operator views the map, **Then** an informative idle indicator ("Awaiting Telemetry Signal") is displayed on the map view.

---

### User Story 2 - Live Snail Trail (Breadcrumb Path) Visualization (Priority: P1)

As a drone operator, I need to see the historical flight path rendered as an in-memory "snail trail" (breadcrumb path) tracing behind the moving drone, so that I can visually track where the aircraft has traveled throughout the active mission.

**Why this priority**: Snail trails allow operators to monitor patrol patterns, verify search grid coverage, and immediately observe trajectory deviations without relying on external tracking tools.

**Independent Test**: Can be tested independently by feeding a simulated flight path of multiple coordinates and verifying that a continuous polyline trail connects the historical points in chronological order behind the drone marker.

**Acceptance Scenarios**:

1. **Given** an active flight session, **When** the drone moves along a path, **Then** each successive GPS coordinate extends the continuous visual snail trail connecting the path from takeoff to current position.
2. **Given** an extended flight mission generating hundreds of breadcrumb points, **When** viewing the trail on the map, **Then** the entire accumulated path remains visually intact and renders smoothly without degrading UI responsiveness.
3. **Given** high-contrast tactical styling requirements, **When** observing the flight trail, **Then** the trail is rendered with prominent high-visibility coloring (e.g., cyan against dark terrain) easily distinguishable from the base map.

---

### User Story 3 - Launch / Home Position Reference (Priority: P2)

As a drone pilot, I need a distinct marker representing the takeoff / home location on the map, so that I can quickly assess the drone's displacement and vector relative to the launch site.

**Why this priority**: The launch point serves as the primary reference anchor for return-to-base assessment, safety zones, and mission radius awareness.

**Independent Test**: Can be tested independently by initiating a flight session, verifying that the first received GPS coordinate is designated as the Launch/Home point, and confirming that the marker remains pinned at that origin throughout the flight.

**Acceptance Scenarios**:

1. **Given** the start of a flight session (first valid GPS coordinate received), **When** the map initializes flight tracking, **Then** a distinct Launch/Home marker is placed at that initial coordinate.
2. **Given** an active flight that has moved away from the launch site, **When** the operator inspects the map, **Then** the Launch/Home marker remains pinned at the origin and the snail trail visibly originates from that point.

---

### User Story 4 - Map Viewport Controls: Auto-Centering & Manual Exploration (Priority: P2)

As an operator observing a flight, I need map viewport controls that allow automatic tracking of the drone ("Auto-Follow") as well as free manual panning and zooming, with a quick action to re-center on the drone, so that I can either passively track the drone or actively inspect specific areas of the map.

**Why this priority**: Auto-follow ensures the drone never flies off-screen during hands-off monitoring, while manual panning/zooming allows operators to examine surrounding terrain and full flight path extents.

**Independent Test**: Can be tested independently by observing auto-follow tracking, manually dragging the map to inspect another area (verifying auto-follow pauses and a "Re-center" button appears), and tapping "Re-center" to smoothly refocus on the drone.

**Acceptance Scenarios**:

1. **Given** the map is in default auto-follow mode, **When** the drone moves across the operating area, **Then** the map viewport smoothly adjusts its center to keep the drone marker within the active view.
2. **Given** an operator manually pans or zooms the map, **When** the touch gesture begins, **Then** auto-follow mode is immediately paused and a high-visibility "Re-center" button appears on the map overlay.
3. **Given** auto-follow is paused, **When** the operator taps the "Re-center" button, **Then** the map viewport smoothly re-centers on the drone's current position and auto-follow mode is re-engaged.

---

### User Story 5 - Signal Loss Indication & Mission Reset Trail Clearance (Priority: P3)

As a drone operator, I need the map to visually indicate when telemetry data is stale due to signal interruption, and automatically clear the in-memory trail when a flight concludes, so that obsolete flight paths do not confuse subsequent missions.

**Why this priority**: Clear indication of stale signal prevents false confidence during communications blackouts, and clearing transient trails between flights guarantees that subsequent flights start with a clean slate per project governance.

**Independent Test**: Can be tested independently by interrupting telemetry for > 3 seconds to verify the drone marker displays stale status styling, and terminating the flight session to verify the in-memory trail is completely purged.

**Acceptance Scenarios**:

1. **Given** an active telemetry stream on the map, **When** no telemetry packet is received for 3 seconds (watchdog timeout), **Then** the drone marker transitions to a caution/stale state (e.g., amber accent) while retaining its last known position, heading, and trail.
2. **Given** a stale telemetry state, **When** valid telemetry packets resume, **Then** the drone marker immediately returns to nominal live styling.
3. **Given** an active flight session, **When** the flight terminates (stream ends or battery reaches 0%), **Then** the in-memory snail trail and Launch marker are completely reset for the next flight session, with zero breadcrumb points persisted to disk.

---

### Edge Cases

- **Immediate Signal Loss After 1 Point**: When only one GPS coordinate is received before connection drops, the system places the Launch marker and drone marker at that coordinate without path calculation errors or layout crashes.
- **Stationary Hover (Zero Displacement)**: When the drone hovers in place receiving identical coordinates repeatedly, the trail maintains visual integrity without rendering duplicate overlapping artifacts or degrading memory.
- **Extreme Coordinate Boundaries**: Coordinates near boundary conditions (equator, prime meridian, extreme latitudes) render correctly without projection distortions or numeric overflows.
- **Rapid Telemetry Rates**: If packets arrive at high frequency (>= 10 Hz), coordinate updates and trail rendering throttle layout passes to maintain a stable, non-stuttering user interface.
- **Tab Navigation & Backgrounding**: Navigating between the Dashboard and History tabs retains the active in-memory breadcrumb trail and map state without resetting or desynchronizing coordinates.
- **Manual Pan While Telemetry Updates**: Incoming telemetry packets continue extending the trail in the background even while the user is actively panning or zooming elsewhere on the map.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render a tactical map view on the primary Dashboard displaying the drone's real-time geographic position.
- **FR-002**: System MUST visually indicate the drone's orientation using a directional heading indicator aligned to the current compass heading angle (0–359 degrees).
- **FR-003**: System MUST render an in-memory chronological flight trail ("snail trail") connecting consecutive GPS coordinates recorded during the active flight session.
- **FR-004**: System MUST designate the initial received GPS coordinate of a flight session as the Launch/Home location and display a distinct Launch marker at that position.
- **FR-005**: System MUST visually differentiate the Launch/Home marker, the active flight path trail, and the current drone position marker.
- **FR-006**: System MUST maintain the live flight trail strictly in transient memory during an active session and MUST NOT persist individual breadcrumb points to storage.
- **FR-007**: System MUST provide an auto-follow viewport mode that keeps the drone marker centered in the map view as it moves.
- **FR-008**: System MUST support manual touch interactions to pan and zoom the map view.
- **FR-009**: System MUST automatically pause auto-follow mode when the operator manually pans or zooms away from the drone.
- **FR-010**: System MUST display a high-visibility "Re-center" control whenever auto-follow mode is paused, allowing the operator to immediately refocus the viewport on the drone.
- **FR-011**: System MUST retain the last-known drone position, heading, and snail trail on the map when telemetry communications are interrupted.
- **FR-012**: System MUST visually reflect stale telemetry status on the map (e.g., amber caution styling) when the connection watchdog detects signal loss.
- **FR-013**: System MUST completely clear the in-memory snail trail and Launch marker when a flight terminates or is explicitly disconnected/reset.
- **FR-014**: System MUST preserve the in-memory snail trail and map tracking state when navigating between application screens.
- **FR-015**: System MUST display an informative idle state when no flight session is active or no GPS coordinates have been received.
- **FR-016**: System MUST adhere to the Dark Mode First tactical theme using high-contrast utilitarian colors for map elements, markers, and paths.

### Key Entities

- **Tactical Map View**: Represents the spatial visualization component displaying coordinate grids, markers, and flight paths.
- **Snail Trail (Breadcrumb Path)**: Represents the chronological, in-memory sequence of geographic coordinates traveled by the drone during the current active flight session.
- **Drone Position Marker**: Represents the aircraft's current real-time spatial state on the map, including geographic coordinates, heading orientation, and connection status (live vs. stale).
- **Launch / Home Marker**: Represents the origin coordinates where the current flight session commenced.
- **Map Viewport State**: Represents the current map camera position, zoom level, center coordinates, and whether auto-follow mode is active.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Drone position and heading updates on the map reflect new telemetry coordinates within 100 milliseconds of packet receipt.
- **SC-002**: Snail trail path renders continuously and smoothly without exceeding 16 ms of UI frame delay (maintaining 60 fps rendering during active flight).
- **SC-003**: In-memory trail rendering supports at least 3,600 consecutive breadcrumb points (equivalent to 1 hour of flight at 1 Hz) without memory exhaustion, UI freezing, or app crash.
- **SC-004**: When the operator pans away from the drone, tapping "Re-center" returns the viewport to center on the drone within 300 milliseconds.
- **SC-005**: 100% of flight trail coordinates remain strictly in memory, with zero breadcrumb points written to persistent storage upon flight conclusion.
- **SC-006**: Signal loss detection updates the map's vehicle status indicator to stale within 100 milliseconds of the 3-second watchdog timeout.
- **SC-007**: When navigating away to the History tab and returning, 100% of existing breadcrumbs and current position are preserved with zero visual desynchronization.

## Assumptions

- **In-Memory Lifetime**: Snail trail coordinates are transient and discarded upon flight termination or disconnection per project architecture rules; only post-flight summary statistics are persisted.
- **Single Drone Focus**: The ground control station monitors one active drone per session.
- **Offline Map Capability**: The map visualization functions fully offline without requiring real-time external network tile downloads or third-party proprietary map service keys.
- **Tactical Dark Aesthetic**: The visual presentation strictly adheres to Dark Mode First styling with deep slate/black backgrounds and high-visibility semantic status colors.
- **Dashboard Integration**: The map component is integrated directly into the primary Dashboard screen, complementing the existing telemetry grid and connection controls.
