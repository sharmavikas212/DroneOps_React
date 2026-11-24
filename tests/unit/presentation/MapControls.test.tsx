/**
 * Unit Tests for MapControls Component (User Story 4 - FR-007, FR-008, FR-009, FR-010, SC-004)
 * Validates zoom callbacks and conditional Re-Center button visibility.
 */

import React from 'react';
import { MapControls } from '../../../src/presentation/components/MapControls';

describe('MapControls', () => {
  it('renders zoom in and zoom out buttons and triggers callbacks', () => {
    const onZoomIn = jest.fn();
    const onZoomOut = jest.fn();
    const onRecenter = jest.fn();

    const element = MapControls({
      zoomLevel: 1.0,
      isAutoFollow: true,
      onZoomIn,
      onZoomOut,
      onRecenter,
    }) as React.ReactElement<any>;

    expect(element.props.testID).toBe('map-controls');

    const children = React.Children.toArray(element.props.children) as React.ReactElement<any>[];
    // Under auto-follow, recenter button is not rendered; only zoom group is child
    expect(children.length).toBe(1);

    const zoomGroup = children[0];
    const zoomGroupChildren = React.Children.toArray(zoomGroup.props.children) as React.ReactElement<any>[];
    const zoomInBtn = zoomGroupChildren[0];
    const zoomOutBtn = zoomGroupChildren[2];

    expect(zoomInBtn.props.testID).toBe('zoom-in-button');
    expect(zoomOutBtn.props.testID).toBe('zoom-out-button');

    zoomInBtn.props.onPress();
    expect(onZoomIn).toHaveBeenCalledTimes(1);

    zoomOutBtn.props.onPress();
    expect(onZoomOut).toHaveBeenCalledTimes(1);
  });

  it('renders Re-Center button when isAutoFollow is false and triggers onRecenter', () => {
    const onRecenter = jest.fn();

    const element = MapControls({
      zoomLevel: 2.0,
      isAutoFollow: false,
      onZoomIn: jest.fn(),
      onZoomOut: jest.fn(),
      onRecenter,
    }) as React.ReactElement<any>;

    const children = React.Children.toArray(element.props.children) as React.ReactElement<any>[];
    expect(children.length).toBe(2);

    const recenterBtn = children[0];
    expect(recenterBtn.props.testID).toBe('recenter-button');

    recenterBtn.props.onPress();
    expect(onRecenter).toHaveBeenCalledTimes(1);
  });
});
