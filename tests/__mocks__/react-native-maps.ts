/**
 * Deterministic react-native-maps Mock for Unit Tests
 * Complies with Constitution Principle V.
 */

import React from 'react';

export const PROVIDER_GOOGLE = 'google';
export const PROVIDER_DEFAULT = 'default';

export const Marker = (props: any) => React.createElement('Marker', props, props?.children);
export const Polyline = (props: any) => React.createElement('Polyline', props, props?.children);
export const MapView = (props: any) => React.createElement('MapView', props, props?.children);

export default MapView;
