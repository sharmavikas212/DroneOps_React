/**
 * Contract: Drone Telemetry Repository Interface
 * Location: src/data/repository/DroneTelemetryRepository.ts
 */

import { DroneTelemetry } from './telemetry-types';
import { FlightRecord } from './flight-record-dao.contract';

export interface DroneTelemetryRepository {
  /**
   * Connects to the telemetry source and begins session tracking.
   */
  startStream(): void;

  /**
   * Disconnects from the telemetry stream and concludes active flight session,
   * triggering flight summary persistence if session was active.
   */
  stopStream(): Promise<FlightRecord | null>;

  /**
   * Subscribes a listener to raw telemetry packets.
   */
  subscribeTelemetry(listener: (packet: DroneTelemetry) => void): () => void;

  /**
   * Returns current active flight session status, or null if no flight is in progress.
   */
  isFlightActive(): boolean;
}
