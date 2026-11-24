/**
 * Unit Tests for Tactical Map Stale State & Trail Purging (User Story 5 - FR-011, FR-012, FR-013, FR-014, SC-006, SC-007)
 * Validates watchdog stale banner, amber styling retention, mission reset purging, and background continuity.
 */

import React from 'react';
import { DroneTelemetry } from '../../../src/data/model/DroneTelemetry';
import { TacticalMapView } from '../../../src/presentation/components/TacticalMap';
import { FakeTelemetrySource } from '../../fakes/FakeTelemetrySource';
import { TelemetryDashboardController } from '../../../src/presentation/state/TelemetryDashboardController';

describe('TacticalMapStaleReset (User Story 5)', () => {
  const sampleTelemetry: DroneTelemetry = {
    timestamp: 1700000000000,
    latitude: 37.7749,
    longitude: -122.4194,
    altitudeMeters: 55.0,
    airspeedMps: 15.0,
    headingDegrees: 180.0,
    batteryPercentage: 75.0,
  };

  const sampleBreadcrumbs = [
    { latitude: 37.7749, longitude: -122.4194, timestamp: 1700000000000 },
    { latitude: 37.7755, longitude: -122.4194, timestamp: 1700000001000 },
    { latitude: 37.7760, longitude: -122.4194, timestamp: 1700000002000 },
  ];

  it('renders tactical-stale-banner and retains last known position when isStale is true', () => {
    const element = TacticalMapView({
      telemetry: sampleTelemetry,
      breadcrumbs: sampleBreadcrumbs,
      isStale: true,
      connectionState: 'Disconnected',
    }) as React.ReactElement<any>;

    const canvas = element.props.children[1];
    const canvasChildren = React.Children.toArray(canvas.props.children);

    const staleBanner = canvasChildren.find(
      (child: any) => child && child.props && child.props.testID === 'tactical-stale-banner'
    );
    expect(staleBanner).toBeDefined();

    // Snail trail is retained
    const snailTrail = canvasChildren.find(
      (child: any) => child && child.props && Array.isArray(child.props.screenPoints)
    );
    expect(snailTrail).toBeDefined();
    expect((snailTrail as any).props.isStale).toBe(true);

    // Drone marker is retained with stale status
    const droneMarker = canvasChildren.find(
      (child: any) => child && child.props && child.props.headingDegrees === 180.0
    );
    expect(droneMarker).toBeDefined();
    expect((droneMarker as any).props.isStale).toBe(true);
  });

  it('completely purges snail trail and home marker when breadcrumbs is empty (flight termination)', () => {
    const element = TacticalMapView({
      telemetry: null,
      breadcrumbs: [],
      isStale: false,
      connectionState: 'Disconnected',
    }) as React.ReactElement<any>;

    const canvas = element.props.children[1];
    const canvasChildren = React.Children.toArray(canvas.props.children);

    // Snail trail is NOT rendered
    const snailTrail = canvasChildren.find(
      (child: any) => child && child.props && Array.isArray(child.props.screenPoints)
    );
    expect(snailTrail).toBeUndefined();

    // Home marker is NOT rendered
    const homeMarker = canvasChildren.find(
      (child: any) => child && child.type && child.type.name === 'HomeMarker'
    );
    expect(homeMarker).toBeUndefined();

    // Drone marker is NOT rendered
    const droneMarker = canvasChildren.find(
      (child: any) => child && child.props && typeof child.props.headingDegrees === 'number'
    );
    expect(droneMarker).toBeUndefined();

    // Idle banner is displayed
    const idleBanner = canvasChildren.find(
      (child: any) => child && child.props && child.props.testID === 'map-idle-banner'
    );
    expect(idleBanner).toBeDefined();
  });

  it('preserves accumulated breadcrumbs in controller across simulated tab navigation', () => {
    jest.useFakeTimers();
    const source = new FakeTelemetrySource();
    const controller = new TelemetryDashboardController(source);

    controller.connect();
    controller.handleIncomingPacket(sampleTelemetry);
    controller.handleIncomingPacket({
      ...sampleTelemetry,
      latitude: 37.7755,
      timestamp: 1700000001000,
    });

    expect(controller.getState().breadcrumbs).toHaveLength(2);

    // Simulate navigating to History tab: subscriber unsubscribes
    const subscriber = jest.fn();
    const unsub = controller.subscribe(subscriber);
    unsub();

    // Telemetry updates while user is on History screen
    controller.handleIncomingPacket({
      ...sampleTelemetry,
      latitude: 37.7760,
      timestamp: 1700000002000,
    });

    // Navigating back to Dashboard: all 3 breadcrumbs preserved
    expect(controller.getState().breadcrumbs).toHaveLength(3);

    // Flight concludes: clearBreadcrumbs() purges all in-memory trail points (Principle IV)
    controller.clearBreadcrumbs();
    expect(controller.getState().breadcrumbs).toHaveLength(0);

    controller.dispose();
    jest.clearAllTimers();
    jest.useRealTimers();
  });
});
