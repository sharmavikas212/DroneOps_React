/**
 * SQLite Flight Record DAO Implementation
 * Encapsulates CRUD operations for flight summaries using expo-sqlite.
 * Complies with Constitution Principle IV.
 */

import * as SQLite from 'expo-sqlite';
import { FlightDatabase } from './FlightDatabase';
import { FlightRecord } from './models/FlightRecordEntity';

export interface IFlightRecordDao {
  initDatabase(): Promise<void>;
  insertFlightRecord(record: FlightRecord): Promise<void>;
  getAllFlightRecords(): Promise<FlightRecord[]>;
  deleteFlightRecord(id: string): Promise<void>;
  clearAllFlightRecords(): Promise<void>;
}

export class FlightRecordDao implements IFlightRecordDao {
  private initPromise: Promise<void> | null = null;

  constructor(private db: SQLite.SQLiteDatabase = FlightDatabase.getDatabase()) {}

  async initDatabase(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = FlightDatabase.initDatabase(this.db);
    }
    await this.initPromise;
  }

  async insertFlightRecord(record: FlightRecord): Promise<void> {
    await this.initDatabase();
    const query = `
      INSERT INTO flight_records (
        id, startTimeMillis, endTimeMillis, durationSeconds,
        maxAltitudeMeters, averageSpeedMps, minBatteryPercentage
      ) VALUES (?, ?, ?, ?, ?, ?, ?);
    `;

    await this.db.runAsync(
      query,
      record.id,
      record.startTimeMillis,
      record.endTimeMillis,
      record.durationSeconds,
      record.maxAltitudeMeters,
      record.averageSpeedMps,
      record.minBatteryPercentage
    );
  }

  async getAllFlightRecords(): Promise<FlightRecord[]> {
    await this.initDatabase();
    const query = `SELECT * FROM flight_records ORDER BY startTimeMillis DESC;`;
    const results = await this.db.getAllAsync<FlightRecord>(query);
    return results;
  }

  async deleteFlightRecord(id: string): Promise<void> {
    await this.initDatabase();
    const query = `DELETE FROM flight_records WHERE id = ?;`;
    await this.db.runAsync(query, id);
  }

  async clearAllFlightRecords(): Promise<void> {
    await this.initDatabase();
    const query = `DELETE FROM flight_records;`;
    await this.db.runAsync(query);
  }
}
