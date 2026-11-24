/**
 * Telemetry Source Abstraction & Subscription Types
 * Conforms to contracts/telemetry-source.contract.ts and data-model.md
 */

import { DroneTelemetry } from '../model/DroneTelemetry';

export type ConnectionState = 'Connecting' | 'Connected' | 'Disconnected' | 'Error';

export type Unsubscribe = () => void;
export type TelemetryListener = (packet: DroneTelemetry) => void;
export type ConnectionListener = (state: ConnectionState) => void;

export interface TelemetrySource {
  /**
   * Initiates connection to the telemetry stream.
   */
  connect(): void;

  /**
   * Disconnects from the telemetry stream and releases resources.
   */
  disconnect(): void;

  /**
   * Subscribes a listener to incoming telemetry packets.
   * Returns an unsubscribe cleanup callback.
   */
  subscribe(listener: TelemetryListener): Unsubscribe;

  /**
   * Subscribes an optional listener to connection lifecycle changes.
   */
  onConnectionChange?(listener: ConnectionListener): Unsubscribe;
}
