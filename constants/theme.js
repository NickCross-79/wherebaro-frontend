/**
 * Centralized color theme for the entire app.
 * Change values here to update the color scheme everywhere.
 */

export const colors = {
  // ── Backgrounds ────────────────────────────────────────────────────────────
  /** Main app / screen background (darkest) */
  background: '#0A0E1A',
  /** Cards, headers, inputs, panels */
  surface: '#0F1419',
  /** Inner containers, secondary panels */
  surfaceAlt: '#151B23',
  /** Chart / market-tab panel backgrounds */
  surfaceChart: '#10151C',
  /** Elevated card background (market tab) */
  surfaceElevated: '#1C2430',

  // ── Borders ────────────────────────────────────────────────────────────────
  /** Default subtle borders */
  border: '#1A2332',
  /** Image container borders */
  borderAlt: '#1F2937',
  /** Chart / market-tab section borders */
  borderChart: '#2C3545',

  // ── Accent ─────────────────────────────────────────────────────────────────
  /** Primary accent (gold) — buttons, badges, highlights, icons */
  accent: '#D4A574',
  /** Accent at 10% opacity — active list items, hover states */
  accentFaint: 'rgba(212, 165, 116, 0.1)',
  /** Accent at 50% opacity — chart grids */
  accentMuted: 'rgba(212, 165, 116, 0.5)',

  // ── Text ───────────────────────────────────────────────────────────────────
  /** Primary text (white) */
  text: '#FFFFFF',
  /** Slightly dimmed text — price values */
  textLight: '#E8E8E8',
  /** Muted text — labels, subtitles */
  textMuted: '#9BA5B8',
  /** Secondary muted text — descriptions, price labels, inactive tabs */
  textSecondary: '#8B9DC3',
  /** Dimmed text — hints, empty states, placeholders */
  textDim: '#5A6B8C',
  /** Near-black text on accent backgrounds */
  textOnAccent: '#0A0E1A',
  /** Off-white text */
  textOffWhite: '#F0EFF4',

  // ── Links ──────────────────────────────────────────────────────────────────
  /** Wiki / external link color */
  link: '#5B9BD5',

  // ── Status ─────────────────────────────────────────────────────────────────
  /** Danger / error / destructive action */
  danger: '#D23B35',
  /** Error text */
  error: '#FF6B6B',

  // ── Controls ───────────────────────────────────────────────────────────────
  /** Inactive chip / toggle border */
  controlBorder: '#5A6B8C',
  /** Switch track (off state) / disabled button background */
  controlOff: '#2A3442',
  /** Disabled / muted buttons */
  controlDisabled: '#3A4556',
  /** Disabled border (clear button) */
  controlDisabledBorder: '#3A3A3A',

  // ── Overlays & Shadows ─────────────────────────────────────────────────────
  /** Shadow color */
  shadow: '#000',
  /** Full-screen dimmer */
  overlay: 'rgba(0, 0, 0, 0.9)',
  /** Chart tooltip background */
  chartTooltipBg: '#1a1a1a',
};

/**
 * Helper: returns an accent-opacity color string.
 * Useful for dynamic opacities (e.g., animated chart bars).
 * @param {number} opacity - 0 to 1
 */
export const accentWithOpacity = (opacity) =>
  `rgba(212, 165, 116, ${opacity})`;

/**
 * Gradient stop presets used across the app.
 * Each is an array of color strings for LinearGradient.
 */
export const gradients = {
  /** Tab-bar fade from transparent to surface */
  tabBar: ['rgba(15, 20, 25, 0.15)', 'rgba(15, 20, 25, 0.85)', '#0F1419'],
  /** Image overlay fade from background to transparent */
  imageOverlay: ['rgba(10, 14, 26, 0.95)', 'rgba(10, 14, 26, 0.15)'],
};
