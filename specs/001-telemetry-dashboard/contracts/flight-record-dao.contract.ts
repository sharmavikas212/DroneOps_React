/**
 * Contract: Flight Record DAO & Local Storage Interface
 * Location: src/data/local/FlightRecordDao.ts
 */

export interface FlightRecord {
  /** Unique identifier (UUID v4 or nanoid string) */
  id: string;
  /** Session start epoch timestamp in milliseconds */
  startTimeMillis: number;
  /** Session end epoch timestamp in milliseconds */
  endTimeMillis: number;
  /** Total flight elapsed duration in seconds */
  durationSeconds: number;
  /** Maximum altitude recorded during flight in meters */
  maxAltitudeMeters: number;
  /** Mean airspeed across all telemetry samples in m/s */
  averageSpeedMps: number;
  /** Lowest battery percentage recorded during flight */
  minBatteryPercentage: number;
}

export interface FlightRecordDao {
  /**
   * Initializes SQLite database table schema if not already present.
   */
  initDatabase(): Promise<void>;

  /**
   * Inserts a completed flight summary record into SQLite.
   * Resolves when insertion is committed.
   */
  insertFlightRecord(record: FlightRecord): Promise<void>;

  /**
   * Retrieves all persisted flight records, ordered by startTimeMillis DESC.
   */
  getAllFlightRecords(): Promise<FlightRecord[]>;

  /**
   * Deletes a specific flight record by ID.
   */
  deleteFlightRecord(id: string): Promise<void>;

  /**
   * Clears all flight records (primarily for testing/maintenance).
   */
  clearAllFlightRecords(): Promise<void>;
}
