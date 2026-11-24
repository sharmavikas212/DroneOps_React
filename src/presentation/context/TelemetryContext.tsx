/**
 * Telemetry Context & Provider
 * Feature: 002-navigation-shell
 *
 * Implements constraints from data-model.md for:
 * - TelemetryContextValue.connectionState ('Connecting' | 'Connected' | 'Disconnected' | 'Error')
 * - TelemetryContextValue.telemetry (DroneTelemetry | null)
 * - TelemetryContextValue.isStale (boolean)
 * - TelemetryContextValue.breadcrumbs (BreadcrumbPoint[])
 * - TelemetryContextValue.errorMessage (string | null)
 *
 * Complies with Constitution Principle II: lightweight React Context for dependency wiring.
 * Ensures 3-second watchdog timer and telemetry stream persist across screen navigation.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from 'react';
import { FlightRecordDao } from '../../data/local/FlightRecordDao';
import { DroneTelemetryRepository } from '../../data/repository/DroneTelemetryRepository';
import { SimulatedTelemetrySource } from '../../data/source/SimulatedTelemetrySource';
import { TelemetrySource } from '../../data/source/TelemetrySource';
import { DashboardUiState } from '../state/DashboardUiState';
import { TelemetryDashboardController } from '../state/TelemetryDashboardController';

export interface TelemetryContextValue extends DashboardUiState {
  connect: () => void;
  disconnect: () => Promise<void> | void;
  clearBreadcrumbs: () => void;
  controller: TelemetryDashboardController;
}

export interface TelemetryProviderProps {
  children: React.ReactNode;
  source?: TelemetrySource;
  repository?: DroneTelemetryRepository;
  controller?: TelemetryDashboardController;
}

export const TelemetryContext = createContext<TelemetryContextValue | null>(null);

export const TelemetryProvider: React.FC<TelemetryProviderProps> = ({
  children,
  source,
  repository,
  controller: externalController,
}) => {
  const controller = useMemo(() => {
    if (externalController) {
      return externalController;
    }
    const telemetrySource = source ?? new SimulatedTelemetrySource();
    const flightRecordDao = new FlightRecordDao();
    const telemetryRepo =
      repository ?? new DroneTelemetryRepository(telemetrySource, flightRecordDao);
    return new TelemetryDashboardController(telemetrySource, telemetryRepo);
  }, [externalController, source, repository]);

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
      if (!externalController) {
        controller.dispose();
      }
    };
  }, [controller, externalController]);

  const contextValue: TelemetryContextValue = useMemo(
    () => ({
      ...state,
      connect,
      disconnect,
      clearBreadcrumbs,
      controller,
    }),
    [state, connect, disconnect, clearBreadcrumbs, controller]
  );

  return (
    <TelemetryContext.Provider value={contextValue}>
      {children}
    </TelemetryContext.Provider>
  );
};
