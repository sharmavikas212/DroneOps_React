/**
 * Telemetry Dashboard Controller (Presentation Layer)
 * Manages UI state, breadcrumb appending, and 3-second heartbeat watchdog timer.
 * Complies with Constitution Principle II & III.
 */

import { DroneTelemetry } from '../../data/model/DroneTelemetry';
import { ConnectionState, TelemetrySource, Unsubscribe } from '../../data/source/TelemetrySource';
import { DroneTelemetryRepository } from '../../data/repository/DroneTelemetryRepository';
import { BreadcrumbPoint, DashboardUiState, initialDashboardUiState } from './DashboardUiState';

export const WATCHDOG_TIMEOUT_MS = 3000;

export class TelemetryDashboardController {
  private state: DashboardUiState = { ...initialDashboardUiState };
  private listeners: Set<(state: DashboardUiState) => void> = new Set();
  private watchdogTimer: ReturnType<typeof setTimeout> | null = null;
  private sourceUnsubscribe: Unsubscribe | null = null;
  private connUnsubscribe: Unsubscribe | null = null;
  private terminationUnsubscribe: Unsubscribe | null = null;

  constructor(
    private telemetrySource?: TelemetrySource,
    private repository?: DroneTelemetryRepository
  ) {
    if (this.telemetrySource) {
      this.sourceUnsubscribe = this.telemetrySource.subscribe((packet) => {
        this.handleIncomingPacket(packet);
      });
      if (this.telemetrySource.onConnectionChange) {
        this.connUnsubscribe = this.telemetrySource.onConnectionChange((connState) => {
          if (connState === 'Disconnected') {
            this.clearWatchdogTimer();
            this.updateState({ connectionState: 'Disconnected' });
          }
        });
      }
    }

    if (this.repository) {
      this.terminationUnsubscribe = this.repository.onFlightTerminated(() => {
        this.clearBreadcrumbs();
        this.clearWatchdogTimer();
        this.updateState({ connectionState: 'Disconnected' });
      });
    }
  }

  getState(): DashboardUiState {
    return this.state;
  }

  subscribe(listener: (state: DashboardUiState) => void): Unsubscribe {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  connect(): void {
    this.updateState({
      connectionState: 'Connecting',
      errorMessage: null,
    });

    if (this.repository) {
      this.repository.startStream();
    } else if (this.telemetrySource) {
      this.telemetrySource.connect();
    }

    // Arm the 3-second watchdog immediately on connection initiation (Principle III)
    this.armWatchdogTimer();
  }

  async disconnect(): Promise<void> {
    this.clearWatchdogTimer();
    if (this.repository) {
      await this.repository.stopStream();
    } else if (this.telemetrySource) {
      this.telemetrySource.disconnect();
    }
    this.updateState({
      connectionState: 'Disconnected',
    });
  }

  handleIncomingPacket(packet: DroneTelemetry): void {
    // Reset watchdog timer on every valid packet
    this.clearWatchdogTimer();
    this.armWatchdogTimer();

    const newBreadcrumb: BreadcrumbPoint = {
      latitude: packet.latitude,
      longitude: packet.longitude,
      timestamp: packet.timestamp,
    };

    this.updateState({
      connectionState: 'Connected',
      telemetry: packet,
      isStale: false,
      breadcrumbs: [...this.state.breadcrumbs, newBreadcrumb],
    });
  }

  /**
   * Resets breadcrumb points in memory (e.g. upon flight termination)
   */
  clearBreadcrumbs(): void {
    this.updateState({
      breadcrumbs: [],
    });
  }

  private armWatchdogTimer(): void {
    this.clearWatchdogTimer();
    this.watchdogTimer = setTimeout(() => {
      this.handleWatchdogTimeout();
    }, WATCHDOG_TIMEOUT_MS);
  }

  private clearWatchdogTimer(): void {
    if (this.watchdogTimer !== null) {
      clearTimeout(this.watchdogTimer);
      this.watchdogTimer = null;
    }
  }

  private handleWatchdogTimeout(): void {
    if (this.state.connectionState === 'Connecting') {
      // Handshake timeout: transition to Error / Disconnected
      this.updateState({
        connectionState: 'Error',
        errorMessage: 'Connection attempt timed out. No telemetry signal received.',
      });
    } else if (this.state.connectionState === 'Connected') {
      // Telemetry signal loss: transition to Disconnected, retain telemetry, mark stale
      this.updateState({
        connectionState: 'Disconnected',
        isStale: true,
      });
    }
  }

  private updateState(partial: Partial<DashboardUiState>): void {
    this.state = { ...this.state, ...partial };
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  dispose(): void {
    this.clearWatchdogTimer();
    if (this.sourceUnsubscribe) {
      this.sourceUnsubscribe();
      this.sourceUnsubscribe = null;
    }
    if (this.connUnsubscribe) {
      this.connUnsubscribe();
      this.connUnsubscribe = null;
    }
    if (this.terminationUnsubscribe) {
      this.terminationUnsubscribe();
      this.terminationUnsubscribe = null;
    }
    this.listeners.clear();
  }
}
