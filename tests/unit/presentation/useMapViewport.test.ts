/**
 * Unit Tests for MapViewportController & Viewport Logic
 * Validates auto-follow tracking, zoom clamping, manual pan offsets, and re-center behavior.
 * Principle V: Deterministic Testing
 */

import { MapViewportController } from '../../../src/presentation/state/MapViewportController';
import { MAX_ZOOM_LEVEL, MIN_ZOOM_LEVEL } from '../../../src/presentation/state/MapViewportState';

describe('MapViewportController', () => {
  const coordA = { latitude: 37.7749, longitude: -122.4194 };
  const coordB = { latitude: 37.7755, longitude: -122.4188 };

  it('initializes with default auto-follow and target coordinates', () => {
    const controller = new MapViewportController({
      initialTarget: coordA,
      initialWidth: 400,
      initialHeight: 300,
      baseMetersPerPixel: 2.0,
    });

    const state = controller.getState();
    expect(state.isAutoFollow).toBe(true);
    expect(state.centerCoordinate).toEqual(coordA);
    expect(state.zoomLevel).toBe(1.0);
    expect(state.panOffset).toEqual({ x: 0, y: 0 });
    expect(state.viewportWidth).toBe(400);
    expect(state.viewportHeight).toBe(300);
  });

  it('updates centerCoordinate automatically when target updates under auto-follow', () => {
    const controller = new MapViewportController({
      initialTarget: coordA,
    });

    expect(controller.getState().centerCoordinate).toEqual(coordA);

    controller.updateTarget(coordB);
    expect(controller.getState().centerCoordinate).toEqual(coordB);
  });

  it('increases zoom and reduces metersPerPixel when zoomIn is invoked, up to MAX_ZOOM_LEVEL', () => {
    const controller = new MapViewportController({
      initialTarget: coordA,
      baseMetersPerPixel: 2.0,
    });

    controller.zoomIn();
    expect(controller.getState().zoomLevel).toBeCloseTo(1.5);
    expect(controller.getState().metersPerPixel).toBeCloseTo(2.0 / 1.5);

    // Zoom multiple times past limit
    for (let i = 0; i < 10; i++) {
      controller.zoomIn();
    }

    expect(controller.getState().zoomLevel).toBe(MAX_ZOOM_LEVEL);
  });

  it('decreases zoom and increases metersPerPixel when zoomOut is invoked, down to MIN_ZOOM_LEVEL', () => {
    const controller = new MapViewportController({
      initialTarget: coordA,
      baseMetersPerPixel: 2.0,
    });

    controller.zoomOut();
    expect(controller.getState().zoomLevel).toBeCloseTo(1.0 / 1.5);

    // Zoom out multiple times past limit
    for (let i = 0; i < 10; i++) {
      controller.zoomOut();
    }

    expect(controller.getState().zoomLevel).toBe(MIN_ZOOM_LEVEL);
  });

  it('pauses auto-follow and accumulates panOffset when pan is called', () => {
    const controller = new MapViewportController({
      initialTarget: coordA,
    });

    controller.pan(25, -15);
    expect(controller.getState().isAutoFollow).toBe(false);
    expect(controller.getState().panOffset).toEqual({ x: 25, y: -15 });

    controller.pan(10, 5);
    expect(controller.getState().panOffset).toEqual({ x: 35, y: -10 });
  });

  it('does not auto-update centerCoordinate when target changes if auto-follow is paused', () => {
    const controller = new MapViewportController({
      initialTarget: coordA,
    });

    controller.pan(10, 10);
    expect(controller.getState().isAutoFollow).toBe(false);

    controller.updateTarget(coordB);
    // centerCoordinate remains at coordA because auto-follow is paused
    expect(controller.getState().centerCoordinate).toEqual(coordA);
  });

  it('resets panOffset, restores auto-follow, and focuses on target when recenter is called', () => {
    const controller = new MapViewportController({
      initialTarget: coordA,
    });

    controller.pan(40, -50);
    expect(controller.getState().isAutoFollow).toBe(false);

    controller.updateTarget(coordB);
    controller.recenter();

    expect(controller.getState().isAutoFollow).toBe(true);
    expect(controller.getState().panOffset).toEqual({ x: 0, y: 0 });
    expect(controller.getState().centerCoordinate).toEqual(coordB);
  });

  it('notifies subscribers upon state changes and supports unsubscription', () => {
    const controller = new MapViewportController();
    const listener = jest.fn();
    const unsub = controller.subscribe(listener);

    controller.pan(5, 5);
    expect(listener).toHaveBeenCalledTimes(1);

    unsub();
    controller.pan(5, 5);
    expect(listener).toHaveBeenCalledTimes(1); // No new notifications
  });

  it('updates dimensions when setDimensions is called', () => {
    const controller = new MapViewportController({
      initialWidth: 300,
      initialHeight: 250,
    });

    controller.setDimensions(450, 350);
    expect(controller.getState().viewportWidth).toBe(450);
    expect(controller.getState().viewportHeight).toBe(350);
  });
});
