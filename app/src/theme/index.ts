export const Colors = {
  bgPrimary: '#0D0D14',
  bgSecondary: '#161622',
  bgTertiary: '#1E1E2E',
  bgElevated: '#252536',

  textPrimary: '#F5F5F7',
  textSecondary: '#8E8E9A',
  textTertiary: '#4A4A58',

  accent: '#4FC3F7',
  accentHover: '#81D4FA',
  success: '#66BB6A',
  warning: '#FFB74D',
  error: '#EF5350',

  leftHand: '#5C9CE6',
  rightHand: '#5ECE8A',
  perfect: '#4FC3F7',
  great: '#5C9CE6',
  good: '#5ECE8A',
  miss: '#EF5350',

  border: 'rgba(255,255,255,0.06)',
  borderLight: 'rgba(255,255,255,0.12)',

  // legacy aliases (game engine uses these)
  background: '#0D0D14',
  surface: '#161622',
  surfaceLight: '#1E1E2E',
  white: '#F5F5F7',
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
  display: 32,
  h1: 26,
  h2: 20,
  h3: 17,
  body: 15,
  caption: 13,
  small: 11,
  score: 48,
  stat: 36,
  combo: 32,
  grade: 24,
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
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  full: 9999,
};

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
};
