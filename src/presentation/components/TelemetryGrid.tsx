/**
 * Tactical HUD Telemetry Grid Component
 * Renders primary flight metrics with high-visibility outdoor contrast.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DroneTelemetry } from '../../data/model/DroneTelemetry';
import { colors } from '../../theme/colors';

interface TelemetryGridProps {
  telemetry: DroneTelemetry | null;
  isStale?: boolean;
}

export const TelemetryGrid: React.FC<TelemetryGridProps> = ({ telemetry, isStale = false }) => {
  const getBatteryColor = (pct: number) => {
    if (pct <= 20) return colors.metric.red;
    if (pct <= 50) return colors.metric.amber;
    return colors.metric.green;
  };

  const altitudeStr = telemetry ? `${telemetry.altitudeMeters.toFixed(1)} m` : '-- m';
  const speedStr = telemetry ? `${telemetry.airspeedMps.toFixed(1)} m/s` : '-- m/s';
  const headingStr = telemetry ? `${Math.round(telemetry.headingDegrees)}°` : '--°';
  const batteryStr = telemetry ? `${Math.round(telemetry.batteryPercentage)}%` : '--%';
  const batteryColor = telemetry ? getBatteryColor(telemetry.batteryPercentage) : colors.textDisabled;

  return (
    <View style={styles.container}>
      {/* Row 1: Altitude & Airspeed */}
      <View style={styles.row}>
        {/* Altitude Tile */}
        <View style={[styles.tile, isStale && styles.staleTile]}>
          <Text style={styles.tileLabel}>ALTITUDE</Text>
          <Text style={[styles.tileValue, { color: colors.metric.cyan }]}>{altitudeStr}</Text>
          <Text style={styles.tileSub}>AGL (Meters)</Text>
        </View>

        {/* Airspeed Tile */}
        <View style={[styles.tile, isStale && styles.staleTile]}>
          <Text style={styles.tileLabel}>AIRSPEED</Text>
          <Text style={[styles.tileValue, { color: colors.metric.cyan }]}>{speedStr}</Text>
          <Text style={styles.tileSub}>True Velocity</Text>
        </View>
      </View>

      {/* Row 2: Heading & Battery */}
      <View style={styles.row}>
        {/* Heading Tile */}
        <View style={[styles.tile, isStale && styles.staleTile]}>
          <Text style={styles.tileLabel}>HEADING</Text>
          <Text style={[styles.tileValue, { color: colors.textPrimary }]}>{headingStr}</Text>
          <Text style={styles.tileSub}>Compass North</Text>
        </View>

        {/* Battery Tile */}
        <View style={[styles.tile, isStale && styles.staleTile]}>
          <Text style={styles.tileLabel}>BATTERY</Text>
          <Text style={[styles.tileValue, { color: batteryColor }]}>{batteryStr}</Text>
          <Text style={styles.tileSub}>State of Charge</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  tile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    justifyContent: 'center',
  },
  staleTile: {
    borderColor: colors.status.warning,
    opacity: 0.85,
  },
  tileLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  tileValue: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginVertical: 2,
  },
  tileSub: {
    fontSize: 10,
    color: colors.textDisabled,
    marginTop: 2,
  },
});
