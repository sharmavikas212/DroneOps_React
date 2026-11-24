/**
 * Unit Tests for HomeMarker Component (User Story 3 - FR-004, FR-005)
 * Validates takeoff origin marker placement, testID, and tactical green styling.
 */

import React from 'react';
import { HomeMarker } from '../../../src/presentation/components/HomeMarker';
import { colors } from '../../../src/theme/colors';

describe('HomeMarker', () => {
  it('renders with testID and applies centered coordinates style', () => {
    const element = HomeMarker({
      x: 180,
      y: 140,
    }) as React.ReactElement<any>;

    expect(element.props.testID).toBe('home-marker');

    const flatStyle = Object.assign({}, ...[].concat(element.props.style));
    expect(flatStyle.left).toBe(180 - 11);
    expect(flatStyle.top).toBe(140 - 11);
  });

  it('renders tactical H symbol in green anchor ring', () => {
    const element = HomeMarker({
      x: 200,
      y: 150,
    }) as React.ReactElement<any>;

    const outerRing = element.props.children;
    const outerRingStyle = Object.assign({}, ...[].concat(outerRing.props.style));
    expect(outerRingStyle.borderColor).toBe(colors.metric.green);

    const homeText = outerRing.props.children;
    expect(homeText.props.children).toBe('H');
    const textStyle = Object.assign({}, ...[].concat(homeText.props.style));
    expect(textStyle.color).toBe(colors.metric.green);
  });
});
