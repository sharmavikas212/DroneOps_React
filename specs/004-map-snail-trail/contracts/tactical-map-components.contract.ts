/**
/**
 * Tactical Map Component Contracts
 * Defines component props and interfaces for the tactical map presentation hierarchy.
 */

import { DroneTelemetry } from '../../../src/data/model/DroneTelemetry';
import { BreadcrumbPoint } from '../../../src/presentation/state/DashboardUiState';
import { ConnectionState } from '../../../src/data/source/TelemetrySource';
import { GeoCoordinate, ScreenPoint } from './tactical-projection.contract';

export interface TacticalMapProps {
  /** Current live or last-known drone telemetry packet */
  telemetry: DroneTelemetry | null;
  /** In-memory accumulated breadcrumb coordinates */
  breadcrumbs: BreadcrumbPoint[];
  /** Whether the telemetry data is stale (signal lost > 3 seconds) */
  isStale: boolean;
  /** Link connection state */
  connectionState: ConnectionState;
  /** Optional container height (defaults to 320px) */
  height?: number;
  /** Test identifier */
  testID?: string;
}

export interface DroneMarkerProps {
  /** Projected X coordinate on screen */
  x: number;
  /** Projected Y coordinate on screen */
  y: number;
  /** Aircraft heading angle in degrees (0-359) */
  headingDegrees: number;
  /** Whether telemetry is stale (renders amber caution vs. live cyan) */
  isStale: boolean;
  /** Test identifier */
  testID?: string;
}

export interface HomeMarkerProps {
  /** Projected X coordinate on screen */
  x: number;
  /** Projected Y coordinate on screen */
  y: number;
  /** Test identifier */
  testID?: string;
}

export interface SnailTrailProps {
  /** Sequence of projected screen points connecting the flight trail */
  screenPoints: ScreenPoint[];
  /** Whether trail styling reflects stale connection */
  isStale: boolean;
  /** Test identifier */
  testID?: string;
}

export interface MapControlsProps {
  /** Current zoom multiplier */
  zoomLevel: number;
  /** Whether the viewport is currently auto-following the drone */
  isAutoFollow: boolean;
  /** Zoom in handler */
  onZoomIn: () => void;
  /** Zoom out handler */
  onZoomOut: () => void;
  /** Re-center on drone handler */
  onRecenter: () => void;
  /** Test identifier */
  testID?: string;
}
