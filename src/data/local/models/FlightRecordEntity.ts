/**
 * Flight Record Entity
 * Represents the persistent SQLite entity defined in data-model.md
 */

export interface FlightRecord {
  /** Unique identifier (UUID string) */
  id: string;
  /** Start epoch timestamp in milliseconds */
  startTimeMillis: number;
  /** End epoch timestamp in milliseconds (>= startTimeMillis) */
  endTimeMillis: number;
  /** Total flight elapsed duration in seconds (>= 0) */
  durationSeconds: number;
  /** Maximum altitude recorded in meters (>= 0.0) */
  maxAltitudeMeters: number;
  /** Average airspeed in meters per second (>= 0.0) */
  averageSpeedMps: number;
  /** Lowest recorded battery percentage (0.0 <= value <= 100.0) */
  minBatteryPercentage: number;
}
