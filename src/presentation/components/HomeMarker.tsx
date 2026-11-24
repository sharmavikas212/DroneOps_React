/**
 * Home / Launch Origin Marker Component
 * Renders a distinct tactical launch anchor symbol pinned at mission origin.
 * Conforms to specs/004-map-snail-trail/contracts/tactical-map-components.contract.ts
 * Cites constraints from data-model.md for HomePoint.latitude and HomePoint.longitude.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { HomeMarkerProps } from '../../../specs/004-map-snail-trail/contracts/tactical-map-components.contract';
import { colors } from '../../theme/colors';

const MARKER_SIZE = 22;

export const HomeMarker: React.FC<HomeMarkerProps> = ({
  x,
  y,
  testID = 'home-marker',
}) => {
  return (
    <View
      testID={testID}
      style={[
        styles.container,
        {
          left: x - MARKER_SIZE / 2,
          top: y - MARKER_SIZE / 2,
        },
      ]}
      pointerEvents="none"
    >
      <View style={styles.outerRing}>
        <Text style={styles.homeText}>H</Text>
      </View>
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
    zIndex: 8,
  },
  outerRing: {
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: MARKER_SIZE / 2,
    borderWidth: 1.5,
    borderColor: colors.metric.green,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeText: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.metric.green,
    textAlign: 'center',
  },
});
