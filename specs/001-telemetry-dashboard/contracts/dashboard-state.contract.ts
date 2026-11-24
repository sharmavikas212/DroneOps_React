/**
 * Contract: Dashboard Presentation Hook & State
 * Location: src/presentation/hooks/useTelemetryDashboard.ts
 */

export type ConnectionState = 'Connecting' | 'Connected' | 'Disconnected' | 'Error';

export interface DroneTelemetry {
  timestamp: number;
  latitude: number;
  longitude: number;
  altitudeMeters: number;
  airspeedMps: number;
  headingDegrees: number;
  batteryPercentage: number;
}

export interface BreadcrumbPoint {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface DashboardUiState {
  /** Explicit link connection state */
  connectionState: ConnectionState;
  /** Latest received telemetry packet or null */
  telemetry: DroneTelemetry | null;
  /** True when telemetry metrics are retained from a previous connection drop */
  isStale: boolean;
  /** In-memory transient breadcrumb points for tactical trail rendering */
  breadcrumbs: BreadcrumbPoint[];
  /** Optional error message when in Error state */
  errorMessage: string | null;
}

export interface UseTelemetryDashboardReturn extends DashboardUiState {
  /** Manual trigger to initiate connection */
  connect: () => void;
  /** Manual trigger to disconnect */
  disconnect: () => void;
}
