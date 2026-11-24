/**
 * FlightHistoryCard Component
 * Utilitarian tactical card rendering a completed flight summary record.
 * Displays duration, peak altitude, average speed, and minimum battery with semantic status colors.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FlightRecord } from '../../data/local/models/FlightRecordEntity';
import { colors } from '../../theme/colors';

export interface FlightHistoryCardProps {
  record: FlightRecord;
}

export const FlightHistoryCard: React.FC<FlightHistoryCardProps> = ({ record }) => {
  const formattedDate = new Date(record.startTimeMillis).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const durationMin = Math.floor(record.durationSeconds / 60);
  const durationSec = Math.floor(record.durationSeconds % 60);
  const formattedDuration = `${durationMin}m ${durationSec}s`;

  const batteryColor =
    record.minBatteryPercentage > 50
      ? colors.metric.green
      : record.minBatteryPercentage >= 20
      ? colors.metric.amber
      : colors.metric.red;

  return (
    <View style={styles.card} testID={`flight-card-${record.id}`}>
      {/* Card Header: Timestamp & Duration */}
      <View style={styles.header}>
        <Text style={styles.dateText}>{formattedDate}</Text>
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{formattedDuration}</Text>
        </View>
      </View>

      {/* Metrics Row */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricColumn}>
          <Text style={styles.metricLabel}>PEAK ALT</Text>
          <Text style={styles.metricValue}>
            {record.maxAltitudeMeters.toFixed(1)} <Text style={styles.metricUnit}>m</Text>
          </Text>
        </View>

        <View style={styles.metricColumn}>
          <Text style={styles.metricLabel}>AVG SPEED</Text>
          <Text style={styles.metricValue}>
            {record.averageSpeedMps.toFixed(1)} <Text style={styles.metricUnit}>m/s</Text>
          </Text>
        </View>

        <View style={styles.metricColumn}>
          <Text style={styles.metricLabel}>MIN BATT</Text>
          <Text style={[styles.metricValue, { color: batteryColor }]}>
            {Math.round(record.minBatteryPercentage)}%
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceSubtle,
  },
  dateText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  durationBadge: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  durationText: {
    color: colors.metric.cyan,
    fontSize: 11,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricColumn: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  metricUnit: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
  },
});
