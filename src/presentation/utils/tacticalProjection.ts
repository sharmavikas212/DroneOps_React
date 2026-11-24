/**
 * Tactical Coordinate Projection Utility
 * Implements equirectangular planar projection with cosine latitude compensation
 * and Haversine distance/bearing calculations.
 * Cites constraints from data-model.md:
 * - GeoCoordinate.latitude (-90.0 <= lat <= 90.0)
 * - GeoCoordinate.longitude (-180.0 <= lon <= 180.0)
 * - ScreenPoint.x
 * - ScreenPoint.y
 */

import { GeoCoordinate, ScreenPoint } from '../state/MapViewportState';

export const EARTH_RADIUS_METERS = 6371000;
export const METERS_PER_DEGREE_LAT = 111139;

export interface ProjectionConfig {
  centerCoordinate: GeoCoordinate;
  viewportWidth: number;
  viewportHeight: number;
  metersPerPixel: number;
  panOffset?: { x: number; y: number };
}

/**
 * Converts degrees to radians.
 */
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Converts radians to degrees.
 */
function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Projects a WGS84 geographic coordinate (lat, lon) to a 2D screen point (x, y).
 */
export function geoToScreen(geo: GeoCoordinate, config: ProjectionConfig): ScreenPoint {
  const panX = config.panOffset?.x ?? 0;
  const panY = config.panOffset?.y ?? 0;

  const centerLatRad = toRadians(config.centerCoordinate.latitude);
  const metersPerDegreeLon = METERS_PER_DEGREE_LAT * Math.cos(centerLatRad);

  const deltaLat = geo.latitude - config.centerCoordinate.latitude;
  const deltaLon = geo.longitude - config.centerCoordinate.longitude;

  const metersY = deltaLat * METERS_PER_DEGREE_LAT;
  const metersX = deltaLon * (metersPerDegreeLon === 0 ? 0.0001 : metersPerDegreeLon);

  const effectiveMpp = config.metersPerPixel <= 0 ? 1 : config.metersPerPixel;

  const screenX = config.viewportWidth / 2 + metersX / effectiveMpp + panX;
  const screenY = config.viewportHeight / 2 - metersY / effectiveMpp + panY;

  return { x: screenX, y: screenY };
}

/**
 * Inverse projection: Converts a 2D screen point (x, y) back to a WGS84 geographic coordinate.
 */
export function screenToGeo(screen: ScreenPoint, config: ProjectionConfig): GeoCoordinate {
  const panX = config.panOffset?.x ?? 0;
  const panY = config.panOffset?.y ?? 0;

  const centerLatRad = toRadians(config.centerCoordinate.latitude);
  const metersPerDegreeLon = METERS_PER_DEGREE_LAT * Math.cos(centerLatRad);
  const effectiveMpp = config.metersPerPixel <= 0 ? 1 : config.metersPerPixel;

  const pixelsX = screen.x - config.viewportWidth / 2 - panX;
  const pixelsY = config.viewportHeight / 2 - (screen.y - panY);

  const metersX = pixelsX * effectiveMpp;
  const metersY = pixelsY * effectiveMpp;

  const deltaLat = metersY / METERS_PER_DEGREE_LAT;
  const deltaLon = metersX / (metersPerDegreeLon === 0 ? 0.0001 : metersPerDegreeLon);

  let lat = config.centerCoordinate.latitude + deltaLat;
  let lon = config.centerCoordinate.longitude + deltaLon;

  // Clamp latitude to [-90, 90]
  lat = Math.max(-90.0, Math.min(90.0, lat));

  // Normalize longitude to [-180, 180]
  while (lon > 180.0) lon -= 360.0;
  while (lon < -180.0) lon += 360.0;

  return { latitude: lat, longitude: lon };
}

/**
 * Calculates ground distance in meters between two geographic coordinates using the Haversine formula.
 */
export function calculateDistanceMeters(coord1: GeoCoordinate, coord2: GeoCoordinate): number {
  const lat1 = toRadians(coord1.latitude);
  const lon1 = toRadians(coord1.longitude);
  const lat2 = toRadians(coord2.latitude);
  const lon2 = toRadians(coord2.longitude);

  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

/**
 * Calculates compass bearing in degrees (0 to 359.9) from coord1 to coord2 relative to true north.
 */
export function calculateBearingDegrees(from: GeoCoordinate, to: GeoCoordinate): number {
  const lat1 = toRadians(from.latitude);
  const lon1 = toRadians(from.longitude);
  const lat2 = toRadians(to.latitude);
  const lon2 = toRadians(to.longitude);

  const dLon = lon2 - lon1;

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  const initialBearingRad = Math.atan2(y, x);
  const initialBearingDeg = toDegrees(initialBearingRad);

  return (initialBearingDeg + 360) % 360;
}
