/**
 * DroneOps Flight History Screen
 * Feature: 002-navigation-shell
 *
 * Secondary tab screen rendering historical flight summaries and empty states.
 * Conforms strictly to Constitution Principle II: zero business logic in screen.
 */

import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { EmptyHistoryState } from '../../src/presentation/components/EmptyHistoryState';
import { FlightHistoryCard } from '../../src/presentation/components/FlightHistoryCard';
import { useFlightHistory } from '../../src/presentation/hooks/useFlightHistory';
import { colors } from '../../src/theme/colors';

export default function FlightHistoryScreen() {
  const { records, isLoading, errorMessage, isEmpty, refresh } = useFlightHistory();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && records.length > 0}
            onRefresh={refresh}
            tintColor={colors.metric.cyan}
            colors={[colors.metric.cyan]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>DRONEOPS GCS</Text>
            <Text style={styles.subtitle}>Historical Mission Logs</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>
              {records.length} {records.length === 1 ? 'LOG' : 'LOGS'}
            </Text>
          </View>
        </View>

        {/* Error Alert */}
        {errorMessage ? (
          <View style={styles.errorAlert}>
            <Text style={styles.errorAlertText}>⚠️ {errorMessage}</Text>
          </View>
        ) : null}

        {/* Initial Loading State */}
        {isLoading && records.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.metric.cyan} />
            <Text style={styles.loadingText}>Accessing local flight store...</Text>
          </View>
        ) : null}

        {/* Empty State Banner (FR-008) */}
        {!isLoading && isEmpty ? (
          <EmptyHistoryState />
        ) : null}

        {/* Flight Records List */}
        {records.map((record) => (
          <FlightHistoryCard key={record.id} record={record} />
        ))}
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
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
    fontWeight: '500',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  countBadgeText: {
    color: colors.metric.cyan,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  errorAlert: {
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    borderColor: colors.status.error,
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
  },
  errorAlertText: {
    color: colors.status.error,
    fontSize: 13,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 12,
    color: colors.textSecondary,
    fontSize: 13,
  },
});
