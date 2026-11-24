/**
 * Unit Tests for TelemetryContext & Background Persistence (User Story 2 - FR-006, FR-007, SC-002, SC-005)
 * Validates background telemetry continuity, watchdog survival across navigation, and context wiring.
 */

import React, { act } from 'react';
import { FakeTelemetrySource } from '../../fakes/FakeTelemetrySource';
import { TelemetryDashboardController } from '../../../src/presentation/state/TelemetryDashboardController';
import { DroneTelemetry } from '../../../src/data/model/DroneTelemetry';
import {
  TelemetryContext,
  TelemetryContextValue,
  TelemetryProvider,
} from '../../../src/presentation/context/TelemetryContext';
import { useTelemetryContext } from '../../../src/presentation/hooks/useTelemetryContext';

describe('TelemetryContext & Continuity - User Story 2 (FR-006, FR-007, SC-002, SC-005)', () => {
  let source: FakeTelemetrySource;
  let controller: TelemetryDashboardController;

  const samplePacket1: DroneTelemetry = {
    timestamp: 1700000000000,
    latitude: 37.7749,
    longitude: -122.4194,
    altitudeMeters: 50.0,
    airspeedMps: 10.0,
    headingDegrees: 90.0,
    batteryPercentage: 90.0,
  };

  const samplePacket2: DroneTelemetry = {
    timestamp: 1700000002000,
    latitude: 37.7752,
    longitude: -122.4191,
    altitudeMeters: 55.0,
    airspeedMps: 11.2,
    headingDegrees: 95.0,
    batteryPercentage: 88.0,
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

  it('throws an informative error when useTelemetryContext is called outside TelemetryProvider', () => {
    jest.spyOn(React, 'useContext').mockReturnValueOnce(null);
    expect(() => {
      useTelemetryContext();
    }).toThrow('useTelemetryContext must be used within a TelemetryProvider');
  });

  it('provides persistent controller and state across subscriber lifecycle', () => {
    let capturedContext: TelemetryContextValue | null = null;

    controller.connect();
    expect(controller.getState().connectionState).toBe('Connecting');

    // Emit packet to connect
    controller.handleIncomingPacket(samplePacket1);
    expect(controller.getState().connectionState).toBe('Connected');
    expect(controller.getState().telemetry?.altitudeMeters).toBe(50.0);

    // Simulate child subscriber subscribing and unsubscribing (navigating away to History)
    const subscriber1 = jest.fn();
    const unsub1 = controller.subscribe(subscriber1);

    // Stream continues in background while on History tab (FR-006)
    controller.handleIncomingPacket(samplePacket2);
    expect(controller.getState().breadcrumbs).toHaveLength(2);
    expect(controller.getState().telemetry?.altitudeMeters).toBe(55.0);

    // Child unmounts when leaving tab
    unsub1();

    // Controller remains alive and watchdog does not trigger falsely before 3s
    jest.advanceTimersByTime(2000);
    expect(controller.getState().connectionState).toBe('Connected');
    expect(controller.getState().isStale).toBe(false);

    // Resubscribing (navigating back to Dashboard, FR-007) immediately has current state
    const subscriber2 = jest.fn();
    const unsub2 = controller.subscribe(subscriber2);
    expect(controller.getState().telemetry?.altitudeMeters).toBe(55.0);
    expect(controller.getState().breadcrumbs).toHaveLength(2);

    unsub2();
  });

  it('watchdog triggers stale disconnect in background if packet feed pauses for >= 3 seconds', () => {
    controller.connect();
    controller.handleIncomingPacket(samplePacket1);
    expect(controller.getState().connectionState).toBe('Connected');

    // Advance beyond 3000ms watchdog timeout while user is on another screen
    jest.advanceTimersByTime(3000);

    expect(controller.getState().connectionState).toBe('Disconnected');
    expect(controller.getState().isStale).toBe(true);
    // Last known telemetry is preserved
    expect(controller.getState().telemetry?.altitudeMeters).toBe(50.0);
  });
});
