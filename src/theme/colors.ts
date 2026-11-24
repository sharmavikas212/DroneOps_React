/**
 * Tactical Utilitarian Dark Theme Colors
 * Engineered for outdoor field readability with high-visibility semantic status tokens.
 */

export const colors = {
  // Backgrounds
  background: '#0B0F14',       // Deep tactical slate/black
  surface: '#151C24',          // Slightly elevated card background
  surfaceSubtle: '#1C2530',    // Secondary surface / tile border

  // Text / Typography
  textPrimary: '#F1F5F9',      // High-contrast primary reading text
  textSecondary: '#94A3B8',    // Muted metadata / labels
  textDisabled: '#475569',     // Inactive / disabled text

  // Borders & Dividers
  border: '#233040',
  borderStrong: '#334458',

  // Status & Telemetry Link States
  status: {
    connecting: '#38BDF8',     // Sky Blue / Cyan (Handshake in progress)
    connected: '#10B981',      // Emerald Green (Live telemetry feed)
    warning: '#F59E0B',        // Amber / Yellow (Stale data warning)
    disconnected: '#EF4444',   // Crimson Red (Watchdog signal loss)
    error: '#DC2626',          // Dark Red (Connection error / abort)
  },

  // Tactical HUD Metric Highlights
  metric: {
    cyan: '#06B6D4',           // Altitude & Airspeed accents
    green: '#22C55E',          // Healthy battery / GPS lock
    amber: '#EAB308',          // Cautionary threshold
    red: '#F43F5E',            // Critical low battery (< 20%)
  },
} as const;

export type ThemeColors = typeof colors;
