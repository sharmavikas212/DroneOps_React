/**
 * Navigation Routes Configuration & Shell Options
 * Feature: 002-navigation-shell
 *
 * Implements constraints from data-model.md for:
 * - NavigationRoute.name ('index' | 'history')
 * - NavigationRoute.title ('Dashboard' | 'History')
 * - NavigationRoute.iconSymbol ('⌖' | '▤')
 * - NavigationRoute.isDefault (true for 'index')
 * - NavigationRoute.href ('/' | '/history')
 */

import { colors } from '../../theme/colors';

export type TabRouteName = 'index' | 'history';

export interface TabRouteConfig {
  name: TabRouteName;
  title: string;
  tabBarLabel: string;
  iconSymbol: string;
  isInitialRoute: boolean;
  href: string;
}

export const NAVIGATION_SHELL_ROUTES: readonly TabRouteConfig[] = [
  {
    name: 'index',
    title: 'Dashboard',
    tabBarLabel: 'Dashboard',
    iconSymbol: '⌖',
    isInitialRoute: true,
    href: '/',
  },
  {
    name: 'history',
    title: 'History',
    tabBarLabel: 'History',
    iconSymbol: '▤',
    isInitialRoute: false,
    href: '/history',
  },
] as const;

export interface TabBarAppearanceOptions {
  backgroundColor: string;
  borderTopColor: string;
  borderTopWidth: number;
  activeTintColor: string;
  inactiveTintColor: string;
}

export const defaultTabBarAppearance: TabBarAppearanceOptions = {
  backgroundColor: colors.surface,
  borderTopColor: colors.border,
  borderTopWidth: 1,
  activeTintColor: colors.metric.cyan,
  inactiveTintColor: colors.textSecondary,
};
