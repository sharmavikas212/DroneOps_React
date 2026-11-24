/**
 * Unit Tests for SimulatedTelemetrySource Flight Dynamics
 * Feature: Smooth GPS Dead Reckoning, RTH, and Low Battery Touchdown
 */

import { SimulatedTelemetrySource } from '../../../src/data/source/SimulatedTelemetrySource';
import { DroneTelemetry } from '../../../src/data/model/DroneTelemetry';

describe('SimulatedTelemetrySource Flight Dynamics', () => {
  let source: SimulatedTelemetrySource;

  beforeEach(() => {
    jest.useFakeTimers();
    source = new SimulatedTelemetrySource();
  });

  afterEach(() => {
    source.disconnect();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('emits smooth continuous coordinates during nominal flight', () => {
    const receivedPackets: DroneTelemetry[] = [];
    source.subscribe((packet) => {
      receivedPackets.push(packet);
    });

    source.connect();
    // Advance past handshake
    jest.advanceTimersByTime(200);

    // Initial packet
    expect(receivedPackets).toHaveLength(1);
    expect(receivedPackets[0].batteryPercentage).toBe(99.8);
    expect(receivedPackets[0].altitudeMeters).toBeGreaterThanOrEqual(40.0);

    // Advance 3 seconds (3 ticks)
    jest.advanceTimersByTime(3000);
    expect(receivedPackets).toHaveLength(4);

    // Coordinates should change smoothly by small delta (< 0.0003 deg per second)
    for (let i = 1; i < receivedPackets.length; i++) {
      const prev = receivedPackets[i - 1];
      const curr = receivedPackets[i];
      const deltaLat = Math.abs(curr.latitude - prev.latitude);
      const deltaLon = Math.abs(curr.longitude - prev.longitude);
      expect(deltaLat).toBeLessThan(0.0005);
      expect(deltaLon).toBeLessThan(0.0005);
    }
  });

  it('wanders organically with non-circular dynamic flight path within Sydney geofence', () => {
    const receivedPackets: DroneTelemetry[] = [];
    source.subscribe((packet) => {
      receivedPackets.push(packet);
    });

    source.connect();
    jest.advanceTimersByTime(200);

    // Collect 25 seconds of nominal flight
    jest.advanceTimersByTime(25000);
    expect(receivedPackets.length).toBe(26); // initial + 25 ticks

    const homeLat = -33.8688;
    const homeLon = 151.2093;

    // Compute ground distance from Sydney home base for each point
    const distances = receivedPackets.map((p) => {
      const dLat = (p.latitude - homeLat) * 111139;
      const dLon = (p.longitude - homeLon) * 111139 * Math.cos((homeLat * Math.PI) / 180);
      return Math.sqrt(dLat * dLat + dLon * dLon);
    });

    // Distance should vary dynamically (not a fixed circular radius)
    const minDistance = Math.min(...distances);
    const maxDistance = Math.max(...distances);
    expect(maxDistance - minDistance).toBeGreaterThan(50); // Traversed more than 50m of radial variation

    // All points must stay safely within the Sydney geofence corridor (< 1200m)
    for (const d of distances) {
      expect(d).toBeLessThan(1200);
    }

    // Heading angles must show varied turns rather than a constant rate of rotation
    const headings = receivedPackets.map((p) => p.headingDegrees);
    const headingChanges = [];
    for (let i = 1; i < headings.length; i++) {
      let diff = (headings[i] - headings[i - 1] + 360) % 360;
      if (diff > 180) diff -= 360;
      headingChanges.push(diff);
    }

    // Must have both positive and negative (left and right) turns (non-circular)
    const hasLeftTurn = headingChanges.some((dh) => dh < -1);
    const hasRightTurn = headingChanges.some((dh) => dh > 1);
    expect(hasLeftTurn).toBe(true);
    expect(hasRightTurn).toBe(true);
  });

  it('initiates RTH and glides down to 0m altitude and 0 m/s as battery approaches 0%', () => {
    const receivedPackets: DroneTelemetry[] = [];
    source.subscribe((packet) => {
      receivedPackets.push(packet);
    });

    source.connect();
    jest.advanceTimersByTime(200);

    // Force battery to 5% (landing zone)
    source.setBattery(5.0);

    // Advance 1 second
    jest.advanceTimersByTime(1000);
    const landingPacket = receivedPackets[receivedPackets.length - 1];
    expect(landingPacket.altitudeMeters).toBeLessThan(45.0);
    expect(landingPacket.airspeedMps).toBeLessThan(12.0);

    // Advance until battery hits 0%
    source.setBattery(0.2);
    jest.advanceTimersByTime(1000);

    const finalPacket = receivedPackets[receivedPackets.length - 1];
    expect(finalPacket.batteryPercentage).toBe(0.0);
    expect(finalPacket.altitudeMeters).toBe(0.0);
    expect(finalPacket.airspeedMps).toBe(0.0);
    expect(finalPacket.latitude).toBe(-33.8688);
    expect(finalPacket.longitude).toBe(151.2093);
  });
});
