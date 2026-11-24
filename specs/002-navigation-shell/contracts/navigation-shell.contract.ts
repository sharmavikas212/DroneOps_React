/**
 * Contract: Navigation Shell Types & Routes
 * Feature: 002-navigation-shell
 */

export type TabRouteName = 'index' | 'history';

export interface TabRouteConfig {
  name: TabRouteName;
  title: string;
  tabBarLabel: string;
  iconSymbol: string;
  isInitialRoute?: boolean;
}

export const NAVIGATION_SHELL_ROUTES: readonly TabRouteConfig[] = [
  {
    name: 'index',
    title: 'Dashboard',
    tabBarLabel: 'Dashboard',
    iconSymbol: '⌖',
    isInitialRoute: true,
  },
  {
    name: 'history',
    title: 'History',
    tabBarLabel: 'History',
    iconSymbol: '▤',
    isInitialRoute: false,
  },
] as const;

export interface TabBarAppearanceOptions {
  backgroundColor: string;
  borderTopColor: string;
  borderTopWidth: number;
  activeTintColor: string;
  inactiveTintColor: string;
}
