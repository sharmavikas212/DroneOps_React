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
    expect(finalPacket.latitude).toBe(37.7749);
    expect(finalPacket.longitude).toBe(-122.4194);
  });
});
