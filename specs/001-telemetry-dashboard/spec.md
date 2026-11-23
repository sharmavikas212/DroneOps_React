# Feature Specification: Core Telemetry Dashboard & Session Recording

**Feature Branch**: `001-telemetry-dashboard`

**Created**: 2026-11-23

**Status**: Draft

**Input**: User description: "Core Telemetry Dashboard & Session Recording: Real-time telemetry streaming, 3-second watchdog timer, connection state machine, and SQLite flight summary persistence"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Real-Time Flight Telemetry Monitoring (Priority: P1)

As a drone operator in the field, I need to monitor real-time flight telemetry (altitude, airspeed, battery percentage, heading, and live GPS coordinates) so that I have immediate situational awareness of the drone's position and status during an active flight.

**Why this priority**: Real-time telemetry visualization is the core operational capability of the ground control station; without it, flight monitoring is impossible.

**Independent Test**: Can be tested independently by connecting to an active telemetry stream and verifying that the dashboard displays live metrics and visualizes the drone's active coordinate trail in real time.

**Acceptance Scenarios**:

1. **Given** a connected drone telemetry stream, **When** new telemetry packets arrive, **Then** the dashboard displays the latest altitude, speed, battery percentage, heading, and updates the live flight trail within 100 ms.
2. **Given** an operator viewing the dashboard, **When** the drone changes altitude or speed, **Then** the updated values are rendered clearly in high-visibility tactical metrics without interface stutter.

---

### User Story 2 - Automated Disconnect Detection & Stale Telemetry Retention (Priority: P2)

As a drone operator, I need the system to immediately detect telemetry signal loss via an automated 3-second heartbeat watchdog and retain the last-known metrics with an explicit stale-data warning, so that I am never confused by silent communication dropouts and can see where the drone was last observed.

**Why this priority**: Signal loss in drone operations is hazardous; the operator must know whether the data is live or frozen, avoiding false confidence in outdated telemetry.

**Independent Test**: Can be tested by interrupting the telemetry feed for over 3 seconds and verifying that the interface transitions to a disconnected state while keeping the last known readings visibly labeled as stale.

**Acceptance Scenarios**:

1. **Given** an active connection with live telemetry, **When** no telemetry packet is received for 3 seconds, **Then** the connection status transitions to "Disconnected" and the last-known telemetry values are retained with a visual stale indicator.
2. **Given** a connection attempt in progress ("Connecting"), **When** 3 seconds elapse without receiving any handshake or packet, **Then** the status transitions to "Error" or "Disconnected" instead of hanging indefinitely.
3. **Given** a disconnected state with stale data, **When** valid telemetry packets resume, **Then** the status immediately returns to "Connected" and the stale indicator is dismissed.

---

### User Story 3 - Flight Termination & Session Summary Recording (Priority: P3)

As a drone operations supervisor, I need the system to automatically calculate and record an end-of-flight summary (start time, end time, duration, maximum altitude, average speed, minimum battery level) whenever a flight concludes, so that historical performance and safety metrics can be reviewed offline.

**Why this priority**: Automated session summaries ensure consistent record-keeping and post-mission debriefing without requiring manual telemetry logging.

**Independent Test**: Can be tested by concluding a flight session (stream termination or battery reaching 0%) and verifying that an aggregated flight summary record is created and persists across restarts.

**Acceptance Scenarios**:

1. **Given** an active flight session, **When** the flight terminates (stream terminates or battery reaches 0%), **Then** the system calculates the flight duration, max altitude, average speed, and minimum battery level, persisting a single summary record.
2. **Given** an active flight session that experiences brief signal interruptions (< 3 seconds or intermittent disconnects), **When** the flight eventually finishes, **Then** only one consolidated flight record is saved rather than splitting into multiple fragmented logs.
3. **Given** a concluded flight session, **When** the session ends, **Then** the in-memory live GPS trail is cleared to prepare for subsequent flights while the summary metrics remain accessible.

---

### Edge Cases

