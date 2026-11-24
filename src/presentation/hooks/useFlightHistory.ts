/**
 * Presentation Hook: useFlightHistory
 * Feature: 003-flight-history-ui
 *
 * Subscribes to FlightHistoryController and provides reactive flight logs state,
 * search filtering, detail inspection, and deletion handlers.
 * Complies with Constitution Principle II: presentation logic decoupled from screens.
 */

import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';
import { FlightRecordDao, IFlightRecordDao } from '../../data/local/FlightRecordDao';
import { FlightRecord } from '../../data/local/models/FlightRecordEntity';
import { FlightHistoryController } from '../state/FlightHistoryController';
import { FlightHistoryUiState } from '../state/FlightHistoryUiState';

export interface UseFlightHistoryOptions {
  dao?: IFlightRecordDao;
  controller?: FlightHistoryController;
  autoLoad?: boolean;
}

export interface UseFlightHistoryReturn extends FlightHistoryUiState {
  setSearchQuery: (query: string) => void;
  clearSearchQuery: () => void;
  selectRecord: (record: FlightRecord | null) => void;
  deleteRecord: (id: string) => Promise<boolean>;
  clearAllRecords: () => Promise<boolean>;
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

  const setSearchQuery = useCallback(
    (query: string) => controller.setSearchQuery(query),
    [controller]
  );

  const clearSearchQuery = useCallback(
    () => controller.clearSearchQuery(),
    [controller]
  );

  const selectRecord = useCallback(
    (record: FlightRecord | null) => controller.selectRecord(record),
    [controller]
  );

  const deleteRecord = useCallback(
    (id: string) => controller.deleteRecord(id),
    [controller]
  );

  const clearAllRecords = useCallback(
    () => controller.clearAllRecords(),
    [controller]
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
    setSearchQuery,
    clearSearchQuery,
    selectRecord,
    deleteRecord,
    clearAllRecords,
    refresh,
    controller,
  };
}
