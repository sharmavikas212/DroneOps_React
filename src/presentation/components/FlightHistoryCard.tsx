/**
 * FlightHistoryCard Component
 * Utilitarian tactical card rendering a completed flight summary record.
 * Displays duration, peak altitude, average speed, and minimum battery with semantic status colors.
 * Supports tap-to-inspect and delete callbacks per contracts/flight-history-components.contract.ts
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FlightRecord } from '../../data/local/models/FlightRecordEntity';
import { colors } from '../../theme/colors';

export interface FlightHistoryCardProps {
  /** Flight record to display */
  record: FlightRecord;
  /** Callback when card is pressed to inspect details */
  onPress?: (record: FlightRecord) => void;
  /** Callback when delete icon button on card is pressed */
  onDeletePress?: (record: FlightRecord) => void;
  /** Test identifier */
  testID?: string;
}

export const FlightHistoryCard: React.FC<FlightHistoryCardProps> = ({
  record,
  onPress,
  onDeletePress,
  testID,
}) => {
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

  const cardTestId = testID ?? `flight-card-${record.id}`;

  const CardWrapper: React.ElementType = onPress ? TouchableOpacity : View;
  const wrapperProps = onPress
    ? {
        testID: cardTestId,
        style: styles.card,
        activeOpacity: 0.7,
        onPress: () => onPress(record),
      }
    : {
        testID: cardTestId,
        style: styles.card,
      };

  return (
    <CardWrapper {...wrapperProps}>
      {/* Card Header: Timestamp & Actions */}
      <View style={styles.header}>
        <Text style={styles.dateText}>{formattedDate}</Text>
        <View style={styles.headerRightActions}>
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{formattedDuration}</Text>
          </View>
          {onDeletePress ? (
            <TouchableOpacity
              testID={`delete-flight-${record.id}`}
              style={styles.deleteButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={(e) => {
                // Prevent bubbling to card onPress if event object exists
                if (e && typeof e.stopPropagation === 'function') {
                  e.stopPropagation();
                }
                onDeletePress(record);
              }}
            >
              <Text style={styles.deleteButtonText}>✕</Text>
            </TouchableOpacity>
          ) : null}
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
    </CardWrapper>
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
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: colors.status.error,
    borderWidth: 1,
    borderRadius: 4,
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: colors.status.error,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 12,
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
