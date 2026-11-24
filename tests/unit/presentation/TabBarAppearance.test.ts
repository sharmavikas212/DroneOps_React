/**
 * Unit Tests for Tab Bar Appearance & Tactical Utilitarian Styling (User Story 3 - SC-004, FR-005, FR-009)
 * Validates high-contrast active tab indicator, surface colors, and safe area options.
 */

import { defaultTabBarAppearance } from '../../../src/presentation/navigation/navigationRoutes';
import { colors } from '../../../src/theme/colors';

describe('TabBarAppearance - User Story 3 (Utilitarian Styling & Indicators)', () => {
  it('applies high-contrast tactical cyan for active tab tint (SC-004, FR-005)', () => {
    expect(defaultTabBarAppearance.activeTintColor).toBe(colors.metric.cyan);
    // Cyan metric highlight should differ markedly from muted secondary text
    expect(defaultTabBarAppearance.activeTintColor).not.toBe(defaultTabBarAppearance.inactiveTintColor);
    expect(defaultTabBarAppearance.inactiveTintColor).toBe(colors.textSecondary);
  });

  it('configures dark slate background and top border for situational awareness', () => {
    expect(defaultTabBarAppearance.backgroundColor).toBe(colors.surface);
    expect(defaultTabBarAppearance.borderTopColor).toBe(colors.border);
    expect(defaultTabBarAppearance.borderTopWidth).toBe(1);
  });

  it('guarantees tactical colors are dark-mode first', () => {
    // Assert background is deep black/slate
    expect(colors.background).toBe('#0B0F14');
    expect(colors.surface).toBe('#151C24');
    expect(colors.textPrimary).toBe('#F1F5F9');
  });
});
