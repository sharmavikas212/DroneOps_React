/**
 * Contract: Flight History Presentation & State
 * Feature: 002-navigation-shell
 * Principle II: Screens in app/ render UI state only, zero business logic.
 */

import { FlightRecordEntity } from '../../../src/data/local/models/FlightRecordEntity';
import { FlightRecordDao } from '../../../src/data/local/FlightRecordDao';

export interface FlightHistoryUiState {
  records: FlightRecordEntity[];
  isLoading: boolean;
  errorMessage: string | null;
  isEmpty: boolean;
}

export interface UseFlightHistoryOptions {
  dao?: FlightRecordDao;
  autoLoad?: boolean;
}

export interface UseFlightHistoryReturn extends FlightHistoryUiState {
  refresh: () => Promise<void>;
}
