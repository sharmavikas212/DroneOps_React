/**
 * Map Viewport Controller
 * Manages camera viewport state, auto-follow tracking, zoom clamping, and manual pan offsets.
 * Follows Constitution Principle II (Presentation Layer).
 */

import {
  DEFAULT_METERS_PER_PIXEL,
  DEFAULT_VIEWPORT_HEIGHT,
  DEFAULT_VIEWPORT_WIDTH,
  GeoCoordinate,
  initialMapViewportState,
  MapViewportState,
  MAX_ZOOM_LEVEL,
  MIN_ZOOM_LEVEL,
} from './MapViewportState';

export type ViewportListener = (state: MapViewportState) => void;

export interface MapViewportControllerOptions {
  initialTarget?: GeoCoordinate | null;
  initialWidth?: number;
  initialHeight?: number;
  baseMetersPerPixel?: number;
}

export class MapViewportController {
  private state: MapViewportState;
  private listeners: Set<ViewportListener> = new Set();
  private baseMetersPerPixel: number;
  private currentTarget: GeoCoordinate | null = null;

  constructor(options: MapViewportControllerOptions = {}) {
    const width = options.initialWidth ?? DEFAULT_VIEWPORT_WIDTH;
    const height = options.initialHeight ?? DEFAULT_VIEWPORT_HEIGHT;
    this.baseMetersPerPixel = options.baseMetersPerPixel ?? DEFAULT_METERS_PER_PIXEL;
    this.currentTarget = options.initialTarget ?? null;

    this.state = {
      ...initialMapViewportState,
      viewportWidth: width,
      viewportHeight: height,
      metersPerPixel: this.baseMetersPerPixel,
      centerCoordinate: this.currentTarget,
    };
  }

  getState(): MapViewportState {
    return this.state;
  }

  subscribe(listener: ViewportListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  updateTarget(target: GeoCoordinate | null): void {
    this.currentTarget = target;
    if (!target) return;

    if (this.state.isAutoFollow) {
      this.updateState({
        centerCoordinate: target,
        panOffset: { x: 0, y: 0 },
      });
    } else if (!this.state.centerCoordinate) {
      this.updateState({
        centerCoordinate: target,
      });
    }
  }

  zoomIn(): void {
    const nextZoom = Math.min(MAX_ZOOM_LEVEL, this.state.zoomLevel * 1.5);
    const nextMpp = this.baseMetersPerPixel / nextZoom;
    this.updateState({
      zoomLevel: nextZoom,
      metersPerPixel: nextMpp,
    });
  }

  zoomOut(): void {
    const nextZoom = Math.max(MIN_ZOOM_LEVEL, this.state.zoomLevel / 1.5);
    const nextMpp = this.baseMetersPerPixel / nextZoom;
    this.updateState({
      zoomLevel: nextZoom,
      metersPerPixel: nextMpp,
    });
  }

  pan(deltaX: number, deltaY: number): void {
    this.updateState({
      isAutoFollow: false,
      panOffset: {
        x: this.state.panOffset.x + deltaX,
        y: this.state.panOffset.y + deltaY,
      },
    });
  }

  recenter(): void {
    this.updateState({
      isAutoFollow: true,
      panOffset: { x: 0, y: 0 },
      centerCoordinate: this.currentTarget ?? this.state.centerCoordinate,
    });
  }

  setDimensions(width: number, height: number): void {
    if (this.state.viewportWidth === width && this.state.viewportHeight === height) {
      return;
    }
    this.updateState({
      viewportWidth: width,
      viewportHeight: height,
    });
  }

  private updateState(partial: Partial<MapViewportState>): void {
    this.state = { ...this.state, ...partial };
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  dispose(): void {
    this.listeners.clear();
  }
}
