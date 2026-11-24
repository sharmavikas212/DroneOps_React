/**
 * Contract: Telemetry Source Abstraction
 * Location: src/data/source/TelemetrySource.ts
 */

import { ConnectionState, DroneTelemetry } from './telemetry-types';

export type Unsubscribe = () => void;
export type TelemetryListener = (packet: DroneTelemetry) => void;
export type ConnectionListener = (state: ConnectionState) => void;

export interface TelemetrySource {
  /**
   * Initiates connection to the telemetry stream.
   * Starts connection handshake and dispatches packets to subscribers.
   */
  connect(): void;

  /**
   * Disconnects from the telemetry stream and releases underlying resources.
   */
  disconnect(): void;

  /**
   * Subscribes a listener to incoming telemetry packets.
   * Returns an unsubscribe cleanup function.
   */
  subscribe(listener: TelemetryListener): Unsubscribe;

  /**
   * Subscribes a listener to connection lifecycle changes (optional for low-level sources).
   */
  onConnectionChange?(listener: ConnectionListener): Unsubscribe;
}
