/**
 * Contract: Telemetry Context & Provider
 * Feature: 002-navigation-shell
 * Principle II: Strict Layer Boundaries & Zero-Bloat Wiring (React Context)
 */

import React from 'react';
import { DroneTelemetry } from '../../../src/data/model/DroneTelemetry';
import { ConnectionState, TelemetrySource } from '../../../src/data/source/TelemetrySource';
import { DroneTelemetryRepository } from '../../../src/data/repository/DroneTelemetryRepository';
import { BreadcrumbPoint, DashboardUiState } from '../../../src/presentation/state/DashboardUiState';
import { TelemetryDashboardController } from '../../../src/presentation/state/TelemetryDashboardController';

export interface TelemetryContextValue extends DashboardUiState {
  connect: () => void;
  disconnect: () => void;
  clearBreadcrumbs: () => void;
  controller: TelemetryDashboardController;
}

export interface TelemetryProviderProps {
  children: React.ReactNode;
  source?: TelemetrySource;
  repository?: DroneTelemetryRepository;
  controller?: TelemetryDashboardController;
}
