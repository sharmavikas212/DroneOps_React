/**
 * DroneOps Flight History Screen
 * Feature: 003-flight-history-ui
 *
 * Secondary tab screen rendering historical flight summaries, search bar, and empty states.
 * Conforms strictly to Constitution Principle II: zero business logic in screen.
 */

import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FlightRecord } from '../../src/data/local/models/FlightRecordEntity';
import { EmptyHistoryState } from '../../src/presentation/components/EmptyHistoryState';
import { FlightDetailModal } from '../../src/presentation/components/FlightDetailModal';
import { FlightHistoryCard } from '../../src/presentation/components/FlightHistoryCard';
import { FlightSearchBar } from '../../src/presentation/components/FlightSearchBar';
import { TacticalConfirmDialog } from '../../src/presentation/components/TacticalConfirmDialog';
import { useFlightHistory } from '../../src/presentation/hooks/useFlightHistory';
import { colors } from '../../src/theme/colors';

export default function FlightHistoryScreen() {
  const {
    records,
    filteredRecords,
    searchQuery,
    setSearchQuery,
    clearSearchQuery,
    selectedRecord,
    selectRecord,
    deleteRecord,
    clearAllRecords,
    isDeleting,
    isLoading,
    errorMessage,
    isEmpty,
    isSearchEmpty,
    refresh,
  } = useFlightHistory();

  const [pendingDeleteRecord, setPendingDeleteRecord] = useState<FlightRecord | null>(null);
  const [showBulkClearConfirm, setShowBulkClearConfirm] = useState(false);

  // Automatically refresh records whenever the user focuses/switches to the History tab
  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

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
          <View style={styles.headerRightActions}>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>
                {records.length} {records.length === 1 ? 'LOG' : 'LOGS'}
              </Text>
            </View>
            {!isEmpty && records.length > 0 ? (
              <TouchableOpacity
                testID="clear-all-history-button"
                style={styles.clearAllButton}
                onPress={() => setShowBulkClearConfirm(true)}
              >
                <Text style={styles.clearAllButtonText}>CLEAR ALL</Text>
              </TouchableOpacity>
            ) : null}
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

        {/* Empty State Banner (FR-015) */}
        {!isLoading && isEmpty ? (
          <EmptyHistoryState />
        ) : null}

        {/* Search Bar (FR-004) - Only show when records exist */}
        {!isEmpty && records.length > 0 ? (
          <FlightSearchBar
            query={searchQuery}
            onChangeQuery={setSearchQuery}
            onClear={clearSearchQuery}
            resultCount={filteredRecords.length}
            totalCount={records.length}
          />
        ) : null}

        {/* Search Empty State (FR-007) */}
        {!isEmpty && isSearchEmpty ? (
          <View style={styles.searchEmptyContainer} testID="search-empty-state">
            <Text style={styles.searchEmptyIcon}>⌕</Text>
            <Text style={styles.searchEmptyTitle}>NO MATCHING FLIGHT LOGS</Text>
            <Text style={styles.searchEmptySubtitle}>
              No records match &quot;{searchQuery}&quot;
            </Text>
            <TouchableOpacity
              style={styles.clearSearchActionButton}
              onPress={clearSearchQuery}
              testID="clear-search-action-button"
            >
              <Text style={styles.clearSearchActionText}>CLEAR SEARCH FILTER</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Flight Records List */}
        {filteredRecords.map((record) => (
          <FlightHistoryCard
            key={record.id}
            record={record}
            onPress={selectRecord}
            onDeletePress={(rec) => setPendingDeleteRecord(rec)}
          />
        ))}
      </ScrollView>

      {/* Flight Detail Inspection Modal (FR-008, FR-009, FR-010) */}
      <FlightDetailModal
        visible={selectedRecord !== null}
        record={selectedRecord}
        onClose={() => selectRecord(null)}
        onDelete={(rec) => setPendingDeleteRecord(rec)}
      />

      {/* Single Record Deletion Confirmation Dialog (FR-011, FR-012, FR-014) */}
      <TacticalConfirmDialog
        visible={pendingDeleteRecord !== null}
        title="CONFIRM RECORD DELETION"
        message={`Permanently delete flight record from ${
          pendingDeleteRecord
            ? new Date(pendingDeleteRecord.startTimeMillis).toLocaleDateString()
            : ''
        } (${pendingDeleteRecord?.id})? This action cannot be undone.`}
        confirmLabel="DELETE RECORD"
        cancelLabel="CANCEL"
        isDanger={true}
        isLoading={isDeleting}
        onCancel={() => setPendingDeleteRecord(null)}
        onConfirm={async () => {
          if (pendingDeleteRecord) {
            const id = pendingDeleteRecord.id;
            setPendingDeleteRecord(null);
            await deleteRecord(id);
          }
        }}
      />

      {/* Bulk Clear Confirmation Dialog (FR-013, FR-014) */}
      <TacticalConfirmDialog
        visible={showBulkClearConfirm}
        title="PURGE ALL FLIGHT LOGS"
        message={`Permanently erase all ${records.length} flight records from local device storage? This operation cannot be reversed.`}
        confirmLabel="PURGE ALL"
        cancelLabel="CANCEL"
        isDanger={true}
        isLoading={isDeleting}
        onCancel={() => setShowBulkClearConfirm(false)}
        onConfirm={async () => {
          setShowBulkClearConfirm(false);
          await clearAllRecords();
        }}
        testID="bulk-clear-confirm-dialog"
      />
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
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clearAllButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: colors.status.error,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  clearAllButtonText: {
    color: colors.status.error,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
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
  searchEmptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 24,
    marginVertical: 12,
  },
  searchEmptyIcon: {
    fontSize: 28,
    color: colors.textSecondary,
    marginBottom: 8,
    fontWeight: '900',
  },
  searchEmptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  searchEmptySubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  clearSearchActionButton: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.metric.cyan,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  clearSearchActionText: {
    color: colors.metric.cyan,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
