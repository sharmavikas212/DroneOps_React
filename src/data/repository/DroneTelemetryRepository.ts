/**
 * Drone Telemetry Repository
 * Coordinates telemetry stream ingestion, running flight aggregates,
 * and post-flight SQLite summary persistence.
 * Complies with Constitution Principle II & IV.
 */

import { DroneTelemetry } from '../model/DroneTelemetry';
import { TelemetrySource, Unsubscribe } from '../source/TelemetrySource';
import { FlightRecord } from '../local/models/FlightRecordEntity';
import { IFlightRecordDao } from '../local/FlightRecordDao';

interface SessionAccumulator {
  startTimeMillis: number;
  lastPacketTimeMillis: number;
  maxAltitudeMeters: number;
  minBatteryPercentage: number;
  totalSpeedSum: number;
  sampleCount: number;
}

export class DroneTelemetryRepository {
  private accumulator: SessionAccumulator | null = null;
  private sourceUnsubscribe: Unsubscribe | null = null;
  private telemetrySubscribers: Set<(packet: DroneTelemetry) => void> = new Set();
  private terminationSubscribers: Set<(record: FlightRecord) => void> = new Set();

  constructor(
    private telemetrySource: TelemetrySource,
    private flightRecordDao: IFlightRecordDao
  ) {}

  /**
   * Starts ingestion from the telemetry stream and initiates session tracking.
   */
  startStream(): void {
    if (this.sourceUnsubscribe) {
      return;
    }

    this.telemetrySource.connect();
    this.sourceUnsubscribe = this.telemetrySource.subscribe((packet) => {
      this.handleIncomingPacket(packet);
    });
  }

  /**
   * Concludes the telemetry stream and terminates any active flight session,
   * saving the consolidated summary to SQLite.
   */
  async stopStream(): Promise<FlightRecord | null> {
    if (this.sourceUnsubscribe) {
      this.sourceUnsubscribe();
      this.sourceUnsubscribe = null;
    }
    this.telemetrySource.disconnect();

    return await this.terminateSession();
  }

  /**
   * Subscribes a listener to raw incoming telemetry packets.
   */
  subscribeTelemetry(listener: (packet: DroneTelemetry) => void): Unsubscribe {
    this.telemetrySubscribers.add(listener);
    return () => {
      this.telemetrySubscribers.delete(listener);
    };
  }

  /**
   * Subscribes a listener to flight termination events (for breadcrumb cleanup).
   */
  onFlightTerminated(listener: (record: FlightRecord) => void): Unsubscribe {
    this.terminationSubscribers.add(listener);
    return () => {
      this.terminationSubscribers.delete(listener);
    };
  }

  isFlightActive(): boolean {
    return this.accumulator !== null;
  }

  private handleIncomingPacket(packet: DroneTelemetry): void {
    if (!this.accumulator) {
      // Initialize running session on first valid packet
      this.accumulator = {
        startTimeMillis: packet.timestamp,
        lastPacketTimeMillis: packet.timestamp,
        maxAltitudeMeters: packet.altitudeMeters,
        minBatteryPercentage: packet.batteryPercentage,
        totalSpeedSum: packet.airspeedMps,
        sampleCount: 1,
      };
    } else {
      // Incremental running calculation O(1)
      this.accumulator.maxAltitudeMeters = Math.max(
        this.accumulator.maxAltitudeMeters,
        packet.altitudeMeters
      );
      this.accumulator.minBatteryPercentage = Math.min(
        this.accumulator.minBatteryPercentage,
        packet.batteryPercentage
      );
      this.accumulator.totalSpeedSum += packet.airspeedMps;
      this.accumulator.sampleCount += 1;
      this.accumulator.lastPacketTimeMillis = packet.timestamp;
    }

    // Forward packet to presentation subscribers
    for (const sub of this.telemetrySubscribers) {
      sub(packet);
    }

    // Check for terminal battery depletion (0% battery concludes flight)
    if (packet.batteryPercentage <= 0) {
      this.stopStream().catch((err) => {
        console.error('Error auto-persisting flight upon battery depletion:', err);
      });
    }
  }

  private async terminateSession(): Promise<FlightRecord | null> {
    if (!this.accumulator || this.accumulator.sampleCount === 0) {
      this.accumulator = null;
      return null;
    }

    const {
      startTimeMillis,
      lastPacketTimeMillis,
      maxAltitudeMeters,
      minBatteryPercentage,
      totalSpeedSum,
      sampleCount,
    } = this.accumulator;

    const durationSeconds = Math.max(
      0,
      Math.round((lastPacketTimeMillis - startTimeMillis) / 1000)
    );
    const averageSpeedMps = Number((totalSpeedSum / sampleCount).toFixed(2));

    const recordId = `flight-${startTimeMillis}-${Math.random().toString(36).substring(2, 9)}`;

    const flightRecord: FlightRecord = {
      id: recordId,
      startTimeMillis,
      endTimeMillis: lastPacketTimeMillis,
      durationSeconds,
      maxAltitudeMeters: Number(maxAltitudeMeters.toFixed(1)),
      averageSpeedMps,
      minBatteryPercentage: Number(minBatteryPercentage.toFixed(1)),
    };

    // Reset accumulator to prevent duplicate persistence
    this.accumulator = null;

    // Persist single consolidated record to SQLite
    await this.flightRecordDao.insertFlightRecord(flightRecord);

    // Notify termination listeners (e.g., to clear in-memory breadcrumbs)
    for (const listener of this.terminationSubscribers) {
      listener(flightRecord);
    }

    return flightRecord;
  }
}
