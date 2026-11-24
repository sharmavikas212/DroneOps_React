/**
 * Tactical Map Component
 * Primary HUD visualization rendering radar coordinate grid, range rings,
 * compass axes, drone marker, snail trail, home marker, and viewport controls.
 * Supports dual MapDisplayModes: 'RADAR' (vector HUD) and 'GOOGLE_MAPS' (native tiles).
 * Conforms to specs/004-map-snail-trail/contracts/tactical-map-components.contract.ts
 * Follows Constitution Principle I, II, III, IV.
 */

import React, { useMemo, useState } from 'react';
import {
  LayoutChangeEvent,
  PanResponder,
  PanResponderGestureState,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { TacticalMapProps } from '../../../specs/004-map-snail-trail/contracts/tactical-map-components.contract';
import { colors } from '../../theme/colors';
import { useMapViewport } from '../hooks/useMapViewport';
import {
  DEFAULT_METERS_PER_PIXEL,
  DEFAULT_VIEWPORT_HEIGHT,
  DEFAULT_VIEWPORT_WIDTH,
  GeoCoordinate,
  initialMapViewportState,
  MapViewportState,
} from '../state/MapViewportState';
import { geoToScreen } from '../utils/tacticalProjection';
import { DroneMarker } from './DroneMarker';
import { HomeMarker } from './HomeMarker';
import { MapControls } from './MapControls';
import { SnailTrail } from './SnailTrail';
import { GoogleMapView } from './GoogleMapView';

export type MapDisplayMode = 'RADAR' | 'GOOGLE_MAPS';

export interface TacticalMapViewProps extends TacticalMapProps {
  viewportState?: MapViewportState;
  mapMode?: MapDisplayMode;
  onToggleMapMode?: () => void;
  onPan?: (dx: number, dy: number) => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onRecenter?: () => void;
  onLayoutDimensions?: (width: number, height: number) => void;
}

/**
 * Pure Presentational Tactical Map View
 */
export const TacticalMapView: React.FC<TacticalMapViewProps> = ({
  telemetry,
  breadcrumbs,
  isStale,
  connectionState,
  height = 320,
  testID = 'tactical-map',
  viewportState: customViewport,
  mapMode = 'RADAR',
  onToggleMapMode,
  onPan,
  onZoomIn,
  onZoomOut,
  onRecenter,
  onLayoutDimensions,
}) => {
  const effectiveCenter: GeoCoordinate | null =
    customViewport?.centerCoordinate ??
    (telemetry ? { latitude: telemetry.latitude, longitude: telemetry.longitude } : null);

  const viewportState: MapViewportState = customViewport ?? {
    ...initialMapViewportState,
    centerCoordinate: effectiveCenter,
  };

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height: layoutHeight } = event.nativeEvent.layout;
    if (width > 0 && layoutHeight > 0 && onLayoutDimensions) {
      onLayoutDimensions(width, layoutHeight);
    }
  };

  // Pan responder for touch drag panning
  const panResponder = onPan
    ? PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_evt, gestureState: PanResponderGestureState) =>
          Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3,
        onPanResponderMove: (_evt, gestureState: PanResponderGestureState) => {
          onPan(gestureState.dx * 0.1, gestureState.dy * 0.1);
        },
      })
    : null;

  // Compute drone screen position if telemetry is present and center coordinate exists
  const droneScreenPoint =
    telemetry && viewportState.centerCoordinate
      ? geoToScreen(
          { latitude: telemetry.latitude, longitude: telemetry.longitude },
          {
            centerCoordinate: viewportState.centerCoordinate,
            viewportWidth: viewportState.viewportWidth,
            viewportHeight: viewportState.viewportHeight,
            metersPerPixel: viewportState.metersPerPixel,
            panOffset: viewportState.panOffset,
          }
        )
      : null;

  // Project all accumulated breadcrumbs to screen coordinates for the snail trail
  const trailScreenPoints =
    breadcrumbs && breadcrumbs.length >= 2 && viewportState.centerCoordinate
      ? breadcrumbs.map((pt) =>
          geoToScreen(
            { latitude: pt.latitude, longitude: pt.longitude },
            {
              centerCoordinate: viewportState.centerCoordinate!,
              viewportWidth: viewportState.viewportWidth,
              viewportHeight: viewportState.viewportHeight,
              metersPerPixel: viewportState.metersPerPixel,
              panOffset: viewportState.panOffset,
            }
          )
        )
      : [];

  // Project Launch / Home point (first breadcrumb point)
  const homeScreenPoint =
    breadcrumbs && breadcrumbs.length > 0 && viewportState.centerCoordinate
      ? geoToScreen(
          { latitude: breadcrumbs[0].latitude, longitude: breadcrumbs[0].longitude },
          {
            centerCoordinate: viewportState.centerCoordinate,
            viewportWidth: viewportState.viewportWidth,
            viewportHeight: viewportState.viewportHeight,
            metersPerPixel: viewportState.metersPerPixel,
            panOffset: viewportState.panOffset,
          }
        )
      : null;

  return (
    <View testID={testID} style={[styles.container, { height }]} onLayout={onLayout}>
      {/* Tactical Map Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerTitle}>
            {mapMode === 'RADAR' ? 'TACTICAL RADAR HUD' : 'GOOGLE MAPS GCS'}
          </Text>
          {mapMode === 'RADAR' && (
            <Text style={styles.zoomText}>{viewportState.zoomLevel.toFixed(1)}x</Text>
          )}
        </View>

        <View style={styles.headerControlsGroup}>
          {/* Map Display Mode Switcher (RADAR <-> GOOGLE MAPS) */}
          <TouchableOpacity
            testID="map-mode-toggle"
            style={styles.modeToggleBtn}
            onPress={onToggleMapMode}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.modeToggleText,
                mapMode === 'RADAR' ? styles.modeActiveText : styles.modeInactiveText,
              ]}
            >
              RADAR
            </Text>
            <Text style={styles.modeToggleDivider}>|</Text>
            <Text
              style={[
                styles.modeToggleText,
                mapMode === 'GOOGLE_MAPS' ? styles.modeActiveText : styles.modeInactiveText,
              ]}
            >
              MAP
            </Text>
          </TouchableOpacity>

          <View style={styles.badgeGroup}>
            {isStale ? (
              <View testID="map-stale-badge" style={styles.staleBadge}>
                <Text style={styles.staleBadgeText}>SIGNAL LOST</Text>
              </View>
            ) : mapMode === 'RADAR' ? (
              <View
                style={[
                  styles.modeBadge,
                  viewportState.isAutoFollow ? styles.autoFollowBadge : styles.manualPanBadge,
                ]}
              >
                <Text style={styles.modeBadgeText}>
                  {viewportState.isAutoFollow ? 'AUTO' : 'PAN'}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      {/* Main Map View Area: Either Google Maps View or Tactical Radar Grid */}
      {mapMode === 'GOOGLE_MAPS' ? (
        <GoogleMapView
          telemetry={telemetry}
          breadcrumbs={breadcrumbs}
          isStale={isStale}
          height={height - 75}
          isAutoFollow={viewportState.isAutoFollow}
          zoomLevel={viewportState.zoomLevel}
          onPanDrag={() => onPan?.(1, 1)}
          onRecenter={onRecenter}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
        />
      ) : (
        <View style={styles.canvasArea} {...(panResponder ? panResponder.panHandlers : {})}>
          {/* Cardinal Axis Markers */}
          <Text style={[styles.cardinalLabel, styles.northLabel]}>N</Text>
          <Text style={[styles.cardinalLabel, styles.southLabel]}>S</Text>
          <Text style={[styles.cardinalLabel, styles.eastLabel]}>E</Text>
          <Text style={[styles.cardinalLabel, styles.westLabel]}>W</Text>

          {/* Concentric Range Rings */}
          <View style={[styles.rangeRing, styles.ringSmall]} />
          <View style={[styles.rangeRing, styles.ringMedium]} />
          <View style={[styles.rangeRing, styles.ringLarge]} />

          {/* Crosshair Axes */}
          <View style={styles.crosshairVertical} />
          <View style={styles.crosshairHorizontal} />

          {/* Idle Awaiting Signal Overlay */}
          {!telemetry && (
            <View testID="map-idle-banner" style={styles.idleOverlay}>
              <Text style={styles.idleText}>AWAITING TELEMETRY SIGNAL</Text>
              <Text style={styles.idleSubtext}>Connect stream to activate GPS tracking</Text>
            </View>
          )}

          {/* Stale Signal Caution Overlay */}
          {telemetry && isStale && (
            <View testID="tactical-stale-banner" style={styles.staleCanvasBanner}>
              <Text style={styles.staleCanvasBannerText}>
                ⚠️ SIGNAL LOST — LAST KNOWN POSITION
              </Text>
            </View>
          )}

          {/* In-Memory Live Snail Trail */}
          {trailScreenPoints.length >= 2 && (
            <SnailTrail screenPoints={trailScreenPoints} isStale={isStale} />
          )}

          {/* Launch / Home Origin Marker */}
          {homeScreenPoint && (
            <HomeMarker x={homeScreenPoint.x} y={homeScreenPoint.y} />
          )}

          {/* Drone Marker */}
          {droneScreenPoint && telemetry && (
            <DroneMarker
              x={droneScreenPoint.x}
              y={droneScreenPoint.y}
              headingDegrees={telemetry.headingDegrees}
              isStale={isStale}
            />
          )}

          {/* Viewport Action Controls (Zoom and RE-CENTER) */}
          {onZoomIn && onZoomOut && onRecenter && (
            <MapControls
              zoomLevel={viewportState.zoomLevel}
              isAutoFollow={viewportState.isAutoFollow}
              onZoomIn={onZoomIn}
              onZoomOut={onZoomOut}
              onRecenter={onRecenter}
            />
          )}
        </View>
      )}

      {/* Footer Readouts */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {mapMode === 'RADAR'
            ? `Scale: ~${Math.round(viewportState.metersPerPixel * 40)}m grid`
            : `Provider: Google Maps (Vector)`}
        </Text>
        <Text style={styles.footerText}>
          Trail: <Text style={styles.footerHighlight}>{breadcrumbs.length} pts</Text>
        </Text>
      </View>
    </View>
  );
};

/**
 * Connected Tactical Map Component using useMapViewport hook and MapDisplayMode state
 */
export const TacticalMap: React.FC<TacticalMapViewProps> = (props) => {
  const [mapMode, setMapMode] = useState<MapDisplayMode>('RADAR');

  const targetCoordinate = useMemo(() => {
    if (!props.telemetry) return null;
    return { latitude: props.telemetry.latitude, longitude: props.telemetry.longitude };
  }, [props.telemetry]);

  const {
    viewportState,
    zoomIn,
    zoomOut,
    pan,
    recenter,
    setDimensions,
  } = useMapViewport({
    targetCoordinate,
  });

  const toggleMapMode = () => {
    setMapMode((prev) => (prev === 'RADAR' ? 'GOOGLE_MAPS' : 'RADAR'));
  };

  return (
    <TacticalMapView
      {...props}
      mapMode={props.mapMode ?? mapMode}
      onToggleMapMode={props.onToggleMapMode ?? toggleMapMode}
      viewportState={props.viewportState ?? viewportState}
      onPan={props.onPan ?? pan}
      onZoomIn={props.onZoomIn ?? zoomIn}
      onZoomOut={props.onZoomOut ?? zoomOut}
      onRecenter={props.onRecenter ?? recenter}
      onLayoutDimensions={props.onLayoutDimensions ?? setDimensions}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#070A0E',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.metric.cyan,
    letterSpacing: 1,
  },
  zoomText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  headerControlsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 4,
  },
  modeToggleText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  modeActiveText: {
    color: colors.metric.cyan,
  },
  modeInactiveText: {
    color: colors.textDisabled,
  },
  modeToggleDivider: {
    fontSize: 9,
    color: colors.border,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  autoFollowBadge: {
    backgroundColor: '#064e3b',
  },
  manualPanBadge: {
    backgroundColor: '#451a03',
  },
  modeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#34d399',
    letterSpacing: 0.5,
  },
  staleBadge: {
    backgroundColor: '#78350f',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  staleBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.status.warning,
    letterSpacing: 0.5,
  },
  canvasArea: {
    flex: 1,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cardinalLabel: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: '800',
    color: colors.textDisabled,
    letterSpacing: 1,
    zIndex: 1,
  },
  northLabel: {
    top: 6,
    alignSelf: 'center',
    color: colors.metric.cyan,
  },
  southLabel: {
    bottom: 6,
    alignSelf: 'center',
  },
  eastLabel: {
    right: 8,
    top: '46%',
  },
  westLabel: {
    left: 8,
    top: '46%',
  },
  rangeRing: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  ringSmall: {
    width: 80,
    height: 80,
  },
  ringMedium: {
    width: 160,
    height: 160,
  },
  ringLarge: {
    width: 240,
    height: 240,
  },
  crosshairVertical: {
    position: 'absolute',
    width: 1,
    height: '100%',
    backgroundColor: colors.border,
  },
  crosshairHorizontal: {
    position: 'absolute',
    height: 1,
    width: '100%',
    backgroundColor: colors.border,
  },
  idleOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(11, 15, 20, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    padding: 16,
  },
  idleText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  idleSubtext: {
    fontSize: 10,
    color: colors.textDisabled,
  },
  staleCanvasBanner: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    backgroundColor: 'rgba(120, 53, 15, 0.9)',
    borderColor: colors.status.warning,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 25,
  },
  staleCanvasBannerText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FEF3C7',
    letterSpacing: 0.8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  footerHighlight: {
    color: colors.metric.cyan,
    fontWeight: '700',
  },
});
