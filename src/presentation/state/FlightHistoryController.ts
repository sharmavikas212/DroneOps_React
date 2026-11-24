/**
 * Flight History Controller (Presentation Layer)
 * Manages loading flight records from SQLite FlightRecordDao, error handling, and empty state.
 * Complies with Constitution Principle II & V.
 */

import { IFlightRecordDao } from '../../data/local/FlightRecordDao';
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
        isLoading: false,
        errorMessage: 'Database DAO unavailable',
        isEmpty: true,
      });
      return;
    }

    try {
      await this.dao.initDatabase();
      const records = await this.dao.getAllFlightRecords();
      this.updateState({
        records,
        isLoading: false,
        errorMessage: null,
        isEmpty: records.length === 0,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load flight records';
      this.updateState({
        records: [],
        isLoading: false,
        errorMessage: message,
        isEmpty: false,
      });
    }
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
