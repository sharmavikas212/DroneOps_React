# Research & Technical Decisions: Tactical Map & Live Snail Trail Visualization

**Feature**: Tactical Map & Live Snail Trail Visualization  
**Branch**: `004-map-snail-trail`  
**Date**: 2026-11-24  
**Spec Reference**: [spec.md](./spec.md)

---

## 1. Tactical Map Rendering Engine (Custom 2D Vector HUD vs. Native Map Libraries)

### Context
FR-001, FR-002, FR-003, FR-016, SC-001, and SC-002 require a tactical map view on the Dashboard displaying the drone's real-time position, heading indicator, and historical snail trail with high contrast, 60 fps rendering, and sub-100ms update latency.

### Decision
Implement a custom 2D tactical HUD vector map component (`TacticalMap` / `TacticalMapView`) using standard React Native layout primitives (`View`, `StyleSheet`, CSS transforms, and absolute coordinate positioning):
- A stylized tactical radar/grid background featuring concentric range rings, cardinal axes (N, S, E, W), and subtle grid markings.
- An in-memory vector polyline/breadcrumb trail connecting consecutive flight positions.
- A dedicated Home/Launch marker pinned at the origin coordinate of the current flight.
- An aircraft vehicle marker (tactical directional chevron/arrow) rotated dynamically to `headingDegrees` with live cyan (`colors.primary`) styling or amber (`colors.warning`) when stale.
- Tactical overlay controls for zoom (`+` / `-`), pan, and a dedicated "RE-CENTER" button.

### Rationale
- **100% Offline-First & Zero External Dependencies**: Native mapping libraries (`react-native-maps`) require Google Maps API keys for Android and Apple Maps provisioning on iOS, fail in offline or air-gapped environments without map tile pre-caching, and encounter frequent configuration failures in React Native Web. A custom 2D tactical HUD operates entirely offline with zero third-party API keys or tile network requests.
- **100% Deterministic Jest Testing**: Native map SDKs require extensive native mocking harnesses that complicate automated CI tests. Standard React Native components render predictable test IDs (`tactical-map`, `drone-marker`, `home-marker`, `snail-trail`, `recenter-button`) and run 100% deterministically under Jest (Constitution Principle V).
- **Utilitarian Tactical Aesthetic**: DroneOps is an operational telemetry dashboard with a Dark Mode First theme (deep slate/black background with high-visibility cyan, green, amber, red). A tactical radar HUD provides a cleaner, more focused situational awareness display for drone telemetry than generic civilian street maps.
- **High Performance (60 fps)**: Utilizing native layout transforms (`translateX`, `translateY`, `rotateZ`) offloads position and heading updates directly to the GPU compositor without expensive DOM or canvas re-layouts.

### Alternatives Considered
- **`react-native-maps`**: Rejected due to mandatory external API keys, lack of offline reliability, heavy native build dependencies, and notorious testing difficulties in Jest.
- **`react-native-svg`**: Viable for complex vector curves, but adds an extra native dependency not currently in `package.json`. A segment/point-based tactical renderer in pure React Native fulfills all requirements with zero additional packages (Constitution Principle II - Zero-Bloat Wiring).

---

## 2. Coordinate Projection & Tactical Scale Translation

### Context
GPS coordinates are provided in decimal degrees (`latitude`, `longitude`). They must be projected onto a 2D screen coordinate system `(x, y)` in pixels relative to a dynamic viewport center and zoom level.

### Decision
Implement an equirectangular planar projection utility (`tacticalProjection.ts`):
- Given a center reference coordinate `(centerLat, centerLon)`, viewport dimensions `(viewportWidth, viewportHeight)`, and a scale factor `metersPerPixel`:
  $$\Delta \text{lat} = \text{latitude} - \text{centerLat}$$
  $$\Delta \text{lon} = \text{longitude} - \text{centerLon}$$
  $$\text{metersY} = \Delta \text{lat} \times 111{,}139$$
  $$\text{metersX} = \Delta \text{lon} \times 111{,}139 \times \cos(\text{centerLat} \times \frac{\pi}{180})$$
  $$\text{screenX} = \frac{\text{viewportWidth}}{2} + \frac{\text{metersX}}{\text{metersPerPixel}}$$
  $$\text{screenY} = \frac{\text{viewportHeight}}{2} - \frac{\text{metersY}}{\text{metersPerPixel}}$$
- Provide inverse projection (`screenToGeo`) to support touch drag panning.
- Provide distance and bearing calculation helpers (equirectangular and Haversine) for tactical HUD readouts.

### Rationale
- **Accuracy over Local Tactical Radii**: Tactical drone operations typically operate within a 10 km radius. Over these distances, planar equirectangular projection with cosine latitude compensation introduces less than 0.01% geometric distortion compared to full spherical geodesics.
- **Microsecond Compute Speed**: Pure closed-form arithmetic transforms 1,000 coordinates in under 1 ms, well within the 16 ms budget for 60 fps rendering (SC-002).

