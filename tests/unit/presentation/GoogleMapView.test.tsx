/**
 * Unit Tests for GoogleMapView Component
 * Validates MapView initialization, polyline rendering, and marker placement.
 */

import React from 'react';
import { Platform } from 'react-native';
import { DroneTelemetry } from '../../../src/data/model/DroneTelemetry';
import { GoogleMapView } from '../../../src/presentation/components/GoogleMapView';
import { colors } from '../../../src/theme/colors';

describe('GoogleMapView', () => {
  const sampleTelemetry: DroneTelemetry = {
    timestamp: 1700000000000,
    latitude: 37.7749,
    longitude: -122.4194,
    altitudeMeters: 45.0,
    airspeedMps: 12.0,
    headingDegrees: 135.0,
    batteryPercentage: 90.0,
  };

  const sampleBreadcrumbs = [
    { latitude: 37.7749, longitude: -122.4194, timestamp: 1700000000000 },
    { latitude: 37.7755, longitude: -122.4190, timestamp: 1700000001000 },
  ];

  it('renders MapView with Polyline and Markers on native platform', () => {
    (Platform as any).OS = 'android';

    const element = GoogleMapView({
      telemetry: sampleTelemetry,
      breadcrumbs: sampleBreadcrumbs,
      isStale: false,
    }) as React.ReactElement<any>;

    expect(element.props.testID).toBe('google-map-view');

    const mapView = element.props.children[0];
    expect(mapView).toBeDefined();

    const mapChildren = React.Children.toArray(mapView.props.children) as React.ReactElement<any>[];

    const polyline = mapChildren.find((c: any) => c.props.testID === 'google-map-polyline');
    expect(polyline).toBeDefined();
    expect(polyline?.props.strokeColor).toBe(colors.metric.cyan);
    expect(polyline?.props.coordinates.length).toBe(2);

    const homeMarker = mapChildren.find((c: any) => c.props.testID === 'google-map-home-marker');
    expect(homeMarker).toBeDefined();
    expect(homeMarker?.props.coordinate).toEqual({
      latitude: 37.7749,
      longitude: -122.4194,
    });

    const droneMarker = mapChildren.find((c: any) => c.props.testID === 'google-map-drone-marker');
    expect(droneMarker).toBeDefined();
    expect(droneMarker?.props.rotation).toBe(135.0);

    // Active auto-follow region centers on drone coordinates
    expect(mapView.props.region).toBeDefined();
    expect(mapView.props.region.latitude).toBe(37.7749);
    expect(mapView.props.region.longitude).toBe(-122.4194);
  });

  it('sets region to undefined when isAutoFollow is false to allow manual map inspection', () => {
    (Platform as any).OS = 'android';

    const onRecenterMock = jest.fn();
    const onZoomInMock = jest.fn();
    const onZoomOutMock = jest.fn();

    const element = GoogleMapView({
      telemetry: sampleTelemetry,
      breadcrumbs: sampleBreadcrumbs,
      isStale: false,
      isAutoFollow: false,
      onRecenter: onRecenterMock,
      onZoomIn: onZoomInMock,
      onZoomOut: onZoomOutMock,
    }) as React.ReactElement<any>;

    const mapView = element.props.children[0];
    expect(mapView.props.region).toBeUndefined();

    // Controls overlay should be present with isAutoFollow false
    const controls = element.props.children[2];
    expect(controls).toBeDefined();
    expect(controls.props.isAutoFollow).toBe(false);
  });

  it('updates Polyline color to warning amber when isStale is true', () => {
    (Platform as any).OS = 'android';

    const element = GoogleMapView({
      telemetry: sampleTelemetry,
      breadcrumbs: sampleBreadcrumbs,
      isStale: true,
    }) as React.ReactElement<any>;

    const mapView = element.props.children[0];
    const mapChildren = React.Children.toArray(mapView.props.children) as React.ReactElement<any>[];
    const polyline = mapChildren.find((c: any) => c.props.testID === 'google-map-polyline');

    expect(polyline?.props.strokeColor).toBe(colors.status.warning);
  });

  it('renders web fallback with informative guidance when Platform.OS is web', () => {
    (Platform as any).OS = 'web';

    const element = GoogleMapView({
      telemetry: sampleTelemetry,
      breadcrumbs: sampleBreadcrumbs,
      isStale: false,
    }) as React.ReactElement<any>;

    expect(element.props.testID).toBe('google-map-view');
    const title = element.props.children[0];
    expect(title.props.children).toBe('GOOGLE MAPS (WEB PREVIEW)');
  });
});