- **Handshake Timeout**: When initiating a connection to an unreachable drone, the 3-second watchdog aborts the "Connecting" state and displays a connection failure alert.
- **Micro-Drops in Telemetry**: If packet arrival is delayed for 1-2 seconds (below the 3-second watchdog threshold), the connection state remains "Connected" without triggering false disconnect alarms.
- **Abrupt Stream Termination**: If the drone's power abruptly cuts out while airborne, the watchdog triggers at 3 seconds, freezes the last coordinates, and marks the session as terminated with the last-known metrics preserved.
- **Zero-Duration Connection**: If a connection connects and immediately drops before receiving valid telemetry metrics, no spurious zero-value flight record is recorded.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display an explicit connection state indicator reflecting one of four distinct states: `Connecting`, `Connected`, `Disconnected`, or `Error`.
- **FR-002**: System MUST render real-time flight metrics on the primary dashboard, including altitude, airspeed, heading, battery percentage, and geographic coordinates.
- **FR-003**: System MUST execute a 3-second heartbeat watchdog timer that initiates immediately upon connection attempt and resets on every valid telemetry packet received.
- **FR-004**: System MUST transition the connection state to `Disconnected` if the watchdog timer expires without receiving a packet for 3 consecutive seconds.
- **FR-005**: System MUST retain and display the last-known telemetry values when a disconnect occurs, visibly marking the data as stale.
- **FR-006**: System MUST maintain an in-memory breadcrumb trail of geographic coordinates during an active flight for real-time visualization.
- **FR-007**: System MUST automatically generate an aggregated flight summary upon session completion, containing start time, end time, duration in seconds, maximum altitude, average airspeed, and minimum battery percentage.
- **FR-008**: System MUST persist flight summaries to local offline storage upon flight termination.
- **FR-009**: System MUST prevent session fragmentation by maintaining a single flight session across temporary signal drops and reconnections until final termination.
- **FR-010**: System MUST clear the temporary in-memory GPS coordinate trail when a flight session terminates to prevent memory growth across flights.

### Key Entities

- **Telemetry Packet**: Represents an instantaneous telemetry transmission containing timestamp, latitude, longitude, altitude (meters), airspeed (meters/sec), heading (degrees), and battery level (percentage).
- **Flight Session**: Represents an active flight duration from initial valid telemetry reception until flight completion or terminal disconnect.
- **Flight Summary**: Represents the completed historical record of a flight, including unique identifier, start timestamp, end timestamp, total duration (seconds), maximum altitude attained, average speed, and minimum battery recorded.
- **Connection State**: Represents the operational link status (`Connecting`, `Connected`, `Disconnected`, `Error`) with watchdog heartbeat timestamp.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Dashboard updates and renders received telemetry values within 100 milliseconds of packet arrival.
- **SC-002**: Connection drops and telemetry pauses trigger a visual disconnect notification within 3.1 seconds of packet cessation.
- **SC-003**: Last-known telemetry values and last recorded position remain 100% visible and explicitly badged as stale during disconnects.
- **SC-004**: 100% of completed flight sessions generate a valid, unfragmented flight summary record.
- **SC-005**: In-memory coordinate trails release all memory immediately upon flight termination, keeping long-term memory footprint flat.
- **SC-006**: Operators can review saved flight summaries offline with zero network latency.

## Assumptions

- **Target Device Context**: The operator operates the application on mobile devices in outdoor field environments requiring high-contrast visual status indicators.
- **Telemetry Frequency**: Telemetry feeds provide updates at a minimum frequency of 1 Hz under nominal operating conditions.
- **Single Active Stream**: The application connects to and monitors one primary drone telemetry stream per session.
- **Storage Policy**: Raw high-frequency telemetry ticks (e.g., thousands of raw packets) are discarded; only consolidated mission summaries are stored persistently.
- **Trail Retention**: The live coordinate breadcrumb trail is an in-memory tactical visualization tool and is not permanently stored to disk after flight completion.
