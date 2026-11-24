/**
 * Root Navigation Shell
 * Sets dark mode status bar and stack container.
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { FlightDatabase } from '../src/data/local/FlightDatabase';
import { colors } from '../src/theme/colors';

export default function RootLayout() {
  useEffect(() => {
    void FlightDatabase.initDatabase();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
