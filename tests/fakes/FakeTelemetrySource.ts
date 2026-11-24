/**
 * Controllable Fake Telemetry Source for 100% Deterministic Unit Testing
 * Complies with Constitution Principle V.
 */

import { DroneTelemetry } from '../../src/data/model/DroneTelemetry';
import {
  ConnectionListener,
  ConnectionState,
  TelemetryListener,
  TelemetrySource,
  Unsubscribe,
} from '../../src/data/source/TelemetrySource';

export class FakeTelemetrySource implements TelemetrySource {
  private telemetryListeners: Set<TelemetryListener> = new Set();
  private connectionListeners: Set<ConnectionListener> = new Set();
  public isConnected: boolean = false;
  public currentState: ConnectionState = 'Disconnected';
  public connectCallCount: number = 0;
  public disconnectCallCount: number = 0;

  connect(): void {
    this.connectCallCount++;
    this.currentState = 'Connecting';
    this.notifyConnectionListeners('Connecting');
  }

  disconnect(): void {
    this.disconnectCallCount++;
    this.isConnected = false;
    this.currentState = 'Disconnected';
    this.notifyConnectionListeners('Disconnected');
  }

  subscribe(listener: TelemetryListener): Unsubscribe {
    this.telemetryListeners.add(listener);
    return () => {
      this.telemetryListeners.delete(listener);
    };
  }

  onConnectionChange(listener: ConnectionListener): Unsubscribe {
    this.connectionListeners.add(listener);
    // Emit current state immediately to new listener
    listener(this.currentState);
    return () => {
      this.connectionListeners.delete(listener);
    };
  }

  /**
   * Deterministic test helper: Emits a telemetry packet to all subscribers.
   */
  emitPacket(packet: DroneTelemetry): void {
    if (this.currentState !== 'Connected') {
      this.currentState = 'Connected';
      this.isConnected = true;
      this.notifyConnectionListeners('Connected');
    }
    for (const listener of this.telemetryListeners) {
      listener(packet);
    }
  }

  /**
   * Deterministic test helper: Simulates connection state transition.
   */
  setConnectionState(state: ConnectionState): void {
    this.currentState = state;
    this.isConnected = state === 'Connected';
    this.notifyConnectionListeners(state);
  }

  /**
   * Deterministic test helper: Simulates stream termination.
   */
  simulateStreamEnd(): void {
    this.disconnect();
  }

  private notifyConnectionListeners(state: ConnectionState): void {
    for (const listener of this.connectionListeners) {
      listener(state);
    }
  }

  getListenerCount(): number {
    return this.telemetryListeners.size;
  }
}
