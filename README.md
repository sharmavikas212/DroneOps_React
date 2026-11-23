# DroneOps (React Native)

Engineering portfolio project focused on drone operations and telemetry dashboards, built with Expo, React Native, and TypeScript.

This project is a React Native companion / evolution of the native Android [DroneOps](https://github.com/sharmavikas212/DroneOps) application.

## Core Features & Architecture
- **Framework**: Expo + React Native + TypeScript (strict mode)
- **Navigation**: Expo Router (`app/`)
- **Strict Layer Separation**: Decoupled presentation, repository, telemetry source, and SQLite storage layers
- **Watchdog & Telemetry**: 3-second heartbeat watchdog, explicit connection states, and stale telemetry retention
- **Local Persistence**: Summary-only persistence via `expo-sqlite`
- **Testing**: Deterministic testing with controllable fakes and fake timers
