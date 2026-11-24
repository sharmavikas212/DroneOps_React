/**
 * Flight Database Manager (expo-sqlite)
 * Manages database initialization and table schema migrations.
 */

import * as SQLite from 'expo-sqlite';

export const DATABASE_NAME = 'droneops.db';

export const CREATE_FLIGHT_RECORDS_TABLE_QUERY = `
  CREATE TABLE IF NOT EXISTS flight_records (
    id TEXT PRIMARY KEY NOT NULL,
    startTimeMillis INTEGER NOT NULL,
    endTimeMillis INTEGER NOT NULL,
    durationSeconds INTEGER NOT NULL,
    maxAltitudeMeters REAL NOT NULL,
    averageSpeedMps REAL NOT NULL,
    minBatteryPercentage REAL NOT NULL
  );
`;

export class FlightDatabase {
  private static instance: SQLite.SQLiteDatabase | null = null;

  /**
   * Returns the shared SQLite database instance.
   */
  static getDatabase(dbName: string = DATABASE_NAME): SQLite.SQLiteDatabase {
    if (!this.instance) {
      this.instance = SQLite.openDatabaseSync(dbName);
    }
    return this.instance;
  }

  /**
   * Initializes schema and creates tables if they do not already exist.
   */
  static async initDatabase(db: SQLite.SQLiteDatabase = this.getDatabase()): Promise<void> {
    await db.execAsync(CREATE_FLIGHT_RECORDS_TABLE_QUERY);
  }

  /**
   * Resets database instance reference (useful for testing).
   */
  static resetInstance(): void {
    this.instance = null;
  }
}
