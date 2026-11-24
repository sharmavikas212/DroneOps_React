/**
 * DroneOps Telemetry Dashboard Screen
 * Primary real-time HUD view rendering live metrics, link state, and coordinates.
 */

import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ConnectionStatusBadge } from '../../src/presentation/components/ConnectionStatusBadge';
import { StaleDataWarningBanner } from '../../src/presentation/components/StaleDataWarningBanner';
import { TacticalMap } from '../../src/presentation/components/TacticalMap';
import { TelemetryGrid } from '../../src/presentation/components/TelemetryGrid';
import { useTelemetryContext } from '../../src/presentation/hooks/useTelemetryContext';
import { colors } from '../../src/theme/colors';

export default function DroneDashboardScreen() {
  const {
    connectionState,
    telemetry,
    isStale,
    breadcrumbs,
    errorMessage,
    connect,
    disconnect,
  } = useTelemetryContext();

  const isConnected = connectionState === 'Connected';
  const isConnecting = connectionState === 'Connecting';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header Link & Action Bar */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>DRONEOPS GCS</Text>
            <Text style={styles.subtitle}>Tactical Flight Telemetry</Text>
          </View>
          <ConnectionStatusBadge state={connectionState} />
        </View>

        {/* Stale Telemetry Warning Banner (Watchdog) */}
        <StaleDataWarningBanner isStale={isStale} />

        {/* Connection Failure Alert */}
        {errorMessage ? (
          <View style={styles.errorAlert}>
            <Text style={styles.errorAlertText}>⚠️ {errorMessage}</Text>
          </View>
        ) : null}

        {/* Primary Controls */}
        <View style={styles.controlRow}>
          {!isConnected && !isConnecting ? (
            <TouchableOpacity style={styles.connectButton} onPress={connect}>
              <Text style={styles.connectButtonText}>CONNECT STREAM</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.disconnectButton} onPress={disconnect}>
              <Text style={styles.disconnectButtonText}>DISCONNECT</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Primary Flight Telemetry Grid */}
        <TelemetryGrid telemetry={telemetry} isStale={isStale} />

        {/* Tactical Map HUD & Live Flight Snail Trail */}
        <TacticalMap
          telemetry={telemetry}
          breadcrumbs={breadcrumbs}
          isStale={isStale}
          connectionState={connectionState}
        />

        {/* GPS Coordinates & Breadcrumb Status Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>TACTICAL GPS POSITION</Text>
          <View style={styles.coordsRow}>
            <View style={styles.coordCol}>
              <Text style={styles.coordLabel}>LATITUDE</Text>
              <Text style={styles.coordValue}>
                {telemetry ? telemetry.latitude.toFixed(6) : '--'}
              </Text>
            </View>
            <View style={styles.coordCol}>
              <Text style={styles.coordLabel}>LONGITUDE</Text>
              <Text style={styles.coordValue}>
                {telemetry ? telemetry.longitude.toFixed(6) : '--'}
              </Text>
            </View>
          </View>
          <View style={styles.trailFooter}>
            <Text style={styles.trailText}>
              In-Memory Breadcrumbs: <Text style={styles.trailHighlight}>{breadcrumbs.length} pts</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 16,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  controlRow: {
    marginBottom: 8,
  },
  errorAlert: {
    backgroundColor: '#3B1212',
    borderColor: colors.status.error,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  errorAlertText: {
    color: '#FCA5A5',
    fontSize: 12,
    fontWeight: '600',
  },
  connectButton: {
    backgroundColor: colors.surface,
    borderColor: colors.metric.cyan,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  connectButtonText: {
    color: colors.metric.cyan,
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 1.2,
  },
  disconnectButton: {
    backgroundColor: colors.surface,
    borderColor: colors.status.disconnected,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  disconnectButtonText: {
    color: colors.status.disconnected,
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 1.2,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  cardHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  coordsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  coordCol: {
    flex: 1,
  },
  coordLabel: {
    fontSize: 10,
    color: colors.textDisabled,
    fontWeight: '600',
    marginBottom: 2,
  },
  coordValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  trailFooter: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  trailText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  trailHighlight: {
    color: colors.metric.cyan,
    fontWeight: '700',
  },
});
