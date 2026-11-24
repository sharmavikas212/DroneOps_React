/**
 * Unit Tests for DroneMarker Component
 * Validates coordinate positioning, rotation transforms, and stale status styling.
 */

import React from 'react';
import { DroneMarker } from '../../../src/presentation/components/DroneMarker';
import { colors } from '../../../src/theme/colors';

describe('DroneMarker', () => {
  it('renders with testID and applies coordinates and rotation style', () => {
    const element = DroneMarker({
      x: 150,
      y: 120,
      headingDegrees: 45,
      isStale: false,
    }) as React.ReactElement<any>;

    expect(element.props.testID).toBe('drone-marker');

    const flatStyle = Object.assign({}, ...[].concat(element.props.style));
    expect(flatStyle.left).toBe(150 - 14);
    expect(flatStyle.top).toBe(120 - 14);
    expect(flatStyle.transform).toEqual([{ rotate: '45deg' }]);
  });

  it('renders with nominal cyan color styling when isStale is false', () => {
    const element = DroneMarker({
      x: 100,
      y: 100,
      headingDegrees: 180,
      isStale: false,
    }) as React.ReactElement<any>;

    const children = React.Children.toArray(element.props.children) as React.ReactElement<any>[];
    const outerRing = children[0];
    const outerRingStyle = Object.assign({}, ...[].concat(outerRing.props.style));
    expect(outerRingStyle.borderColor).toBe(colors.metric.cyan);

    const arrow = children[1];
    const arrowStyle = Object.assign({}, ...[].concat(arrow.props.style));
    expect(arrowStyle.borderBottomColor).toBe(colors.metric.cyan);
  });

  it('renders with amber warning styling when isStale is true', () => {
    const element = DroneMarker({
      x: 100,
      y: 100,
      headingDegrees: 270,
      isStale: true,
    }) as React.ReactElement<any>;

    const children = React.Children.toArray(element.props.children) as React.ReactElement<any>[];
    const outerRing = children[0];
    const outerRingStyle = Object.assign({}, ...[].concat(outerRing.props.style));
    expect(outerRingStyle.borderColor).toBe(colors.status.warning);

    const arrow = children[1];
    const arrowStyle = Object.assign({}, ...[].concat(arrow.props.style));
    expect(arrowStyle.borderBottomColor).toBe(colors.status.warning);
  });
});
