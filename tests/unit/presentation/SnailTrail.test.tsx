/**
 * Unit Tests for SnailTrail Component (User Story 2 - FR-003, FR-005, SC-002)
 * Validates sequential segment rendering, hover deduplication, and stale status styling.
 */

import React from 'react';
import { SnailTrail } from '../../../src/presentation/components/SnailTrail';
import { colors } from '../../../src/theme/colors';

describe('SnailTrail', () => {
  it('returns null when screenPoints has fewer than 2 points', () => {
    const singlePoint = [{ x: 100, y: 100 }];
    const element = SnailTrail({
      screenPoints: singlePoint,
      isStale: false,
    });
    expect(element).toBeNull();
  });

  it('renders connecting line segments and node dots for consecutive points', () => {
    const points = [
      { x: 100, y: 100 },
      { x: 150, y: 100 }, // Due East (+50px)
      { x: 150, y: 150 }, // Due South (+50px)
    ];

    const element = SnailTrail({
      screenPoints: points,
      isStale: false,
    }) as React.ReactElement<any>;

    expect(element.props.testID).toBe('snail-trail');

    const children = React.Children.toArray(element.props.children) as React.ReactElement<any>[];
    // 2 segments + 2 dots = 4 children
    expect(children.length).toBe(4);

    const firstSegment = children[0];
    expect(firstSegment.props.testID).toBe('trail-segment-1');

    const segmentStyle = Object.assign({}, ...[].concat(firstSegment.props.style));
    expect(segmentStyle.width).toBeCloseTo(50, 1);
    expect(segmentStyle.backgroundColor).toBe(colors.metric.cyan);
    expect(segmentStyle.transform).toEqual([{ rotate: '0deg' }]);
  });

  it('skips redundant segments when consecutive points have identical or near-zero displacement', () => {
    const hoveringPoints = [
      { x: 100, y: 100 },
      { x: 100.2, y: 100.1 }, // Displaced by < 1px (stationary hover)
      { x: 200, y: 200 },     // Moving point
    ];

    const element = SnailTrail({
      screenPoints: hoveringPoints,
      isStale: false,
    }) as React.ReactElement<any>;

    const children = React.Children.toArray(element.props.children) as React.ReactElement<any>[];
    // Segment 1 skipped, only segment 2 (segment + dot = 2 children)
    expect(children.length).toBe(2);
    expect(children[0].props.testID).toBe('trail-segment-2');
  });

  it('renders with amber warning color styling when isStale is true', () => {
    const points = [
      { x: 50, y: 50 },
      { x: 80, y: 80 },
    ];

    const element = SnailTrail({
      screenPoints: points,
      isStale: true,
    }) as React.ReactElement<any>;

    const children = React.Children.toArray(element.props.children) as React.ReactElement<any>[];
    const segment = children[0];
    const segmentStyle = Object.assign({}, ...[].concat(segment.props.style));
    expect(segmentStyle.backgroundColor).toBe(colors.status.warning);
  });
});
