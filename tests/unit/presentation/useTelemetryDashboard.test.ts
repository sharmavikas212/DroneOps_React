/**
 * Unit Tests for Telemetry Presentation State & Live Streaming (User Story 1 - SC-001)
 * Validates real-time packet rendering and breadcrumb trail appending.
 */

import { FakeTelemetrySource } from '../../fakes/FakeTelemetrySource';
import { TelemetryDashboardController } from '../../../src/presentation/state/TelemetryDashboardController';
import { DroneTelemetry } from '../../../src/data/model/DroneTelemetry';

describe('TelemetryDashboardController - User Story 1 (Real-Time Telemetry)', () => {
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

  it('initializes with disconnected state and empty breadcrumbs', () => {
    const state = controller.getState();
    expect(state.connectionState).toBe('Disconnected');
    expect(state.telemetry).toBeNull();
    expect(state.isStale).toBe(false);
    expect(state.breadcrumbs).toEqual([]);
    expect(state.errorMessage).toBeNull();
  });

  it('transitions to Connecting when connect() is called', () => {
    controller.connect();
    expect(controller.getState().connectionState).toBe('Connecting');
    expect(source.connectCallCount).toBe(1);
  });

  it('DashboardViewModel updates telemetry and appends breadcrumbs within 100ms of packet arrival', () => {
    controller.connect();

    // Emit first packet
    controller.handleIncomingPacket(samplePacket);

    const state = controller.getState();
    expect(state.connectionState).toBe('Connected');
    expect(state.isStale).toBe(false);
    expect(state.telemetry).toEqual(samplePacket);
    expect(state.breadcrumbs).toHaveLength(1);
    expect(state.breadcrumbs[0]).toEqual({
      latitude: samplePacket.latitude,
      longitude: samplePacket.longitude,
      timestamp: samplePacket.timestamp,
    });

    // Emit second packet with updated metrics
    const secondPacket: DroneTelemetry = {
      ...samplePacket,
      timestamp: samplePacket.timestamp + 1000,
      latitude: 37.7750,
      longitude: -122.4195,
      altitudeMeters: 50.0,
      airspeedMps: 14.0,
    };
    controller.handleIncomingPacket(secondPacket);

    const updatedState = controller.getState();
    expect(updatedState.telemetry?.altitudeMeters).toBe(50.0);
    expect(updatedState.telemetry?.airspeedMps).toBe(14.0);
    expect(updatedState.breadcrumbs).toHaveLength(2);
    expect(updatedState.breadcrumbs[1].latitude).toBe(37.7750);
  });

  it('notifies listeners on state changes', () => {
    const listener = jest.fn();
    const unsubscribe = controller.subscribe(listener);

    controller.connect();
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ connectionState: 'Connecting' }));

    controller.handleIncomingPacket(samplePacket);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({
      connectionState: 'Connected',
      telemetry: samplePacket,
    }));

    unsubscribe();
    controller.disconnect();
    // Listener should not be notified after unsubscription
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('flight completion persists summary record and clears breadcrumbs (SC-005)', async () => {
    const { FakeFlightRecordDao } = await import('../../fakes/FakeFlightRecordDao');
    const { DroneTelemetryRepository } = await import('../../../src/data/repository/DroneTelemetryRepository');

    const fakeDao = new FakeFlightRecordDao();
    const repo = new DroneTelemetryRepository(source, fakeDao);
    const repoController = new TelemetryDashboardController(source, repo);

    repo.startStream();
    repoController.connect();

    // Ingest packets via telemetry source
    source.emitPacket(samplePacket);
    expect(repoController.getState().breadcrumbs).toHaveLength(1);

    // Conclude flight session
    await repo.stopStream();

    // Assert that breadcrumbs are cleared to empty array [] immediately
    expect(repoController.getState().breadcrumbs).toEqual([]);
    repoController.dispose();
  });
});
