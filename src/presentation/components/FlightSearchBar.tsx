/**
 * FlightSearchBar Component
 * Feature: 003-flight-history-ui
 * Utilitarian tactical search bar with live text input, result count, and clear action.
 * Conforms to contracts/flight-history-components.contract.ts
 */

import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../../theme/colors';

export interface FlightSearchBarProps {
  /** Current search input string */
  query: string;
  /** Callback fired synchronously as the user types */
  onChangeQuery: (text: string) => void;
  /** Callback to reset search query */
  onClear: () => void;
  /** Number of matching records */
  resultCount: number;
  /** Total number of records available */
  totalCount: number;
  /** Test identifier */
  testID?: string;
}

export const FlightSearchBar: React.FC<FlightSearchBarProps> = ({
  query,
  onChangeQuery,
  onClear,
  resultCount,
  totalCount,
  testID = 'flight-search-bar',
}) => {
  const isFiltered = query.trim().length > 0;

  return (
    <View style={styles.container} testID={testID}>
      {/* Input Box */}
      <View style={styles.inputContainer}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          testID="flight-search-input"
          style={styles.input}
          value={query}
          onChangeText={onChangeQuery}
          placeholder="Filter by date, time, or ID..."
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="never"
        />
        {isFiltered ? (
          <TouchableOpacity
            testID="clear-search-button"
            style={styles.clearButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={onClear}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Result Count Badge */}
      <View style={styles.countBadge} testID="search-result-count-badge">
        <Text style={styles.countBadgeText}>
          {isFiltered ? `${resultCount} OF ${totalCount}` : `${totalCount} TOTAL`}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: {
    color: colors.textSecondary,
    fontSize: 16,
    marginRight: 6,
    fontWeight: '700',
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 13,
    paddingVertical: 0,
  },
  clearButton: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 12,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  clearButtonText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
  },
  countBadge: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 8,
    height: 40,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countBadgeText: {
    color: colors.metric.cyan,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
