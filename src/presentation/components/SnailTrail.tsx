/**
 * Snail Trail Component
 * Renders an in-memory chronological flight breadcrumb trail using tactical vector segments.
 * Conforms to specs/004-map-snail-trail/contracts/tactical-map-components.contract.ts
 * Cites constraints from data-model.md for ScreenPoint.x and ScreenPoint.y.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SnailTrailProps } from '../../../specs/004-map-snail-trail/contracts/tactical-map-components.contract';
import { colors } from '../../theme/colors';

const STROKE_WIDTH = 2;
const MIN_SEGMENT_PIXELS = 1.0;

export const SnailTrail: React.FC<SnailTrailProps> = ({
  screenPoints,
  isStale,
  testID = 'snail-trail',
}) => {
  if (!screenPoints || screenPoints.length < 2) {
    return null;
  }

  const trailColor = isStale ? colors.status.warning : colors.metric.cyan;

  // Build segments connecting consecutive points
  const segments: React.ReactNode[] = [];
  let previousPoint = screenPoints[0];

  for (let i = 1; i < screenPoints.length; i++) {
    const currentPoint = screenPoints[i];
    const dx = currentPoint.x - previousPoint.x;
    const dy = currentPoint.y - previousPoint.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    // Skip redundant segments when hovering in place
    if (length < MIN_SEGMENT_PIXELS) {
      continue;
    }

    const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
    const cx = (previousPoint.x + currentPoint.x) / 2;
    const cy = (previousPoint.y + currentPoint.y) / 2;

    segments.push(
      <View
        key={`seg-${i}`}
        testID={`trail-segment-${i}`}
        style={[
          styles.segment,
          {
            left: cx - length / 2,
            top: cy - STROKE_WIDTH / 2,
            width: length,
            height: STROKE_WIDTH,
            backgroundColor: trailColor,
            transform: [{ rotate: `${angleDeg}deg` }],
          },
        ]}
      />
    );

    // Node waypoint dot
    segments.push(
      <View
        key={`dot-${i}`}
        testID={`trail-dot-${i}`}
        style={[
          styles.nodeDot,
          {
            left: currentPoint.x - 2,
            top: currentPoint.y - 2,
            backgroundColor: trailColor,
          },
        ]}
      />
    );

    previousPoint = currentPoint;
  }

  return (
    <View testID={testID} style={styles.container} pointerEvents="none">
      {segments}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },
  segment: {
    position: 'absolute',
    opacity: 0.75,
  },
  nodeDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    opacity: 0.9,
  },
});
