// Uniswap-style light redesign palette.
// Accent pairs (mint/lilac/sun/sky/coral) are used for song tiles and
// category chips — each pair is a soft background + its readable ink.
export const Palette = {
  bg: '#F7F6F4',
  card: '#FFFFFF',
  ink: '#0E0E10',
  ink2: '#5B5D66',
  ink3: '#9599A3',
  line: '#ECECEE',
  chip: '#F1F1F3',

  primary: '#FF007A',
  primarySoft: '#FFE4F0',
  primaryDeep: '#D4006A',

  mint: '#B8F2CC',
  mintInk: '#0A6E3C',
  lilac: '#E3D9FF',
  lilacInk: '#5A3FD6',
  sun: '#FFE066',
  sunInk: '#7A5A00',
  sky: '#C9E4FF',
  skyInk: '#0F5BAB',
  coral: '#FFD5CE',
  coralInk: '#B4301C',
};

export const Colors = {
  bgPrimary: Palette.bg,
  bgSecondary: Palette.card,
  bgTertiary: Palette.chip,
  bgElevated: Palette.card,

  textPrimary: Palette.ink,
  textSecondary: Palette.ink2,
  textTertiary: Palette.ink3,

  accent: Palette.primary,
  accentHover: Palette.primaryDeep,
  success: Palette.mintInk,
  warning: Palette.sunInk,
  error: Palette.coralInk,

  leftHand: Palette.lilacInk,
  rightHand: Palette.primary,
  perfect: Palette.primary,
  great: Palette.lilacInk,
  good: Palette.mintInk,
  miss: Palette.coralInk,

  border: Palette.line,
  borderLight: '#F5F5F6',

  // legacy aliases (game engine may read these)
  background: Palette.bg,
  surface: Palette.card,
  surfaceLight: Palette.chip,
  white: '#FFFFFF',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FontSize = {
  display: 34,
  h1: 30,
  h2: 22,
  h3: 17,
  body: 15,
  caption: 13,
  small: 11,
  tiny: 10,
  score: 60,
  stat: 30,
  combo: 24,
  grade: 22,
  keyLabel: 10,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
};

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  xxl: 24,
  full: 9999,
};

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
  primary: {
    shadowColor: Palette.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 6,
  },
};
