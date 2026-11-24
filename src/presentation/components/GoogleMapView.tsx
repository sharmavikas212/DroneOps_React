/**
 * Google Maps Presentation View
 * Renders real-time drone telemetry and in-memory snail trail over Google Maps tiles.
 * Supports PROVIDER_GOOGLE with a tactical dark map theme.
 * Follows Constitution Principle I, II, III, IV.
 */

import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { DroneTelemetry } from '../../data/model/DroneTelemetry';
import { BreadcrumbPoint } from '../state/DashboardUiState';
import { colors } from '../../theme/colors';
import { DroneMarker } from './DroneMarker';
import { HomeMarker } from './HomeMarker';
import { MapControls } from './MapControls';

export interface GoogleMapViewProps {
  telemetry: DroneTelemetry | null;
  breadcrumbs: BreadcrumbPoint[];
  isStale: boolean;
  height?: number;
  testID?: string;
  isAutoFollow?: boolean;
  zoomLevel?: number;
  onPanDrag?: () => void;
  onRecenter?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
}

// Tactical dark map styling for Google Maps tiles
const tacticalDarkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0B0F14' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0B0F14' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94A3B8' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#CBD5E1' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748B' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1E293B' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0F172A' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#030712' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#475569' }],
  },
];

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  telemetry,
  breadcrumbs,
  isStale,
  height = 320,
  testID = 'google-map-view',
  isAutoFollow = true,
  zoomLevel = 1.0,
  onPanDrag,
  onRecenter,
  onZoomIn,
  onZoomOut,
}) => {
  const currentRegion = telemetry
    ? {
        latitude: telemetry.latitude,
        longitude: telemetry.longitude,
        latitudeDelta: 0.008 / Math.max(0.5, zoomLevel),
        longitudeDelta: 0.008 / Math.max(0.5, zoomLevel),
      }
    : {
        latitude: -33.8688,
        longitude: 151.2093,
        latitudeDelta: 0.01 / Math.max(0.5, zoomLevel),
        longitudeDelta: 0.01 / Math.max(0.5, zoomLevel),
      };

  const polylineCoords = breadcrumbs.map((pt) => ({
    latitude: pt.latitude,
    longitude: pt.longitude,
  }));

  const homeCoord =
    breadcrumbs.length > 0
      ? {
          latitude: breadcrumbs[0].latitude,
          longitude: breadcrumbs[0].longitude,
        }
      : null;

  // Web platform fallback notice
  if (Platform.OS === 'web') {
    return (
      <View testID={testID} style={[styles.webFallbackContainer, { height }]}>
        <Text style={styles.webFallbackTitle}>GOOGLE MAPS (WEB PREVIEW)</Text>
        <Text style={styles.webFallbackText}>
          Native Google Maps requires Android or iOS device runtime.
        </Text>
        <Text style={styles.webFallbackSubtext}>
          Use RADAR HUD mode for 100% offline-first web monitoring.
        </Text>
        {telemetry && (
          <Text style={styles.webCoordsText}>
            GPS: {telemetry.latitude.toFixed(6)}, {telemetry.longitude.toFixed(6)} | Trail:{' '}
            {breadcrumbs.length} pts
          </Text>
        )}
      </View>
    );
  }

  return (
    <View testID={testID} style={[styles.container, { height }]}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        customMapStyle={tacticalDarkMapStyle}
        region={isAutoFollow ? currentRegion : undefined}
        initialRegion={currentRegion}
        onPanDrag={onPanDrag}
        showsCompass={true}
        showsScale={true}
      >
        {/* In-Memory Live Snail Trail Polyline */}
        {polylineCoords.length >= 2 && (
          <Polyline
            testID="google-map-polyline"
            coordinates={polylineCoords}
            strokeColor={isStale ? colors.status.warning : colors.metric.cyan}
            strokeWidth={3}
          />
        )}

        {/* Takeoff / Home Origin Marker */}
        {homeCoord && (
          <Marker
            testID="google-map-home-marker"
            coordinate={homeCoord}
            title="Launch Origin"
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <HomeMarker x={11} y={11} />
          </Marker>
        )}

        {/* Live Drone Vehicle Marker */}
        {telemetry && (
          <Marker
            testID="google-map-drone-marker"
            coordinate={{
              latitude: telemetry.latitude,
              longitude: telemetry.longitude,
            }}
            rotation={telemetry.headingDegrees}
            anchor={{ x: 0.5, y: 0.5 }}
            flat={true}
          >
            <DroneMarker
              x={14}
              y={14}
              headingDegrees={0} // Rotation is handled by Marker rotation prop
              isStale={isStale}
            />
          </Marker>
        )}
      </MapView>

      {/* Floating Tactical Overlay Badge */}
      <View style={styles.providerBadge}>
        <Text style={styles.providerBadgeText}>GOOGLE MAPS</Text>
      </View>

      {/* Map Action Controls (Zoom and RE-CENTER) */}
      {onZoomIn && onZoomOut && onRecenter && (
        <MapControls
          zoomLevel={zoomLevel}
          isAutoFollow={isAutoFollow}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
          onRecenter={onRecenter}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  providerBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderColor: colors.border,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  providerBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  webFallbackContainer: {
    backgroundColor: '#070A0E',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  webFallbackTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.metric.cyan,
    letterSpacing: 1,
    marginBottom: 8,
  },
  webFallbackText: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  webFallbackSubtext: {
    fontSize: 10,
    color: colors.textDisabled,
    textAlign: 'center',
    marginBottom: 12,
  },
  webCoordsText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.metric.green,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});
