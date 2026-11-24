/**
 * TabBarIcon Component
 * Utilitarian tactical icon glyph renderer for bottom tab navigation.
 * Uses high-contrast glyphs with active/inactive color tinting.
 */

import React from 'react';
import { ColorValue, StyleSheet, Text, View } from 'react-native';

export interface TabBarIconProps {
  symbol: string;
  color?: ColorValue | string;
  size?: number;
  focused?: boolean;
}

export const TabBarIcon: React.FC<TabBarIconProps> = ({
  symbol,
  color,
  size = 18,
  focused = false,
}) => {
  return (
    <View style={styles.container} testID={`tab-bar-icon-${symbol}`}>
      <Text
        style={[
          styles.symbolText,
          {
            color: color as any,
            fontSize: size,
            fontWeight: focused ? 'bold' : 'normal',
          },
        ]}
      >
        {symbol}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
  },
  symbolText: {
    textAlign: 'center',
    includeFontPadding: false,
  },
});