### Alternatives Considered
- **Web Mercator (EPSG:3857)**: Standard for global tiled maps, but requires transcendental functions ($\ln(\tan(\dots))$) and unnecessary complexity for local tactical radii under 50 km.

---

## 3. In-Memory Snail Trail Representation & Memory Boundaries

### Context
FR-003, FR-006, SC-003, and SC-005 require maintaining the historical flight path strictly in transient memory, supporting at least 3,600 points (1 hour at 1 Hz) without memory exhaustion, and guaranteeing that zero breadcrumb points are written to persistent SQLite storage (Constitution Principle IV).

### Decision
- Store the chronological trail as `BreadcrumbPoint[]` in `DashboardUiState.breadcrumbs` (already managed by `TelemetryDashboardController`).
- When rendering on the map:
  - Connect sequential projected points with tactical line segments or breadcrumb node markers.
  - Apply stationary filtering: If a new telemetry point arrives within 0.5 meters of the previous point (drone hovering), avoid generating redundant visual segments.
- Upon flight conclusion or explicit disconnection, `TelemetryDashboardController.clearBreadcrumbs()` purges the in-memory array.
- Zero SQLite queries or schema tables are created for breadcrumbs (only summary statistics are persisted upon flight termination).

### Rationale
- Storing 3,600 `BreadcrumbPoint` objects (each holding 3 numbers: `latitude`, `longitude`, `timestamp`) consumes approximately 200 KB of RAM—negligible on modern mobile devices.
- Strictly adheres to Constitution Principle IV: "The live GPS coordinate trail MUST be kept strictly in memory and discarded when the flight finishes."

### Alternatives Considered
- **Decimating Historical Points (Douglas-Peucker algorithm)**: Useful for massive tracks (> 50,000 points), but premature optimization for standard 1-hour flights (3,600 points) in an engineering portfolio project.

---

## 4. Viewport Navigation & Auto-Follow Architecture

### Context
FR-007, FR-008, FR-009, FR-010, and SC-004 mandate that the map automatically tracks the drone by default ("Auto-Follow"), allows manual panning and zooming, pauses auto-follow when the user pans away, and provides a quick "RE-CENTER" button to refocus on the aircraft.

### Decision
Encapsulate viewport state in a custom presentation hook / state model (`useMapViewport` / `MapViewportState`):
- State properties:
  - `centerCoordinate`: `{ latitude: number; longitude: number }`
  - `zoomLevel`: Current magnification multiplier (preset range from 0.5x to 8.0x, default 1.0x).
  - `isAutoFollow`: Boolean flag (default `true`).
  - `panOffset`: Pixel offset `(dx, dy)` introduced by manual panning.
- Behavior:
  - When `isAutoFollow === true` and new telemetry arrives, `centerCoordinate` updates automatically to `(telemetry.latitude, telemetry.longitude)`.
  - When the user drags or pans the map, `isAutoFollow` is set to `false`, and `panOffset` shifts the viewport center.
  - A high-visibility tactical "RE-CENTER" button appears whenever `isAutoFollow === false`.
  - Tapping "RE-CENTER" resets `panOffset` to `(0, 0)`, snaps `centerCoordinate` to the current drone position, and sets `isAutoFollow = true`.
  - Tactical `+` and `-` buttons adjust `zoomLevel` smoothly.

### Rationale
- Decouples viewport camera logic from the raw telemetry feed while adhering to Constitution Principle II (zero business logic in screens).
- Sub-300ms re-centering (SC-004) is achieved via instantaneous state reset and GPU translate transforms.

### Alternatives Considered
- **Locking the Viewport (No Pan/Zoom)**: Overly restrictive; operators must be able to inspect the entire flight path and launch point when the drone flies beyond the initial screen boundary.
- **Purely Gestural Pan/Zoom without Buttons**: Hard to operate reliably with flight gloves or in testing environments. Dedicated high-contrast tactical buttons guarantee ergonomic field operation and 100% testability.

---

## 5. Signal Loss & Stale Telemetry Handling

### Context
FR-011, FR-012, and SC-006 require the map to retain the last known position, heading, and snail trail during connection interruption, and visually reflect the stale state within 100 ms of the 3-second watchdog timer expiration.

### Decision
- `TacticalMap` receives `isStale: boolean` directly from `DashboardUiState`.
- When `isStale === true`:
  - The drone vehicle marker changes from live tactical cyan (`colors.primary`) to amber caution (`colors.warning`).
  - A prominent stale warning badge ("TACTICAL SIGNAL LOST - LAST KNOWN POSITION") is displayed atop the map.
  - The historical snail trail remains visible and intact.
  - When telemetry resumes, the marker immediately reverts to live cyan styling and the stale badge is dismissed.

### Rationale
- Complies strictly with Constitution Principle III: "When connection is lost, last-known telemetry values MUST be retained and visibly marked as stale rather than cleared."
