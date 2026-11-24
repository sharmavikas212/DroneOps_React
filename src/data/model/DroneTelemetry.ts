/**
 * Core Drone Telemetry Model & Validation
 * Enforces field validation rules defined in data-model.md
 */

export interface DroneTelemetry {
  /** Unix epoch timestamp in milliseconds (integer > 0) */
  timestamp: number;
  /** Geographic latitude in decimal degrees (-90.0 <= latitude <= 90.0) */
  latitude: number;
  /** Geographic longitude in decimal degrees (-180.0 <= longitude <= 180.0) */
  longitude: number;
  /** Height above ground level in meters (>= 0.0) */
  altitudeMeters: number;
  /** True airspeed in meters per second (>= 0.0) */
  airspeedMps: number;
  /** Compass heading relative to true north (0.0 <= headingDegrees < 360.0) */
  headingDegrees: number;
  /** Remaining battery percentage (0.0 <= batteryPercentage <= 100.0) */
  batteryPercentage: number;
}

/**
 * Validates a DroneTelemetry packet against constraints defined in data-model.md.
 */
export function validateTelemetry(packet: DroneTelemetry): boolean {
  if (typeof packet.timestamp !== 'number' || packet.timestamp <= 0 || !Number.isInteger(packet.timestamp)) {
    return false;
  }
  if (typeof packet.latitude !== 'number' || packet.latitude < -90.0 || packet.latitude > 90.0) {
    return false;
  }
  if (typeof packet.longitude !== 'number' || packet.longitude < -180.0 || packet.longitude > 180.0) {
    return false;
  }
  if (typeof packet.altitudeMeters !== 'number' || packet.altitudeMeters < 0.0) {
    return false;
  }
  if (typeof packet.airspeedMps !== 'number' || packet.airspeedMps < 0.0) {
    return false;
  }
  if (typeof packet.headingDegrees !== 'number' || packet.headingDegrees < 0.0 || packet.headingDegrees >= 360.0) {
    return false;
  }
  if (typeof packet.batteryPercentage !== 'number' || packet.batteryPercentage < 0.0 || packet.batteryPercentage > 100.0) {
    return false;
  }
  return true;
}
