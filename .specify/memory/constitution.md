<!--
Sync Impact Report:
- Version change: 2.0.0 -> 2.1.0
- List of modified principles:
  - Added "Explicit Commit Approval" to Governance & Workflow: strictly forbidding automated Git commits or pushes without explicit developer confirmation
-->

# DroneOps (React Native) Constitution

## Core Principles

### I. Scope, Portfolio Focus & Explainability
DroneOps is an engineering portfolio project focused on drone operations and telemetry dashboards—not a full flight-control system or a generic CRUD app. Telemetry is strictly simulated; live SDK or hardware integration MUST NOT be claimed unless implemented and tested. Every architectural decision, state transition, and test must remain simple, readable, and explainable in a technical interview.

### II. Strict Layer Boundaries & Zero-Bloat Wiring
Responsibilities MUST remain strictly decoupled across defined boundaries:
- **Screens (`app/`)**: Render UI state and handle navigation only. Zero business logic.
- **Presentation (`src/presentation/`)**: Manage UI state, the 3-second watchdog timer, and the in-memory live GPS trace.
- **Repository (`src/data/repository/`)**: Coordinate the telemetry stream, aggregate running flight statistics, and trigger persistence when a flight terminates.
- **Telemetry Source (`src/data/source/`)**: Provide raw telemetry behind a `TelemetrySource` interface so the simulator can be swapped for a real SDK or test fake without changing upstream layers.
- **Local Storage (`src/data/local/`)**: Encapsulate SQLite schema and queries behind a clean, swappable interface.
- **Dependency Wiring**: Use manual dependency construction or lightweight React Context. Redux, MobX, heavy DI containers, and unnecessary Clean Architecture boilerplate are prohibited.

### III. Explicit Connection State & 3-Second Watchdog
Connection status (`Connecting`, `Connected`, `Disconnected`, `Error`) MUST be explicit and decoupled from the telemetry payload. A 3-second heartbeat watchdog MUST start immediately on connection initiation (preventing infinite `Connecting` states) and reset on every incoming packet. When connection is lost, last-known telemetry values MUST be retained and visibly marked as stale rather than cleared.

### IV. Summary-Only Persistence & In-Memory Live Traces
Persist ONLY post-flight summaries (`startTimeMillis`, `endTimeMillis`, `durationSeconds`, `maxAltitudeMeters`, `averageSpeedMps`, `minBatteryPercentage`) to local SQLite when a flight terminates (battery hits 0% or stream ends). Individual telemetry ticks MUST NEVER be persisted. Temporary signal drops MUST NOT split a single flight into multiple records. The live GPS coordinate trail MUST be kept strictly in memory and discarded when the flight finishes.

### V. Deterministic Testing & Controllable Fakes (NON-NEGOTIABLE)
Automated tests MUST be 100% deterministic. Tests must use controllable fakes (`FakeTelemetrySource`, in-memory fake flight store) and fake timers (`jest.useFakeTimers()`). Real delays and uncontrolled random simulator outputs in automated tests are strictly forbidden. Meaningful state-transition coverage (initial state, live updates, watchdog disconnect, stale data retention, reconnection, flight summary calculations) takes precedence over raw test volume.

## Technology Stack & Constraints

- **Framework**: Expo + React Native + TypeScript (strict mode enabled).
- **Navigation**: Expo Router (file-based routing in `app/`).
- **Persistence**: `expo-sqlite` for local flight summary history.
- **Testing**: Jest with `jest.useFakeTimers()`.
- **UI & Theming**: Dark Mode First (utilitarian). Deep slate/black backgrounds with high-visibility semantic status colors (Cyan/Green for live, Amber for warnings, Red for disconnected/errors). Dynamic wallpaper theming is prohibited to preserve unambiguous situational awareness.

## Governance & Workflow

- **Inspect Before Planning**: Before generating a feature plan or task list, inspect actual repository files rather than assuming paths or configurations exist.
- **Scope Discipline**: Every feature spec must include explicit non-goals to prevent scope creep. Do not introduce abstractions, libraries, or features without a clear user or engineering benefit.
- **Explicit Commit Approval**: Agents MUST NEVER automatically stage, commit, or push files. All generated code and documentation must remain in the working tree for user review. Git commits and pushes require explicit developer confirmation.
- **Verification Gate**: Every task is incomplete until `npx tsc --noEmit` and `npm test` pass cleanly.
- **Concise Communication**: Keep agent responses short, direct, and focused.
- **Amendments & Versioning**: Constitution changes require explicit justification and version increment:
  - **MAJOR**: Structural redefinitions or removals of architectural/governance rules.
  - **MINOR**: Additions of new principles or non-breaking constraints.
  - **PATCH**: Wording improvements and typo corrections.

**Version**: 2.1.0 | **Ratified**: 2026-11-23 | **Last Amended**: 2026-11-23
