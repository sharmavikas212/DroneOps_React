/**
 * FlightHistoryCard Unit Tests
 * Feature: 003-flight-history-ui
 * Principle V: Deterministic Testing
 */

import React from 'react';
import { FlightRecord } from '../../../src/data/local/models/FlightRecordEntity';
import { FlightHistoryCard } from '../../../src/presentation/components/FlightHistoryCard';
import { colors } from '../../../src/theme/colors';

const nominalRecord: FlightRecord = {
  id: 'record-nom-1',
  startTimeMillis: 1732410000000,
  endTimeMillis: 1732410600000,
  durationSeconds: 605, // 10m 5s
  maxAltitudeMeters: 145.2,
  averageSpeedMps: 18.4,
  minBatteryPercentage: 85, // Green
};

const warningRecord: FlightRecord = {
  id: 'record-warn-2',
  startTimeMillis: 1732420000000,
  endTimeMillis: 1732420900000,
  durationSeconds: 900, // 15m 0s
  maxAltitudeMeters: 80.0,
  averageSpeedMps: 12.0,
  minBatteryPercentage: 35, // Amber
};

const criticalRecord: FlightRecord = {
  id: 'record-crit-3',
  startTimeMillis: 1732430000000,
  endTimeMillis: 1732430300000,
  durationSeconds: 300, // 5m 0s
  maxAltitudeMeters: 45.0,
  averageSpeedMps: 8.5,
  minBatteryPercentage: 12, // Red
};

describe('FlightHistoryCard', () => {
  it('renders record testID and metric data structure', () => {
    const element = FlightHistoryCard({ record: nominalRecord }) as React.ReactElement<any>;

    expect(element.props.testID).toBe(`flight-card-${nominalRecord.id}`);
  });

  it('triggers onPress callback when card is pressed', () => {
    const onPress = jest.fn();
    const element = FlightHistoryCard({ record: nominalRecord, onPress }) as React.ReactElement<any>;

    // When onPress is provided, the card renders as a TouchableOpacity
    element.props.onPress();
    expect(onPress).toHaveBeenCalledWith(nominalRecord);
  });

  it('triggers onDeletePress callback when delete button is pressed', () => {
    const onDeletePress = jest.fn();
    const element = FlightHistoryCard({ record: nominalRecord, onDeletePress }) as React.ReactElement<any>;

    // Find delete button in header children
    const header = element.props.children[0];
    const headerActions = header.props.children[1];
    const deleteButton = headerActions.props.children[1];

    expect(deleteButton).toBeDefined();
    expect(deleteButton.props.testID).toBe(`delete-flight-${nominalRecord.id}`);

    deleteButton.props.onPress();
    expect(onDeletePress).toHaveBeenCalledWith(nominalRecord);
  });

  it('renders correct battery semantic status colors', () => {
    // Nominal (> 50%): green
    const nomElem = FlightHistoryCard({ record: nominalRecord }) as React.ReactElement<any>;
    const nomMetrics = nomElem.props.children[1];
    const nomBatteryCol = nomMetrics.props.children[2];
    const nomBatteryValue = nomBatteryCol.props.children[1];
    expect(nomBatteryValue.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: colors.metric.green })])
    );

    // Warning (20-50%): amber
    const warnElem = FlightHistoryCard({ record: warningRecord }) as React.ReactElement<any>;
    const warnMetrics = warnElem.props.children[1];
    const warnBatteryCol = warnMetrics.props.children[2];
    const warnBatteryValue = warnBatteryCol.props.children[1];
    expect(warnBatteryValue.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: colors.metric.amber })])
    );

    // Critical (< 20%): red
    const critElem = FlightHistoryCard({ record: criticalRecord }) as React.ReactElement<any>;
    const critMetrics = critElem.props.children[1];
    const critBatteryCol = critMetrics.props.children[2];
    const critBatteryValue = critBatteryCol.props.children[1];
    expect(critBatteryValue.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: colors.metric.red })])
    );
  });
});
