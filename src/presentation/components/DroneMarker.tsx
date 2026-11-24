/**
 * Drone Marker Component
 * Renders an aircraft directional chevron rotated dynamically to headingDegrees.
 * Conforms to specs/004-map-snail-trail/contracts/tactical-map-components.contract.ts
 * Cites constraints from data-model.md for ScreenPoint.x and ScreenPoint.y.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { DroneMarkerProps } from '../../../specs/004-map-snail-trail/contracts/tactical-map-components.contract';
import { colors } from '../../theme/colors';

const MARKER_SIZE = 28;

export const DroneMarker: React.FC<DroneMarkerProps> = ({
  x,
  y,
  headingDegrees,
  isStale,
  testID = 'drone-marker',
}) => {
  const markerColor = isStale ? colors.status.warning : colors.metric.cyan;

  return (
    <View
      testID={testID}
      style={[
        styles.container,
        {
          left: x - MARKER_SIZE / 2,
          top: y - MARKER_SIZE / 2,
          transform: [{ rotate: `${headingDegrees}deg` }],
        },
      ]}
      pointerEvents="none"
    >
      {/* Outer orientation ring */}
      <View style={[styles.outerRing, { borderColor: markerColor }]} />

      {/* Directional Chevron / Arrow */}
      <View
        testID={`${testID}-arrow`}
        style={[
          styles.arrow,
          {
            borderBottomColor: markerColor,
          },
        ]}
      />

      {/* Center Drone Core Dot */}
      <View style={[styles.coreDot, { backgroundColor: markerColor }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  outerRing: {
    position: 'absolute',
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: MARKER_SIZE / 2,
    borderWidth: 1.5,
    opacity: 0.6,
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 12,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -4,
  },
  coreDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    top: MARKER_SIZE / 2 - 3,
    left: MARKER_SIZE / 2 - 3,
  },
});
