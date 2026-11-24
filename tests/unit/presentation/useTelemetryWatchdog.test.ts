/**
 * Unit Tests for 3-Second Heartbeat Watchdog & Stale Data Retention (User Story 2)
 * Tests scenarios SC-002, SC-003 with virtual clocks.
 */

import { FakeTelemetrySource } from '../../fakes/FakeTelemetrySource';
import { TelemetryDashboardController } from '../../../src/presentation/state/TelemetryDashboardController';
import { DroneTelemetry } from '../../../src/data/model/DroneTelemetry';

describe('useTelemetryWatchdog - User Story 2 (3-Second Heartbeat Watchdog)', () => {
  let source: FakeTelemetrySource;
  let controller: TelemetryDashboardController;

  const samplePacket: DroneTelemetry = {
    timestamp: 1700000000000,
    latitude: 37.7749,
    longitude: -122.4194,
    altitudeMeters: 45.5,
    airspeedMps: 12.3,
    headingDegrees: 180.0,
    batteryPercentage: 95.0,
  };

  beforeEach(() => {
    jest.useFakeTimers();
    source = new FakeTelemetrySource();
    controller = new TelemetryDashboardController(source);
  });

  afterEach(() => {
    controller.dispose();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('watchdog timer transitions to Disconnected after 3 seconds', () => {
    controller.connect();
    controller.handleIncomingPacket(samplePacket);

    expect(controller.getState().connectionState).toBe('Connected');
    expect(controller.getState().isStale).toBe(false);

    // Advance virtual clock by 3000ms without packet
    jest.advanceTimersByTime(3000);

    const state = controller.getState();
    expect(state.connectionState).toBe('Disconnected');
    expect(state.isStale).toBe(true);
    // Crucial: last-known telemetry values are retained, NOT cleared!
    expect(state.telemetry).toEqual(samplePacket);
  });

  it('connection attempt aborts after 3-second timeout', () => {
    controller.connect();
    expect(controller.getState().connectionState).toBe('Connecting');

    // Advance virtual clock by 3000ms with zero packets received
    jest.advanceTimersByTime(3000);

    const state = controller.getState();
    expect(state.connectionState).toBe('Error');
    expect(state.errorMessage).toBeTruthy();
  });

  it('micro-drops below 3 seconds do NOT trigger false disconnect', () => {
    controller.connect();
    controller.handleIncomingPacket(samplePacket);

    // 2 seconds elapsed (below 3s threshold)
    jest.advanceTimersByTime(2000);
    expect(controller.getState().connectionState).toBe('Connected');
    expect(controller.getState().isStale).toBe(false);

    // Packet arrives at 2.0s -> resets watchdog timer
    const secondPacket: DroneTelemetry = {
      ...samplePacket,
      timestamp: samplePacket.timestamp + 2000,
      altitudeMeters: 48.0,
    };
    controller.handleIncomingPacket(secondPacket);

    // Advance another 2000ms (total 4000ms, but delta from last packet is only 2000ms)
    jest.advanceTimersByTime(2000);
    expect(controller.getState().connectionState).toBe('Connected');
    expect(controller.getState().isStale).toBe(false);
  });

  it('incoming packet clears stale indicator and restores Connected', () => {
    controller.connect();
    controller.handleIncomingPacket(samplePacket);

    // Trigger disconnect via timeout
    jest.advanceTimersByTime(3000);
    expect(controller.getState().connectionState).toBe('Disconnected');
    expect(controller.getState().isStale).toBe(true);

    // Packet resumes
    const resumePacket: DroneTelemetry = {
      ...samplePacket,
      timestamp: samplePacket.timestamp + 5000,
      altitudeMeters: 55.0,
    };
    controller.handleIncomingPacket(resumePacket);

    const state = controller.getState();
    expect(state.connectionState).toBe('Connected');
    expect(state.isStale).toBe(false);
    expect(state.telemetry?.altitudeMeters).toBe(55.0);
  });
});
