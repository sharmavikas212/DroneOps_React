/**
 * Tab Navigation Layout
 * Configures utilitarian dark theme styling for dashboard and planned history tabs.
 */

import { Tabs } from 'expo-router';
import React from 'react';
import { colors } from '../../src/theme/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: colors.metric.cyan,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
        }}
      />
    </Tabs>
  );
}
