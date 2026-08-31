export const colors = {
  brand: '#0056D6',
  white: '#FFFFFF',
  slate: '#333333',
  danger: '#E63946',
  warning: '#F4A261',
  success: '#2A9D8F',
  muted: '#777777',
  mapBuilding: '#EEEEEE',
  mapRoad: '#CCCCCC',
  trail: '#AAAAAA',
  canvas: '#EEEEEE',
  brandTint: '#D6E4FA',
  dangerTint: '#FDECEE',
  successTint: '#E6F5F3',
} as const;

export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  bold: 'Inter_700Bold',
} as const;

export const typography = {
  display: { fontSize: 28, lineHeight: 34, fontFamily: fonts.bold, color: colors.white },
  title: { fontSize: 24, lineHeight: 30, fontFamily: fonts.bold, color: colors.slate },
  body: { fontSize: 16, lineHeight: 24, fontFamily: fonts.regular, color: colors.slate },
  caption: { fontSize: 13, lineHeight: 18, fontFamily: fonts.medium, color: colors.muted },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  md: 12,
  xl: 20,
  full: 999,
} as const;

export const tapMin = 44;
