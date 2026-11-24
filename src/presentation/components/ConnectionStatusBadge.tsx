/**
 * Connection Status Badge Component
 * High-visibility tactical link indicator displaying explicit connection state.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ConnectionState } from '../../data/source/TelemetrySource';
import { colors } from '../../theme/colors';

interface ConnectionStatusBadgeProps {
  state: ConnectionState;
}

export const ConnectionStatusBadge: React.FC<ConnectionStatusBadgeProps> = ({ state }) => {
  const getBadgeStyle = () => {
    switch (state) {
      case 'Connected':
        return { color: colors.status.connected, label: 'CONNECTED' };
      case 'Connecting':
        return { color: colors.status.connecting, label: 'CONNECTING...' };
      case 'Error':
        return { color: colors.status.error, label: 'LINK ERROR' };
      case 'Disconnected':
      default:
        return { color: colors.status.disconnected, label: 'DISCONNECTED' };
    }
  };

  const { color, label } = getBadgeStyle();

  return (
    <View style={[styles.badgeContainer, { borderColor: color }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    backgroundColor: colors.surface,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
});
