/**
 * React Presentation Hook: useTelemetryDashboard
 * Subscribes to TelemetryDashboardController and provides reactive HUD state.
 */

import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';
import { TelemetrySource } from '../../data/source/TelemetrySource';
import { DroneTelemetryRepository } from '../../data/repository/DroneTelemetryRepository';
import { DashboardUiState } from '../state/DashboardUiState';
import { TelemetryDashboardController } from '../state/TelemetryDashboardController';

export interface UseTelemetryDashboardOptions {
  source?: TelemetrySource;
  repository?: DroneTelemetryRepository;
  controller?: TelemetryDashboardController;
}

export interface UseTelemetryDashboardReturn extends DashboardUiState {
  connect: () => void;
  disconnect: () => void;
  clearBreadcrumbs: () => void;
  controller: TelemetryDashboardController;
}

export function useTelemetryDashboard(
  options: UseTelemetryDashboardOptions = {}
): UseTelemetryDashboardReturn {
  const controller = useMemo(() => {
    return options.controller ?? new TelemetryDashboardController(options.source, options.repository);
  }, [options.controller, options.source, options.repository]);

  const state = useSyncExternalStore(
    useCallback((onStoreChange) => controller.subscribe(onStoreChange), [controller]),
    useCallback(() => controller.getState(), [controller])
  );

  const connect = useCallback(() => {
    controller.connect();
  }, [controller]);

  const disconnect = useCallback(() => {
    controller.disconnect();
  }, [controller]);

  const clearBreadcrumbs = useCallback(() => {
    controller.clearBreadcrumbs();
  }, [controller]);

  useEffect(() => {
    return () => {
      // Clean up controller if locally created
      if (!options.controller) {
        controller.dispose();
      }
    };
  }, [controller, options.controller]);

  return {
    ...state,
    connect,
    disconnect,
    clearBreadcrumbs,
    controller,
  };
}
