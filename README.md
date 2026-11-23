# DroneOps Mobile (React Native)

[![React Native](https://img.shields.io/badge/React%20Native-0.76+-61DAFB?logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2052+-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-E5E5E5)](https://github.com/sharmavikas212/DroneOps_React)

**DroneOps Mobile** is a cross-platform ground control and telemetry monitoring application designed for real-time UAV situational awareness and flight session analytics. Built with Expo, React Native, and TypeScript, it serves as the cross-platform counterpart and evolution of the native Android [DroneOps](https://github.com/sharmavikas212/DroneOps) client.

---

## Key Capabilities

- **Real-Time Telemetry Streaming**: Low-latency rendering of critical flight parameters including altitude, airspeed, 3-axis orientation, battery state, and live GPS coordinates.
- **Fail-Safe Watchdog Architecture**: Resilient telemetry ingestion engine featuring an automated 3-second heartbeat watchdog, explicit connection state machines, and graceful stale-data retention during intermittent RF/signal degradation.
- **Edge Flight Analytics & Persistence**: Offline-first session recording powered by local SQLite (`expo-sqlite`). Persists aggregated flight summaries (durations, peak altitudes, velocity profiles, minimum voltage thresholds) without disk-thrashing intermediate high-frequency packets.
- **Tactical Dark UI**: Utilitarian, high-contrast dark interface engineered for outdoor field readability with semantic color-coding (Operational, Caution, Critical Disconnect).
- **Decoupled Telemetry Abstraction**: Swappable `TelemetrySource` interface allowing seamless runtime switching between simulated test streams, local network sockets, and hardware-specific drone SDK adapters.

---

## Architecture & System Design

DroneOps enforces strict boundary isolation and unidirectional data flow across its core layers:

```
┌─────────────────────────────────────────────────────────────┐
│                       Screens (app/)                        │
│             Expo Router / Pure UI & Layout                  │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                 Presentation Layer (src/presentation/)       │
│      State Orchestration • 3s Watchdog • Live GPS Buffer     │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                  Repository (src/data/repository/)          │
│    Stream Aggregation • Flight Lifecycle • Metric Compute    │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
┌──────────────▼──────────────┐ ┌─────────────▼───────────────┐
│ Telemetry Source (src/data/)│ │ Local Storage (src/data/)   │
│ Simulator / Hardware SDK    │ │ SQLite Session Summaries    │
└─────────────────────────────┘ └─────────────────────────────┘
```

### Layer Responsibilities

- **Presentation (`app/`, `src/presentation/`)**: Screen navigation and state subscription. Houses the watchdog timer and transient in-memory GPS coordinate trails.
- **Data Repository (`src/data/repository/`)**: Coordinates continuous telemetry streams, tracks running flight statistics, and triggers session persistence upon flight termination.
- **Telemetry Ingestion (`src/data/source/`)**: Standardized interface for packet deserialization and event emission, decoupling protocol specifications from application logic.
- **Persistence (`src/data/local/`)**: Encapsulates schema migrations and query execution for post-flight summary retrieval and export.

---

## Technology Stack

| Category | Technology |
|---|---|
| **Core Framework** | React Native, Expo |
| **Language** | TypeScript (Strict Mode) |
| **Routing** | Expo Router (File-based routing) |
| **Local Storage** | `expo-sqlite` |
| **Testing** | Jest with Deterministic Fake Timers |
| **Styling & Assets** | Utilitarian Tactical Dark Theme |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher LTS)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- [Expo Go](https://expo.dev/go) on iOS/Android or a configured local emulator

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/sharmavikas212/DroneOps_React.git
   cd DroneOps_React
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the development server:
   ```bash
   npx expo start
   ```

---

## Verification & Testing

DroneOps enforces 100% deterministic testing. Test suites utilize controllable telemetry fakes and virtual clocks to ensure reproducible, flake-free CI execution.

```bash
# Run unit and integration tests
npm test

# Type-check TypeScript sources
npx tsc --noEmit
```

---

## Related Projects & Migration Tracking

- **Android Native Client**: [sharmavikas212/DroneOps](https://github.com/sharmavikas212/DroneOps) — Native Kotlin/Jetpack Compose reference implementation.
- **Migration Matrix & Roadmap**: [docs/migration-matrix.md](docs/migration-matrix.md) — Comprehensive tracking document mapping every native Android component to its React Native counterpart and SpecKit feature status.

---

## License

This project is licensed under the [MIT License](LICENSE).
