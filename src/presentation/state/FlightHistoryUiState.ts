/**
 * Flight History UI State
 * Feature: 002-navigation-shell
 *
 * Implements constraints from data-model.md for:
 * - FlightHistoryUiState.records (FlightRecord[])
 * - FlightHistoryUiState.isLoading (boolean)
 * - FlightHistoryUiState.errorMessage (string | null)
 * - FlightHistoryUiState.isEmpty (boolean)
 */

import { FlightRecord } from '../../data/local/models/FlightRecordEntity';

export interface FlightHistoryUiState {
  /** Chronological list of completed flight records */
  records: FlightRecord[];
  /** Flag indicating SQLite query is in progress */
  isLoading: boolean;
  /** Error message if loading records failed */
  errorMessage: string | null;
  /** True when records array is empty and loading is complete */
  isEmpty: boolean;
}

export const initialFlightHistoryUiState: FlightHistoryUiState = {
  records: [],
  isLoading: true,
  errorMessage: null,
  isEmpty: false,
};
