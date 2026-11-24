/**
 * Flight History UI State
 * Feature: 003-flight-history-ui
 *
 * Implements constraints from data-model.md for:
 * - FlightHistoryUiState.records (FlightRecord[])
 * - FlightHistoryUiState.searchQuery (string)
 * - FlightHistoryUiState.filteredRecords (FlightRecord[])
 * - FlightHistoryUiState.selectedRecord (FlightRecord | null)
 * - FlightHistoryUiState.isLoading (boolean)
 * - FlightHistoryUiState.isDeleting (boolean)
 * - FlightHistoryUiState.errorMessage (string | null)
 * - FlightHistoryUiState.isEmpty (boolean)
 * - FlightHistoryUiState.isSearchEmpty (boolean)
 * - DeleteTarget (type, recordId, recordSummary, totalCount)
 */

import { FlightRecord } from '../../data/local/models/FlightRecordEntity';

export interface DeleteTarget {
  type: 'single' | 'bulk';
  recordId?: string;
  recordSummary?: string;
  totalCount?: number;
}

export interface FlightHistoryUiState {
  /** Chronological list of completed flight records */
  records: FlightRecord[];
  /** Current text query entered into search bar */
  searchQuery: string;
  /** Filtered subset of records matching searchQuery */
  filteredRecords: FlightRecord[];
  /** Currently selected record for detailed inspection modal, or null */
  selectedRecord: FlightRecord | null;
  /** Flag indicating SQLite query or load is in progress */
  isLoading: boolean;
  /** Flag indicating record deletion or purge is in progress */
  isDeleting: boolean;
  /** Error message if loading or deleting records failed */
  errorMessage: string | null;
  /** True when records array is empty and loading is complete */
  isEmpty: boolean;
  /** True when records > 0 but filteredRecords is 0 (no search matches) */
  isSearchEmpty: boolean;
}

export const initialFlightHistoryUiState: FlightHistoryUiState = {
  records: [],
  searchQuery: '',
  filteredRecords: [],
  selectedRecord: null,
  isLoading: true,
  isDeleting: false,
  errorMessage: null,
  isEmpty: false,
  isSearchEmpty: false,
};
