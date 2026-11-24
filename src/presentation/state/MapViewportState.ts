/**
 * Map Viewport State & Projection Types
 * Cites constraints from data-model.md:
 * - MapViewportState.centerCoordinate: GeoCoordinate | null
 * - MapViewportState.zoomLevel: number (0.5 to 8.0, default 1.0)
 * - MapViewportState.metersPerPixel: number (ground meters per screen pixel)
 * - MapViewportState.isAutoFollow: boolean (true by default)
 * - MapViewportState.panOffset: { x: number; y: number } ({ x: 0, y: 0 } by default)
 * - MapViewportState.viewportWidth: number (non-negative)
 * - MapViewportState.viewportHeight: number (non-negative)
 */

export interface GeoCoordinate {
  /** WGS84 geographic latitude (-90.0 <= latitude <= 90.0) */
  latitude: number;
  /** WGS84 geographic longitude (-180.0 <= longitude <= 180.0) */
  longitude: number;
}

export interface ScreenPoint {
  /** Horizontal screen pixel position */
  x: number;
  /** Vertical screen pixel position */
  y: number;
}

export interface TrailSegment {
  /** Index of origin breadcrumb in breadcrumbs array */
  startIndex: number;
  /** Screen coordinates of beginning node */
  startPoint: ScreenPoint;
  /** Screen coordinates of ending node */
  endPoint: ScreenPoint;
  /** Ground distance between points in meters */
  distanceMeters: number;
}

export interface MapViewportState {
  /** Center geographic coordinate for the map canvas */
  centerCoordinate: GeoCoordinate | null;
  /** Zoom magnification multiplier (0.5 to 8.0, default 1.0) */
  zoomLevel: number;
  /** Ground meters represented by one screen pixel at current zoom */
  metersPerPixel: number;
  /** When true, viewport automatically follows the live drone coordinates */
  isAutoFollow: boolean;
  /** Pixel pan offset introduced by manual user dragging */
  panOffset: { x: number; y: number };
  /** Pixel width of the tactical map component */
  viewportWidth: number;
  /** Pixel height of the tactical map component */
  viewportHeight: number;
}

export const DEFAULT_METERS_PER_PIXEL = 2.0; // 2 meters per pixel at zoom 1.0
export const MIN_ZOOM_LEVEL = 0.5;
export const MAX_ZOOM_LEVEL = 8.0;
export const DEFAULT_VIEWPORT_WIDTH = 340;
export const DEFAULT_VIEWPORT_HEIGHT = 300;

export const initialMapViewportState: MapViewportState = {
  centerCoordinate: null,
  zoomLevel: 1.0,
  metersPerPixel: DEFAULT_METERS_PER_PIXEL,
  isAutoFollow: true,
  panOffset: { x: 0, y: 0 },
  viewportWidth: DEFAULT_VIEWPORT_WIDTH,
  viewportHeight: DEFAULT_VIEWPORT_HEIGHT,
};
