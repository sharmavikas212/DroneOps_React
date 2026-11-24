/**
 * EmptyHistoryState Component
 * Tactical empty state banner displayed when no flight records exist in SQLite.
 * Complies with FR-008.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

export interface EmptyHistoryStateProps {
  message?: string;
  subMessage?: string;
}

export const EmptyHistoryState: React.FC<EmptyHistoryStateProps> = ({
  message = 'No flight logs recorded',
  subMessage = 'Completed flight sessions will appear here automatically.',
}) => {
  return (
    <View style={styles.container} testID="empty-history-state">
      <View style={styles.iconCircle}>
        <Text style={styles.iconText}>▤</Text>
      </View>
      <Text style={styles.titleText}>{message}</Text>
      <Text style={styles.subText}>{subMessage}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  iconText: {
    fontSize: 22,
    color: colors.textSecondary,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
});
