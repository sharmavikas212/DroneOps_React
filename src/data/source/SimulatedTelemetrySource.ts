/**
 * Simulated Telemetry Source
 * Generates realistic real-time flight telemetry with smooth GPS dead reckoning,
 * Return-to-Home (RTH) descent under 20% battery, and zero-battery touchdown.
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

  // Base / Home coordinates (Sydney, Australia)
  private readonly homeLatitude: number = -33.8688;
  private readonly homeLongitude: number = 151.2093;

  // Flight simulation state variables
  private latitude: number = -33.8688;
  private longitude: number = 151.2093;
  private altitude: number = 45.0;
  private speed: number = 12.0;
  private heading: number = 45.0;
  private targetHeading: number = 45.0;
  private wanderInterval: number = 0;
  private battery: number = 100.0;
  private tickCount: number = 0;

  connect(): void {
    if (this.currentState === 'Connected' || this.intervalTimer !== null) {
      return;
    }

    // Reset flight simulation state for clean takeoff
    this.latitude = this.homeLatitude;
    this.longitude = this.homeLongitude;
    this.altitude = 45.0;
    this.speed = 12.0;
    this.heading = 45.0;
    this.targetHeading = 45.0;
    this.wanderInterval = 0;
    this.battery = 100.0;
    this.tickCount = 0;

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

  // Testing helpers to simulate low battery conditions deterministically
  setBattery(percentage: number): void {
    this.battery = Math.max(0.0, Math.min(100.0, percentage));
  }

  getBattery(): number {
    return this.battery;
  }

  private pseudoRandom(seed: number): number {
    const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  }

  private turnTowards(current: number, target: number, maxTurn: number): number {
    let diff = (target - current + 360) % 360;
    if (diff > 180) {
      diff -= 360;
    }
    const turn = Math.max(-maxTurn, Math.min(maxTurn, diff));
    return (current + turn + 360) % 360;
  }

  private emitTick(): void {
    this.tickCount++;

    // Realistic battery consumption (~0.2% per second in standard simulation)
    this.battery = Math.max(0.0, this.battery - 0.2);

    const isRTH = this.battery <= 20.0;
    const isLanding = this.battery <= 10.0;

    if (isRTH && this.battery > 0.0) {
      // Calculate bearing to home base
      const dLatHome = this.homeLatitude - this.latitude;
      const dLonHome =
        (this.homeLongitude - this.longitude) *
        Math.cos((this.homeLatitude * Math.PI) / 180);
      const bearingToHome =
        (Math.atan2(dLonHome, dLatHome) * (180 / Math.PI) + 360) % 360;

      // Smoothly steer drone toward home base at up to 4 degrees per second
      this.heading = this.turnTowards(this.heading, bearingToHome, 4.0);

      if (isLanding) {
        // Linear glide slope descent & deceleration down to 0 at 0% battery
        const descentProgress = (10.0 - this.battery) / 10.0; // 0.0 at 10% -> 1.0 at 0%
        this.altitude = Math.max(0.0, Number((45.0 * (1.0 - descentProgress)).toFixed(1)));
        this.speed = Math.max(0.0, Number((12.0 * (1.0 - descentProgress)).toFixed(1)));
      } else {
        // Cruising back home at nominal altitude and speed
        this.altitude = Number((45.0 + Math.sin(this.tickCount * 0.1) * 1.5).toFixed(1));
        this.speed = 12.0;
      }
    } else if (this.battery > 20.0) {
      // Enforce geofence corridor (~1.0 km radius around Sydney base)
      const dLatHome = this.homeLatitude - this.latitude;
      const dLonHome =
        (this.homeLongitude - this.longitude) *
        Math.cos((this.homeLatitude * Math.PI) / 180);
      const distToHomeMeters =
        Math.sqrt(dLatHome * dLatHome + dLonHome * dLonHome) * 111139;

      if (distToHomeMeters > 950) {
        // Approaching boundary: smoothly steer back toward Sydney base
        const bearingToHome =
          (Math.atan2(dLonHome, dLatHome) * (180 / Math.PI) + 360) % 360;
        const wanderOffset = (this.pseudoRandom(this.tickCount * 13) - 0.5) * 30;
        this.targetHeading = (bearingToHome + wanderOffset + 360) % 360;
      } else {
        // Random organic wander: adjust course every 3 seconds to avoid circular paths
        this.wanderInterval++;
        if (this.wanderInterval >= 3) {
          this.wanderInterval = 0;
          // Organic course change between -55 and +55 degrees relative to current heading
          const turnAngle = (this.pseudoRandom(this.tickCount * 19 + 7) - 0.5) * 110;
          this.targetHeading = (this.heading + turnAngle + 360) % 360;
        }
      }

      // Smoothly steer drone toward target heading at up to 6.5 degrees per second
      this.heading = this.turnTowards(this.heading, this.targetHeading, 6.5);

      // Add slight atmospheric wind drift (+/- 1.5 deg/sec)
      const drift = (this.pseudoRandom(this.tickCount * 31 + 11) - 0.5) * 3.0;
      this.heading = (this.heading + drift + 360) % 360;

      // Organic altitude and speed variations
      this.altitude = Number((48.0 + Math.sin(this.tickCount * 0.08) * 8.0).toFixed(1));
      const speedVariation = (this.pseudoRandom(this.tickCount * 23) - 0.5) * 3.0;
      this.speed = Math.max(9.0, Math.min(15.0, Number((12.0 + speedVariation).toFixed(1))));
    } else {
      // Touchdown complete (battery 0%)
      this.altitude = 0.0;
      this.speed = 0.0;
      this.latitude = this.homeLatitude;
      this.longitude = this.homeLongitude;
    }

    // Convert airspeed & heading to geographic coordinates (smooth dead reckoning)
    const rad = (this.heading * Math.PI) / 180;
    const metersPerDegreeLat = 111139;
    const metersPerDegreeLon =
      111139 * Math.cos((this.homeLatitude * Math.PI) / 180);

    const dLat = (this.speed * Math.cos(rad)) / metersPerDegreeLat;
    const dLon = (this.speed * Math.sin(rad)) / metersPerDegreeLon;

    this.latitude += dLat;
    this.longitude += dLon;

    if (this.battery <= 0.0) {
      this.latitude = this.homeLatitude;
      this.longitude = this.homeLongitude;
    }

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

    // Terminal auto-disconnect when touchdown is reached
    if (this.battery <= 0.0) {
      this.disconnect();
    }
  }

  private notifyConnectionState(state: ConnectionState): void {
    for (const listener of this.connectionListeners) {
      listener(state);
    }
  }
}
