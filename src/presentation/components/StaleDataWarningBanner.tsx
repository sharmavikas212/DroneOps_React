/**
 * Stale Data Warning Banner Component
 * Displays high-contrast tactical amber banner when telemetry signal is interrupted.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

interface StaleDataWarningBannerProps {
  isStale: boolean;
}

export const StaleDataWarningBanner: React.FC<StaleDataWarningBannerProps> = ({ isStale }) => {
  if (!isStale) {
    return null;
  }

  return (
    <View style={styles.banner}>
      <Text style={styles.bannerIcon}>⚠️</Text>
      <View style={styles.textContainer}>
        <Text style={styles.bannerTitle}>SIGNAL LOST (WATCHDOG TIMEOUT)</Text>
        <Text style={styles.bannerMessage}>
          Displaying last-known telemetry coordinates. Data is frozen and marked stale.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D1E08',
    borderColor: colors.status.warning,
    borderWidth: 1.5,
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  bannerIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.status.warning,
    letterSpacing: 1,
    marginBottom: 2,
  },
  bannerMessage: {
    fontSize: 11,
    color: '#FDE68A',
    lineHeight: 15,
  },
});
