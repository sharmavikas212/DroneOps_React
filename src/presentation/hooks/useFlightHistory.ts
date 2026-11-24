/**
 * Presentation Hook: useFlightHistory
 * Feature: 002-navigation-shell
 *
 * Fetches completed flight records from SQLite FlightRecordDao.
 * Complies with Constitution Principle II: presentation logic decoupled from screens.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlightRecordDao, IFlightRecordDao } from '../../data/local/FlightRecordDao';
import {
  FlightHistoryUiState,
  initialFlightHistoryUiState,
} from '../state/FlightHistoryUiState';

export interface UseFlightHistoryOptions {
  dao?: IFlightRecordDao;
  autoLoad?: boolean;
}

export interface UseFlightHistoryReturn extends FlightHistoryUiState {
  refresh: () => Promise<void>;
}

export function useFlightHistory(
  options: UseFlightHistoryOptions = {}
): UseFlightHistoryReturn {
  const { autoLoad = true } = options;
  const dao = useMemo(() => options.dao ?? new FlightRecordDao(), [options.dao]);

  const [state, setState] = useState<FlightHistoryUiState>(initialFlightHistoryUiState);

  const fetchRecords = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, errorMessage: null }));
    try {
      const records = await dao.getAllFlightRecords();
      setState({
        records,
        isLoading: false,
        errorMessage: null,
        isEmpty: records.length === 0,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load flight records';
      setState({
        records: [],
        isLoading: false,
        errorMessage: message,
        isEmpty: false,
      });
    }
  }, [dao]);

  useEffect(() => {
    if (autoLoad) {
      void fetchRecords();
    }
  }, [autoLoad, fetchRecords]);

  return {
    ...state,
    refresh: fetchRecords,
  };
}
