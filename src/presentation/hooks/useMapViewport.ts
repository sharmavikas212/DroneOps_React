/**
 * Presentation Hook: useMapViewport
 * Encapsulates camera positioning, auto-follow tracking, zoom scaling, and manual panning.
 * Connects to MapViewportController following Constitution Principle II.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_METERS_PER_PIXEL,
  DEFAULT_VIEWPORT_HEIGHT,
  DEFAULT_VIEWPORT_WIDTH,
  GeoCoordinate,
  MapViewportState,
} from '../state/MapViewportState';
import { MapViewportController } from '../state/MapViewportController';

export interface UseMapViewportProps {
  /** Target live drone coordinate for auto-centering */
  targetCoordinate: GeoCoordinate | null;
  /** Viewport pixel width */
  initialWidth?: number;
  /** Viewport pixel height */
  initialHeight?: number;
  /** Base scale in meters per pixel at zoom 1.0 */
  baseMetersPerPixel?: number;
}

export interface UseMapViewportResult {
  viewportState: MapViewportState;
  zoomIn: () => void;
  zoomOut: () => void;
  pan: (deltaX: number, deltaY: number) => void;
  recenter: () => void;
  setDimensions: (width: number, height: number) => void;
}

export function useMapViewport({
  targetCoordinate,
  initialWidth = DEFAULT_VIEWPORT_WIDTH,
  initialHeight = DEFAULT_VIEWPORT_HEIGHT,
  baseMetersPerPixel = DEFAULT_METERS_PER_PIXEL,
}: UseMapViewportProps): UseMapViewportResult {
  const controller = useMemo(
    () =>
      new MapViewportController({
        initialTarget: targetCoordinate,
        initialWidth,
        initialHeight,
        baseMetersPerPixel,
      }),
    []
  );

  const [viewportState, setViewportState] = useState<MapViewportState>(() => controller.getState());

  useEffect(() => {
    const unsubscribe = controller.subscribe((nextState) => {
      setViewportState(nextState);
    });
    return () => {
      unsubscribe();
      controller.dispose();
    };
  }, [controller]);

  useEffect(() => {
    controller.updateTarget(targetCoordinate);
  }, [controller, targetCoordinate]);

  const zoomIn = useCallback(() => controller.zoomIn(), [controller]);
  const zoomOut = useCallback(() => controller.zoomOut(), [controller]);
  const pan = useCallback((dx: number, dy: number) => controller.pan(dx, dy), [controller]);
  const recenter = useCallback(() => controller.recenter(), [controller]);
  const setDimensions = useCallback(
    (w: number, h: number) => controller.setDimensions(w, h),
    [controller]
  );

  return {
    viewportState,
    zoomIn,
    zoomOut,
    pan,
    recenter,
    setDimensions,
  };
}
