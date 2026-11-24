/**
 * Unit Tests for TacticalMap Component (User Story 1 - FR-001, FR-002, FR-015, SC-001)
 * Validates radar grid, idle state, live drone marker mounting, stale signal badge,
 * and MapDisplayMode toggle ('RADAR' <-> 'GOOGLE_MAPS').
 */

import React from 'react';
import { DroneTelemetry } from '../../../src/data/model/DroneTelemetry';
import { TacticalMapView } from '../../../src/presentation/components/TacticalMap';

describe('TacticalMap', () => {
  const sampleTelemetry: DroneTelemetry = {
    timestamp: 1700000000000,
    latitude: 37.7749,
    longitude: -122.4194,
    altitudeMeters: 45.0,
    airspeedMps: 12.0,
    headingDegrees: 90.0,
    batteryPercentage: 95.0,
  };

  it('renders with testID and displays idle banner when telemetry is null', () => {
    const element = TacticalMapView({
      telemetry: null,
      breadcrumbs: [],
      isStale: false,
      connectionState: 'Disconnected',
    }) as React.ReactElement<any>;

    expect(element.props.testID).toBe('tactical-map');

    // Traverse children to find idle banner in canvas
    const canvas = element.props.children[1];
    const canvasChildren = React.Children.toArray(canvas.props.children);
    const idleBanner = canvasChildren.find(
      (child: any) => child && child.props && child.props.testID === 'map-idle-banner'
    );
    expect(idleBanner).toBeDefined();
  });

  it('renders live drone marker and dismisses idle banner when telemetry is present', () => {
    const element = TacticalMapView({
      telemetry: sampleTelemetry,
      breadcrumbs: [
        {
          latitude: sampleTelemetry.latitude,
          longitude: sampleTelemetry.longitude,
          timestamp: sampleTelemetry.timestamp,
        },
      ],
      isStale: false,
      connectionState: 'Connected',
    }) as React.ReactElement<any>;

    const canvas = element.props.children[1];
    const canvasChildren = React.Children.toArray(canvas.props.children);

    const idleBanner = canvasChildren.find(
      (child: any) => child && child.props && child.props.testID === 'map-idle-banner'
    );
    expect(idleBanner).toBeUndefined();

    // DroneMarker is rendered
    const droneMarker = canvasChildren.find(
      (child: any) => child && child.props && child.props.headingDegrees === 90.0
    );
    expect(droneMarker).toBeDefined();
  });

  it('renders SnailTrail and HomeMarker when multiple breadcrumbs are present', () => {
    const element = TacticalMapView({
      telemetry: sampleTelemetry,
      breadcrumbs: [
        { latitude: 37.7749, longitude: -122.4194, timestamp: 1000 },
        { latitude: 37.7755, longitude: -122.4190, timestamp: 2000 },
        { latitude: 37.7760, longitude: -122.4185, timestamp: 3000 },
      ],
      isStale: false,
      connectionState: 'Connected',
    }) as React.ReactElement<any>;

    const canvas = element.props.children[1];
    const canvasChildren = React.Children.toArray(canvas.props.children);

    const snailTrail = canvasChildren.find(
      (child: any) => child && child.props && Array.isArray(child.props.screenPoints)
    );
    expect(snailTrail).toBeDefined();
    expect((snailTrail as any).props.screenPoints.length).toBe(3);

    // HomeMarker is rendered at origin
    const homeMarker = canvasChildren.find(
      (child: any) => child && child.type && child.type.name === 'HomeMarker'
    );
    expect(homeMarker).toBeDefined();
  });

  it('renders MapControls when zoom and recenter callbacks are provided', () => {
    const onZoomIn = jest.fn();
    const onZoomOut = jest.fn();
    const onRecenter = jest.fn();

    const element = TacticalMapView({
      telemetry: sampleTelemetry,
      breadcrumbs: [],
      isStale: false,
      connectionState: 'Connected',
      onZoomIn,
      onZoomOut,
      onRecenter,
    }) as React.ReactElement<any>;

    const canvas = element.props.children[1];
    const canvasChildren = React.Children.toArray(canvas.props.children);

    const mapControls = canvasChildren.find(
      (child: any) => child && child.type && child.type.name === 'MapControls'
    );
    expect(mapControls).toBeDefined();
  });

  it('renders stale warning badge in header when isStale is true', () => {
    const element = TacticalMapView({
      telemetry: sampleTelemetry,
      breadcrumbs: [],
      isStale: true,
      connectionState: 'Disconnected',
    }) as React.ReactElement<any>;

    const header = element.props.children[0];
    const headerControls = header.props.children[1];
    const badgeGroup = headerControls.props.children[1];
    const staleBadge = badgeGroup.props.children;
    expect(staleBadge.props.testID).toBe('map-stale-badge');
  });

  it('triggers onToggleMapMode when map-mode-toggle button is pressed', () => {
    const onToggleMapMode = jest.fn();

    const element = TacticalMapView({
      telemetry: sampleTelemetry,
      breadcrumbs: [],
      isStale: false,
      connectionState: 'Connected',
      mapMode: 'RADAR',
      onToggleMapMode,
    }) as React.ReactElement<any>;

    const header = element.props.children[0];
    const headerControls = header.props.children[1];
    const toggleBtn = headerControls.props.children[0];

    expect(toggleBtn.props.testID).toBe('map-mode-toggle');
    toggleBtn.props.onPress();
    expect(onToggleMapMode).toHaveBeenCalledTimes(1);
  });

  it('renders GoogleMapView when mapMode is set to GOOGLE_MAPS', () => {
    const element = TacticalMapView({
      telemetry: sampleTelemetry,
      breadcrumbs: [],
      isStale: false,
      connectionState: 'Connected',
      mapMode: 'GOOGLE_MAPS',
    }) as React.ReactElement<any>;

    // In GOOGLE_MAPS mode, element.props.children[1] is GoogleMapView
    const googleMapChild = element.props.children[1];
    expect(googleMapChild).toBeDefined();
    expect(googleMapChild.type.name).toBe('GoogleMapView');
  });
});
