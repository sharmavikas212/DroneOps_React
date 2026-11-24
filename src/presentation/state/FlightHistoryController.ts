/**
 * Flight History Controller (Presentation Layer)
 * Manages flight records, real-time search filtering, selection inspection, and SQLite deletions.
 * Complies with Constitution Principle II & V.
 */

import { IFlightRecordDao } from '../../data/local/FlightRecordDao';
import { FlightRecord } from '../../data/local/models/FlightRecordEntity';
import {
  FlightHistoryUiState,
  initialFlightHistoryUiState,
} from './FlightHistoryUiState';

export type HistoryUnsubscribe = () => void;

export class FlightHistoryController {
  private state: FlightHistoryUiState = { ...initialFlightHistoryUiState };
  private listeners: Set<(state: FlightHistoryUiState) => void> = new Set();

  constructor(private dao?: IFlightRecordDao) {}

  getState(): FlightHistoryUiState {
    return this.state;
  }

  subscribe(listener: (state: FlightHistoryUiState) => void): HistoryUnsubscribe {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  async loadRecords(): Promise<void> {
    this.updateState({
      isLoading: true,
      errorMessage: null,
    });

    if (!this.dao) {
      this.updateState({
        records: [],
        filteredRecords: [],
        isLoading: false,
        errorMessage: 'Database DAO unavailable',
        isEmpty: true,
        isSearchEmpty: false,
      });
      return;
    }

    try {
      await this.dao.initDatabase();
      const records = await this.dao.getAllFlightRecords();
      const filtered = this.filterRecords(records, this.state.searchQuery);

      this.updateState({
        records,
        filteredRecords: filtered,
        isLoading: false,
        errorMessage: null,
        isEmpty: records.length === 0,
        isSearchEmpty: records.length > 0 && filtered.length === 0,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load flight records';
      this.updateState({
        records: [],
        filteredRecords: [],
        isLoading: false,
        errorMessage: message,
        isEmpty: false,
        isSearchEmpty: false,
      });
    }
  }

  setSearchQuery(query: string): void {
    const filtered = this.filterRecords(this.state.records, query);
    this.updateState({
      searchQuery: query,
      filteredRecords: filtered,
      isSearchEmpty: this.state.records.length > 0 && filtered.length === 0,
    });
  }

  clearSearchQuery(): void {
    this.updateState({
      searchQuery: '',
      filteredRecords: this.state.records,
      isSearchEmpty: false,
    });
  }

  selectRecord(record: FlightRecord | null): void {
    this.updateState({
      selectedRecord: record,
    });
  }

  async deleteRecord(id: string): Promise<boolean> {
    if (!this.dao) {
      this.updateState({ errorMessage: 'Database DAO unavailable' });
      return false;
    }

    this.updateState({ isDeleting: true, errorMessage: null });

    try {
      await this.dao.deleteFlightRecord(id);

      const nextRecords = this.state.records.filter((r) => r.id !== id);
      const nextFiltered = this.filterRecords(nextRecords, this.state.searchQuery);
      const nextSelected = this.state.selectedRecord?.id === id ? null : this.state.selectedRecord;

      this.updateState({
        records: nextRecords,
        filteredRecords: nextFiltered,
        selectedRecord: nextSelected,
        isDeleting: false,
        isEmpty: nextRecords.length === 0,
        isSearchEmpty: nextRecords.length > 0 && nextFiltered.length === 0,
      });
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete flight record';
      this.updateState({
        isDeleting: false,
        errorMessage: message,
      });
      return false;
    }
  }

  async clearAllRecords(): Promise<boolean> {
    if (!this.dao) {
      this.updateState({ errorMessage: 'Database DAO unavailable' });
      return false;
    }

    this.updateState({ isDeleting: true, errorMessage: null });

    try {
      await this.dao.clearAllFlightRecords();

      this.updateState({
        records: [],
        filteredRecords: [],
        selectedRecord: null,
        isDeleting: false,
        isEmpty: true,
        isSearchEmpty: false,
      });
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to clear flight records';
      this.updateState({
        isDeleting: false,
        errorMessage: message,
      });
      return false;
    }
  }

  private filterRecords(records: FlightRecord[], query: string): FlightRecord[] {
    const term = query.trim().toLowerCase();
    if (!term) {
      return records;
    }

    return records.filter((r) => {
      const dateObj = new Date(r.startTimeMillis);
      const dateStr = dateObj
        .toLocaleString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
        .toLowerCase();
      const isoStr = dateObj.toISOString().toLowerCase();
      const idMatch = r.id.toLowerCase().includes(term);
      const dateMatch = dateStr.includes(term) || isoStr.includes(term);

      return idMatch || dateMatch;
    });
  }

  private updateState(partial: Partial<FlightHistoryUiState>): void {
    this.state = {
      ...this.state,
      ...partial,
    };
    this.notify();
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  dispose(): void {
    this.listeners.clear();
  }
}
