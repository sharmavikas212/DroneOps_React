/**
 * Contract: Flight History Controller & Presentation Hook
 * Feature: 003-flight-history-ui
 * Complies with Constitution Principle II (Strict Layer Boundaries) and Principle V (Deterministic Testing).
 */

import { FlightRecord } from '../../../src/data/local/models/FlightRecordEntity';
import { IFlightRecordDao } from '../../../src/data/local/FlightRecordDao';

export interface FlightHistoryUiState {
  /** Complete list of historical flight records loaded from SQLite */
  records: FlightRecord[];
  /** Current text query entered into search bar */
  searchQuery: string;
  /** Filtered subset of records matching searchQuery */
  filteredRecords: FlightRecord[];
  /** Currently selected record for detailed inspection modal, or null */
  selectedRecord: FlightRecord | null;
  /** True during initial load or pull-to-refresh */
  isLoading: boolean;
  /** True during asynchronous record deletion or purge */
  isDeleting: boolean;
  /** Tactical error banner message if an operation failed */
  errorMessage: string | null;
  /** True when total records is 0 (global empty state) */
  isEmpty: boolean;
  /** True when records > 0 but filteredRecords is 0 (no search matches) */
  isSearchEmpty: boolean;
}

export type HistoryUnsubscribe = () => void;

export interface IFlightHistoryController {
  getState(): FlightHistoryUiState;
  subscribe(listener: (state: FlightHistoryUiState) => void): HistoryUnsubscribe;
  loadRecords(): Promise<void>;
  setSearchQuery(query: string): void;
  clearSearchQuery(): void;
  selectRecord(record: FlightRecord | null): void;
  deleteRecord(id: string): Promise<boolean>;
  clearAllRecords(): Promise<boolean>;
  dispose(): void;
}

export interface UseFlightHistoryOptions {
  dao?: IFlightRecordDao;
  autoLoad?: boolean;
}

export interface UseFlightHistoryReturn extends FlightHistoryUiState {
  setSearchQuery: (query: string) => void;
  clearSearchQuery: () => void;
  selectRecord: (record: FlightRecord | null) => void;
  deleteRecord: (id: string) => Promise<boolean>;
  clearAllRecords: () => Promise<boolean>;
  refresh: () => Promise<void>;
}
