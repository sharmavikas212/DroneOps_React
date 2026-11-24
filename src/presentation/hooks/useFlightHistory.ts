/**
 * Presentation Hook: useFlightHistory
 * Feature: 002-navigation-shell
 *
 * Subscribes to FlightHistoryController and provides reactive flight logs state.
 * Complies with Constitution Principle II: presentation logic decoupled from screens.
 */

import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';
import { FlightRecordDao, IFlightRecordDao } from '../../data/local/FlightRecordDao';
import { FlightHistoryController } from '../state/FlightHistoryController';
import { FlightHistoryUiState } from '../state/FlightHistoryUiState';

export interface UseFlightHistoryOptions {
  dao?: IFlightRecordDao;
  controller?: FlightHistoryController;
  autoLoad?: boolean;
}

export interface UseFlightHistoryReturn extends FlightHistoryUiState {
  refresh: () => Promise<void>;
  controller: FlightHistoryController;
}

export function useFlightHistory(
  options: UseFlightHistoryOptions = {}
): UseFlightHistoryReturn {
  const { autoLoad = true } = options;

  const controller = useMemo(() => {
    if (options.controller) {
      return options.controller;
    }
    const dao = options.dao ?? new FlightRecordDao();
    return new FlightHistoryController(dao);
  }, [options.controller, options.dao]);

  const state = useSyncExternalStore(
    useCallback((onStoreChange) => controller.subscribe(onStoreChange), [controller]),
    useCallback(() => controller.getState(), [controller])
  );

  const refresh = useCallback(async () => {
    await controller.loadRecords();
  }, [controller]);

  useEffect(() => {
    if (autoLoad) {
      void controller.loadRecords();
    }
  }, [autoLoad, controller]);

  useEffect(() => {
    return () => {
      if (!options.controller) {
        controller.dispose();
      }
    };
  }, [controller, options.controller]);

  return {
    ...state,
    refresh,
    controller,
  };
}
