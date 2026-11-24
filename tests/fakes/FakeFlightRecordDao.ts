/**
 * In-memory Mock FlightRecordDao for Deterministic Testing
 * Complies with Constitution Principle V.
 */

import { FlightRecord } from '../../src/data/local/models/FlightRecordEntity';

export interface IFlightRecordDao {
  initDatabase(): Promise<void>;
  insertFlightRecord(record: FlightRecord): Promise<void>;
  getAllFlightRecords(): Promise<FlightRecord[]>;
  deleteFlightRecord(id: string): Promise<void>;
  clearAllFlightRecords(): Promise<void>;
}

export class FakeFlightRecordDao implements IFlightRecordDao {
  private records: Map<string, FlightRecord> = new Map();
  public isInitialized: boolean = false;
  public insertCallCount: number = 0;

  async initDatabase(): Promise<void> {
    this.isInitialized = true;
  }

  async insertFlightRecord(record: FlightRecord): Promise<void> {
    this.insertCallCount++;
    this.records.set(record.id, { ...record });
  }

  async getAllFlightRecords(): Promise<FlightRecord[]> {
    return Array.from(this.records.values()).sort(
      (a, b) => b.startTimeMillis - a.startTimeMillis
    );
  }

  async deleteFlightRecord(id: string): Promise<void> {
    this.records.delete(id);
  }

  async clearAllFlightRecords(): Promise<void> {
    this.records.clear();
  }

  // Test inspection helper
  getRecordCount(): number {
    return this.records.size;
  }
}
