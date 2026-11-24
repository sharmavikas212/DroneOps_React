/**
 * Map Controls Component
 * Renders zoom in/out action controls and conditional RE-CENTER button overlay.
 * Conforms to specs/004-map-snail-trail/contracts/tactical-map-components.contract.ts
 * Cites constraints from data-model.md for MapViewportState.isAutoFollow and MapViewportState.zoomLevel.
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MapControlsProps } from '../../../specs/004-map-snail-trail/contracts/tactical-map-components.contract';
import { colors } from '../../theme/colors';

export const MapControls: React.FC<MapControlsProps> = ({
  zoomLevel,
  isAutoFollow,
  onZoomIn,
  onZoomOut,
  onRecenter,
  testID = 'map-controls',
}) => {
  return (
    <View testID={testID} style={styles.container} pointerEvents="box-none">
      {/* Re-Center Button (Visible only when auto-follow is disengaged) */}
      {!isAutoFollow && (
        <TouchableOpacity
          testID="recenter-button"
          style={styles.recenterButton}
          onPress={onRecenter}
          activeOpacity={0.7}
        >
          <Text style={styles.recenterIcon}>⊕</Text>
          <Text style={styles.recenterText}>RE-CENTER</Text>
        </TouchableOpacity>
      )}

      {/* Zoom In & Out Action Buttons */}
      <View style={styles.zoomGroup}>
        <TouchableOpacity
          testID="zoom-in-button"
          style={styles.zoomButton}
          onPress={onZoomIn}
          activeOpacity={0.7}
        >
          <Text style={styles.zoomButtonText}>+</Text>
        </TouchableOpacity>
        <View style={styles.zoomDivider} />
        <TouchableOpacity
          testID="zoom-out-button"
          style={styles.zoomButton}
          onPress={onZoomOut}
          activeOpacity={0.7}
        >
          <Text style={styles.zoomButtonText}>−</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 8,
    zIndex: 15,
  },
  recenterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F172A',
    borderColor: colors.metric.cyan,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 4,
  },
  recenterIcon: {
    fontSize: 12,
    color: colors.metric.cyan,
    fontWeight: '900',
  },
  recenterText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.metric.cyan,
    letterSpacing: 0.8,
  },
  zoomGroup: {
    flexDirection: 'column',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 6,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 4,
  },
  zoomButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  zoomButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 18,
  },
  zoomDivider: {
    height: 1,
    backgroundColor: colors.border,
    width: '100%',
  },
});
