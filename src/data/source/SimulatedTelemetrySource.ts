/**
 * Simulated Telemetry Source
 * Generates realistic real-time flight telemetry ticks for the HUD.
 */

import { DroneTelemetry } from '../model/DroneTelemetry';
import {
  ConnectionListener,
  ConnectionState,
  TelemetryListener,
  TelemetrySource,
  Unsubscribe,
} from './TelemetrySource';

export class SimulatedTelemetrySource implements TelemetrySource {
  private telemetryListeners: Set<TelemetryListener> = new Set();
  private connectionListeners: Set<ConnectionListener> = new Set();
  private intervalTimer: ReturnType<typeof setInterval> | null = null;
  private currentState: ConnectionState = 'Disconnected';

  // Flight simulation state variables
  private latitude: number = 37.7749;
  private longitude: number = -122.4194;
  private altitude: number = 42.0;
  private speed: number = 11.5;
  private heading: number = 45.0;
  private battery: number = 98.0;
  private tickCount: number = 0;

  connect(): void {
    if (this.currentState === 'Connected' || this.intervalTimer !== null) {
      return;
    }

    this.currentState = 'Connecting';
    this.notifyConnectionState('Connecting');

    // Slight realistic network handshake delay (200ms) before streaming
    setTimeout(() => {
      this.currentState = 'Connected';
      this.notifyConnectionState('Connected');

      // Emit initial packet immediately
      this.emitTick();

      // Emit subsequent packets every 1000ms (1 Hz)
      this.intervalTimer = setInterval(() => {
        this.emitTick();
      }, 1000);
    }, 200);
  }

  disconnect(): void {
    if (this.intervalTimer !== null) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
    this.currentState = 'Disconnected';
    this.notifyConnectionState('Disconnected');
  }

  subscribe(listener: TelemetryListener): Unsubscribe {
    this.telemetryListeners.add(listener);
    return () => {
      this.telemetryListeners.delete(listener);
    };
  }

  onConnectionChange(listener: ConnectionListener): Unsubscribe {
    this.connectionListeners.add(listener);
    listener(this.currentState);
    return () => {
      this.connectionListeners.delete(listener);
    };
  }

  private emitTick(): void {
    this.tickCount++;

    // Realistic flight simulation trajectory
    this.heading = (this.heading + 2) % 360;
    const rad = (this.heading * Math.PI) / 180;

    // Movement: ~12 m/s translated to geographic coordinates
    this.latitude += (Math.cos(rad) * 0.0001);
    this.longitude += (Math.sin(rad) * 0.0001);

    // Altitude gentle cruise oscillation between 40m - 55m
    this.altitude = Math.min(60, Math.max(30, this.altitude + (Math.sin(this.tickCount * 0.1) * 0.8)));

    // Speed fluctuation
    this.speed = Math.max(8.0, Math.min(16.0, this.speed + (Math.random() * 0.6 - 0.3)));

    // Battery gentle drain
    this.battery = Math.max(0.0, this.battery - 0.1);

    const packet: DroneTelemetry = {
      timestamp: Date.now(),
      latitude: Number(this.latitude.toFixed(6)),
      longitude: Number(this.longitude.toFixed(6)),
      altitudeMeters: Number(this.altitude.toFixed(1)),
      airspeedMps: Number(this.speed.toFixed(1)),
      headingDegrees: Math.round(this.heading),
      batteryPercentage: Number(this.battery.toFixed(1)),
    };

    for (const listener of this.telemetryListeners) {
      listener(packet);
    }
  }

  private notifyConnectionState(state: ConnectionState): void {
    for (const listener of this.connectionListeners) {
      listener(state);
    }
  }
}
