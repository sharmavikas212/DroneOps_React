/**
 * Consumer Hook: useTelemetryContext
 * Feature: 002-navigation-shell
 *
 * Provides components within TelemetryProvider access to shared telemetry stream,
 * watchdog state, and connection actions.
 */

import { useContext } from 'react';
import { TelemetryContext, TelemetryContextValue } from '../context/TelemetryContext';

export function useTelemetryContext(): TelemetryContextValue {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error('useTelemetryContext must be used within a TelemetryProvider');
  }
  return context;
}
