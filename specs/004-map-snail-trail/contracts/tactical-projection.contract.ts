/**
 * Tactical Projection Contract
 * Pure mathematical functions for converting geographic coordinates to 2D screen pixels.
 */

export interface GeoCoordinate {
  latitude: number;
  longitude: number;
}

export interface ScreenPoint {
  x: number;
  y: number;
}

export interface ProjectionConfig {
  /** Center geographic coordinate for the viewport */
  centerCoordinate: GeoCoordinate;
  /** Width of the map viewport container in pixels */
  viewportWidth: number;
  /** Height of the map viewport container in pixels */
  viewportHeight: number;
  /** Meters of ground distance represented by one pixel */
  metersPerPixel: number;
  /** Optional pan pixel offset */
  panOffset?: { x: number; y: number };
}

export interface ITacticalProjectionService {
  /**
   * Projects a WGS84 geographic coordinate to a 2D screen pixel location.
   */
  geoToScreen(geo: GeoCoordinate, config: ProjectionConfig): ScreenPoint;

  /**
   * Projects a 2D screen pixel location back to a WGS84 geographic coordinate.
   */
  screenToGeo(screen: ScreenPoint, config: ProjectionConfig): GeoCoordinate;

  /**
   * Calculates ground distance in meters between two geographic coordinates.
   */
  calculateDistanceMeters(coord1: GeoCoordinate, coord2: GeoCoordinate): number;

  /**
   * Calculates compass bearing in degrees (0 to 359.9) from coord1 to coord2.
   */
  calculateBearingDegrees(from: GeoCoordinate, to: GeoCoordinate): number;
}
