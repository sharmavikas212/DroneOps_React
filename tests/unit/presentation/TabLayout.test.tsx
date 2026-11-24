/**
 * Unit Tests for Tab Navigation Configuration & Routes (User Story 1 - SC-003)
 * Validates default landing route, route definitions, and appearance tokens.
 */

import {
  NAVIGATION_SHELL_ROUTES,
  defaultTabBarAppearance,
} from '../../../src/presentation/navigation/navigationRoutes';
import { colors } from '../../../src/theme/colors';

describe('Tab Navigation Layout Configuration - User Story 1 (SC-003, FR-001, FR-002, FR-003)', () => {
  it('defines dedicated destinations for Dashboard and History', () => {
    const routeNames = NAVIGATION_SHELL_ROUTES.map((r) => r.name);
    expect(routeNames).toEqual(['index', 'history']);
  });

  it('designates Dashboard (index) as the default initial landing route (FR-003, SC-003)', () => {
    const defaultRoute = NAVIGATION_SHELL_ROUTES.find((r) => r.isInitialRoute);
    expect(defaultRoute).toBeDefined();
    expect(defaultRoute?.name).toBe('index');
    expect(defaultRoute?.title).toBe('Dashboard');
    expect(defaultRoute?.href).toBe('/');
  });

  it('configures tactical iconography and titles for both tabs', () => {
    const dashboardRoute = NAVIGATION_SHELL_ROUTES.find((r) => r.name === 'index');
    const historyRoute = NAVIGATION_SHELL_ROUTES.find((r) => r.name === 'history');

    expect(dashboardRoute?.iconSymbol).toBe('⌖');
    expect(dashboardRoute?.tabBarLabel).toBe('Dashboard');

    expect(historyRoute?.iconSymbol).toBe('▤');
    expect(historyRoute?.tabBarLabel).toBe('History');
    expect(historyRoute?.href).toBe('/history');
    expect(historyRoute?.isInitialRoute).toBe(false);
  });

  it('applies utilitarian tactical dark theme appearance options', () => {
    expect(defaultTabBarAppearance.backgroundColor).toBe(colors.surface);
    expect(defaultTabBarAppearance.borderTopColor).toBe(colors.border);
    expect(defaultTabBarAppearance.borderTopWidth).toBe(1);
    expect(defaultTabBarAppearance.activeTintColor).toBe(colors.metric.cyan);
    expect(defaultTabBarAppearance.inactiveTintColor).toBe(colors.textSecondary);
  });
});
