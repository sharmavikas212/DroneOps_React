/**
 * FlightDetailModal Component
 * Feature: 003-flight-history-ui
 * In-screen tactical detail inspection modal displaying complete operational flight metrics.
 * Conforms to contracts/flight-history-components.contract.ts
 */

import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FlightRecord } from '../../data/local/models/FlightRecordEntity';
import { colors } from '../../theme/colors';

export interface FlightDetailModalProps {
  /** Whether the detail modal is currently visible */
  visible: boolean;
  /** Flight record being inspected */
  record: FlightRecord | null;
  /** Callback to close the modal and return to list */
  onClose: () => void;
  /** Callback to initiate deletion from within the detail view */
  onDelete?: (record: FlightRecord) => void;
  /** Test identifier */
  testID?: string;
}

export const FlightDetailModal: React.FC<FlightDetailModalProps> = ({
  visible,
  record,
  onClose,
  onDelete,
  testID = 'flight-detail-modal',
}) => {
  if (!visible || !record) {
    return null;
  }

  const startDate = new Date(record.startTimeMillis).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const endDate = new Date(record.endTimeMillis).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
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
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      testID={testID}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>MISSION DETAILS</Text>
              <Text style={styles.recordId}>ID: {record.id}</Text>
            </View>
            <TouchableOpacity
              testID="detail-modal-close-button"
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Metrics Grid */}
          <View style={styles.body}>
            {/* Timestamps */}
            <View style={styles.section}>
              <View style={styles.row}>
                <Text style={styles.label}>START TIME</Text>
                <Text style={styles.value}>{startDate}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>END TIME</Text>
                <Text style={styles.value}>{endDate}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>TOTAL DURATION</Text>
                <Text style={[styles.value, { color: colors.metric.cyan }]}>
                  {formattedDuration}
                </Text>
              </View>
            </View>

            {/* Flight Performance */}
            <View style={[styles.section, styles.performanceSection]}>
              <View style={styles.metricItem}>
                <Text style={styles.label}>PEAK ALTITUDE</Text>
                <Text style={styles.statValue}>
                  {record.maxAltitudeMeters.toFixed(1)}{' '}
                  <Text style={styles.unit}>m</Text>
                </Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={styles.label}>AVERAGE SPEED</Text>
                <Text style={styles.statValue}>
                  {record.averageSpeedMps.toFixed(1)}{' '}
                  <Text style={styles.unit}>m/s</Text>
                </Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={styles.label}>MIN BATTERY</Text>
                <Text style={[styles.statValue, { color: batteryColor }]}>
                  {Math.round(record.minBatteryPercentage)}%
                </Text>
              </View>
            </View>
          </View>

          {/* Footer Action */}
          {onDelete ? (
            <View style={styles.footer}>
              <TouchableOpacity
                testID="detail-modal-delete-button"
                style={styles.deleteButton}
                onPress={() => onDelete(record)}
              >
                <Text style={styles.deleteButtonText}>DELETE FLIGHT LOG</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  recordId: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 3,
    letterSpacing: 0.3,
  },
  closeButton: {
    backgroundColor: colors.surfaceSubtle,
    width: 28,
    height: 28,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeButtonText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
  body: {
    gap: 16,
  },
  section: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  performanceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 4,
  },
  unit: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  footer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: colors.status.error,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: colors.status.error,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
