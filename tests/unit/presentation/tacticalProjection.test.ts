/**
 * Unit Tests for Tactical Projection Utility
 * Validates forward projection, inverse projection, distances, bearings, and boundary edge cases.
 */

import {
  calculateBearingDegrees,
  calculateDistanceMeters,
  geoToScreen,
  ProjectionConfig,
  screenToGeo,
} from '../../../src/presentation/utils/tacticalProjection';

describe('tacticalProjection', () => {
  const centerCoordinate = { latitude: 37.7749, longitude: -122.4194 }; // San Francisco
  const config: ProjectionConfig = {
    centerCoordinate,
    viewportWidth: 400,
    viewportHeight: 300,
    metersPerPixel: 2.0,
    panOffset: { x: 0, y: 0 },
  };

  describe('geoToScreen & screenToGeo', () => {
    it('projects the center coordinate directly to the viewport center', () => {
      const screenPoint = geoToScreen(centerCoordinate, config);
      expect(screenPoint.x).toBeCloseTo(200, 3);
      expect(screenPoint.y).toBeCloseTo(150, 3);
    });

    it('projects points to the north with a lower Y screen coordinate', () => {
      const northCoord = { latitude: centerCoordinate.latitude + 0.001, longitude: centerCoordinate.longitude };
      const screenPoint = geoToScreen(northCoord, config);
      expect(screenPoint.x).toBeCloseTo(200, 3);
      expect(screenPoint.y).toBeLessThan(150);
    });

    it('projects points to the east with a higher X screen coordinate', () => {
      const eastCoord = { latitude: centerCoordinate.latitude, longitude: centerCoordinate.longitude + 0.001 };
      const screenPoint = geoToScreen(eastCoord, config);
      expect(screenPoint.x).toBeGreaterThan(200);
      expect(screenPoint.y).toBeCloseTo(150, 3);
    });

    it('incorporates panOffset into the projected screen point', () => {
      const pannedConfig: ProjectionConfig = {
        ...config,
        panOffset: { x: 50, y: -30 },
      };
      const screenPoint = geoToScreen(centerCoordinate, pannedConfig);
      expect(screenPoint.x).toBeCloseTo(250, 3);
      expect(screenPoint.y).toBeCloseTo(120, 3);
    });

    it('accurately round-trips from geographic to screen and back', () => {
      const targetCoord = { latitude: 37.778, longitude: -122.415 };
      const screenPoint = geoToScreen(targetCoord, config);
      const invertedCoord = screenToGeo(screenPoint, config);

      expect(invertedCoord.latitude).toBeCloseTo(targetCoord.latitude, 6);
      expect(invertedCoord.longitude).toBeCloseTo(targetCoord.longitude, 6);
    });

    it('handles negative or zero metersPerPixel gracefully', () => {
      const fallbackConfig: ProjectionConfig = {
        ...config,
        metersPerPixel: 0,
      };
      const screenPoint = geoToScreen(centerCoordinate, fallbackConfig);
      expect(screenPoint.x).toBe(200);
      expect(screenPoint.y).toBe(150);
    });
  });

  describe('calculateDistanceMeters', () => {
    it('returns zero for identical coordinates', () => {
      const distance = calculateDistanceMeters(centerCoordinate, centerCoordinate);
      expect(distance).toBe(0);
    });

    it('calculates expected distance for 1 degree of latitude (~111.1 km)', () => {
      const coord1 = { latitude: 0, longitude: 0 };
      const coord2 = { latitude: 1.0, longitude: 0 };
      const distance = calculateDistanceMeters(coord1, coord2);
      expect(distance).toBeGreaterThan(110500);
      expect(distance).toBeLessThan(111500);
    });

    it('calculates short tactical displacement (~100m)', () => {
      // 0.0009 degrees latitude is ~100m
      const coord1 = { latitude: 37.7749, longitude: -122.4194 };
      const coord2 = { latitude: 37.7758, longitude: -122.4194 };
      const distance = calculateDistanceMeters(coord1, coord2);
      expect(distance).toBeGreaterThan(95);
      expect(distance).toBeLessThan(105);
    });
  });

  describe('calculateBearingDegrees', () => {
    it('calculates due North bearing (~0 degrees)', () => {
      const from = { latitude: 37.7749, longitude: -122.4194 };
      const to = { latitude: 37.7849, longitude: -122.4194 };
      const bearing = calculateBearingDegrees(from, to);
      expect(bearing).toBeCloseTo(0, 1);
    });

    it('calculates due East bearing (~90 degrees)', () => {
      const from = { latitude: 37.7749, longitude: -122.4194 };
      const to = { latitude: 37.7749, longitude: -122.4094 };
      const bearing = calculateBearingDegrees(from, to);
      expect(bearing).toBeCloseTo(90, 1);
    });

    it('calculates due South bearing (~180 degrees)', () => {
      const from = { latitude: 37.7749, longitude: -122.4194 };
      const to = { latitude: 37.7649, longitude: -122.4194 };
      const bearing = calculateBearingDegrees(from, to);
      expect(bearing).toBeCloseTo(180, 1);
    });

    it('calculates due West bearing (~270 degrees)', () => {
      const from = { latitude: 37.7749, longitude: -122.4194 };
      const to = { latitude: 37.7749, longitude: -122.4294 };
      const bearing = calculateBearingDegrees(from, to);
      expect(bearing).toBeCloseTo(270, 1);
    });
  });
});
