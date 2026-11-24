/**
 * Dashboard UI State & Breadcrumb Types
 * Cites constraints from data-model.md
 */

import { DroneTelemetry } from '../../data/model/DroneTelemetry';
import { ConnectionState } from '../../data/source/TelemetrySource';

export interface BreadcrumbPoint {
  /** Geographic latitude (-90.0 <= latitude <= 90.0) */
  latitude: number;
  /** Geographic longitude (-180.0 <= longitude <= 180.0) */
  longitude: number;
  /** Timestamp when point was captured in epoch ms */
  timestamp: number;
}

export interface DashboardUiState {
  /** Explicit link connection state ('Connecting' | 'Connected' | 'Disconnected' | 'Error') */
  connectionState: ConnectionState;
  /** Latest received telemetry packet or null if never connected */
  telemetry: DroneTelemetry | null;
  /** True when telemetry metrics are retained from a previous connection drop */
  isStale: boolean;
  /** In-memory transient breadcrumb points for tactical trail rendering */
  breadcrumbs: BreadcrumbPoint[];
  /** Optional error message when in Error state */
  errorMessage: string | null;
}

export const initialDashboardUiState: DashboardUiState = {
  connectionState: 'Disconnected',
  telemetry: null,
  isStale: false,
  breadcrumbs: [],
  errorMessage: null,
};
