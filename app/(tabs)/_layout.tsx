/**
 * Tab Navigation Layout
 * Feature: 002-navigation-shell
 *
 * Configures Expo Router tab navigation connecting Dashboard and History screens.
 * Wraps tabs in TelemetryProvider ensuring persistent background stream continuity (FR-006, FR-007).
 * Implements constraints from data-model.md for:
 * - NavigationShellState.activeRoute ('index' | 'history')
 * - NavigationShellState.isBackgroundStreamingActive (boolean)
 * - NavigationShellState.safeAreaInsets (EdgeInsets from react-native-safe-area-context)
 */

import { Tabs } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabBarIcon } from '../../src/presentation/components/TabBarIcon';
import { TelemetryProvider } from '../../src/presentation/context/TelemetryContext';
import { defaultTabBarAppearance } from '../../src/presentation/navigation/navigationRoutes';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <TelemetryProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: defaultTabBarAppearance.backgroundColor,
            borderTopColor: defaultTabBarAppearance.borderTopColor,
            borderTopWidth: defaultTabBarAppearance.borderTopWidth,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 6,
            height: 52 + (insets.bottom > 0 ? insets.bottom : 6),
          },
          tabBarActiveTintColor: defaultTabBarAppearance.activeTintColor,
          tabBarInactiveTintColor: defaultTabBarAppearance.inactiveTintColor,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarLabel: 'Dashboard',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon symbol="⌖" color={color} focused={focused} size={18} />
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            tabBarLabel: 'History',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon symbol="▤" color={color} focused={focused} size={18} />
            ),
          }}
        />
      </Tabs>
    </TelemetryProvider>
  );
}
