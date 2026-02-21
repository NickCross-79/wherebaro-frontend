/**
 * Centralized color theme for the entire app.
 * Change values here to update the color scheme everywhere.
 *
 * Design language: Premium Dark — near-black neutral backgrounds, clean white
 * text, barely-visible borders, pill shapes, and depth through layered grays.
 * Gold accent used sparingly for Baro-specific highlights.
 */

export const colors = {
  // ── Backgrounds ────────────────────────────────────────────────────────────
  /** Main app / screen background — near pure black */
  background: '#0C0C0E',
  /** Cards, headers, inputs — dark charcoal */
  surface: '#161618',
  /** Inner containers, secondary panels — slightly lifted gray */
  surfaceAlt: '#1C1C1E',
  /** Chart / market-tab panel backgrounds */
  surfaceChart: '#111113',
  /** Elevated card background (market tab) */
  surfaceElevated: '#222226',
  /** Backdrop for modal/glass panels */
  surfaceGlass: 'rgba(18, 18, 20, 0.92)',

  // ── Borders ────────────────────────────────────────────────────────────────
  /** Default subtle borders — barely-visible white */
  border: 'rgba(255, 255, 255, 0.06)',
  /** Image container / card borders — slightly more visible */
  borderAlt: 'rgba(255, 255, 255, 0.09)',
  /** Chart / market-tab section borders */
  borderChart: 'rgba(255, 255, 255, 0.07)',
  /** Top-edge sheen on cards (inner highlight) */
  glassHighlight: 'rgba(255, 255, 255, 0.03)',

  // ── Accent ─────────────────────────────────────────────────────────────────
  /** Primary accent — Baro gold */
  accent: '#fbeac4',
  /** Accent at 10% — active list items, hover tints */
  accentFaint: 'rgba(240, 184, 64, 0.10)',
  /** Accent at 40% — chart grids */
  accentMuted: 'rgba(240, 184, 64, 0.40)',
  /** Accent glow — shadow halo for accent-lit elements */
  accentGlow: 'rgba(240, 184, 64, 0.12)',

  // ── Text ───────────────────────────────────────────────────────────────────
  /** Primary text — pure white */
  text: '#FFFFFF',
  /** Slightly dimmed — price values */
  textLight: '#EBEBEB',
  /** Muted — labels, subtitles */
  textMuted: '#888888',
  /** Secondary muted — descriptions, price labels, inactive tabs */
  textSecondary: '#606060',
  /** Dimmed — hints, empty states, placeholders */
  textDim: '#383838',
  /** Near-black text on accent backgrounds */
  textOnAccent: '#0C0C0E',
  /** Off-white — alternate light text */
  textOffWhite: '#F5F5F5',

  // ── Links ──────────────────────────────────────────────────────────────────
  /** Wiki / external link */
  link: '#4A90D9',

  // ── Status ─────────────────────────────────────────────────────────────────
  /** Danger / error / destructive action */
  danger: '#E03535',
  /** Error text */
  error: '#FF5F5F',

  // ── Controls ───────────────────────────────────────────────────────────────
  /** Inactive chip / toggle border */
  controlBorder: 'rgba(255, 255, 255, 0.18)',
  /** Switch track (off state) / disabled button background */
  controlOff: '#1E1E20',
  /** Disabled / muted buttons */
  controlDisabled: '#252528',
  /** Disabled border (clear button) */
  controlDisabledBorder: 'rgba(255, 255, 255, 0.05)',

  // ── Overlays & Shadows ─────────────────────────────────────────────────────
  /** Shadow color */
  shadow: '#000000',
  /** Full-screen dimmer */
  overlay: 'rgba(0, 0, 0, 0.88)',
  /** Chart tooltip background */
  chartTooltipBg: '#1A1A1C',
};

/**
 * Helper: returns an accent-opacity color string.
 * Useful for dynamic opacities (e.g., animated chart bars).
 * @param {number} opacity - 0 to 1
 */
export const accentWithOpacity = (opacity) =>
  `rgba(240, 184, 64, ${opacity})`;

/**
 * Gradient stop presets used across the app.
 * Each is an array of color strings for LinearGradient.
 */
export const gradients = {
  /** Tab-bar fade from transparent to surface */
  tabBar: ['rgba(12, 12, 14, 0)', 'rgba(12, 12, 14, 0.92)', '#0C0C0E'],
  /** Image overlay fade from background to transparent */
  imageOverlay: ['rgba(12, 12, 14, 0.97)', 'rgba(12, 12, 14, 0.05)'],
  /** Subtle top-edge sheen on elevated panels */
  glassSheen: ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.00)'],
};

// ─────────────────────────────────────────────────────────────────────────────
// ORIGINAL PALETTE (warm dark blue-gray, amber gold accent)
// ─────────────────────────────────────────────────────────────────────────────
//
// export const colors = {
//   background:            '#0A0E1A',
//   surface:               '#0F1419',
//   surfaceAlt:            '#151B23',
//   surfaceChart:          '#10151C',
//   surfaceElevated:       '#1C2430',
//
//   border:                '#1A2332',
//   borderAlt:             '#1F2937',
//   borderChart:           '#2C3545',
//
//   accent:                '#D4A574',
//   accentFaint:           'rgba(212, 165, 116, 0.1)',
//   accentMuted:           'rgba(212, 165, 116, 0.5)',
//
//   text:                  '#FFFFFF',
//   textLight:             '#E8E8E8',
//   textMuted:             '#9BA5B8',
//   textSecondary:         '#8B9DC3',
//   textDim:               '#5A6B8C',
//   textOnAccent:          '#0A0E1A',
//   textOffWhite:          '#F0EFF4',
//
//   link:                  '#5B9BD5',
//
//   danger:                '#D23B35',
//   error:                 '#FF6B6B',
//
//   controlBorder:         '#5A6B8C',
//   controlOff:            '#2A3442',
//   controlDisabled:       '#3A4556',
//   controlDisabledBorder: '#3A3A3A',
//
//   shadow:                '#000',
//   overlay:               'rgba(0, 0, 0, 0.9)',
//   chartTooltipBg:        '#1a1a1a',
// };
//
// export const accentWithOpacity = (opacity) =>
//   `rgba(212, 165, 116, ${opacity})`;
//
// export const gradients = {
//   tabBar:        ['rgba(15, 20, 25, 0.15)', 'rgba(15, 20, 25, 0.85)', '#0F1419'],
//   imageOverlay:  ['rgba(10, 14, 26, 0.95)', 'rgba(10, 14, 26, 0.15)'],
// };
