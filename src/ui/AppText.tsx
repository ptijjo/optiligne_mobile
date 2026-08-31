import { fonts, colors } from '@/theme';
import { Text, type TextProps, type TextStyle } from 'react-native';

const variants = {
  body: { fontSize: 16, color: colors.slate, fontFamily: fonts.regular, lineHeight: 24 },
  title: {
    fontSize: 24,
    lineHeight: 30,
    color: colors.slate,
    fontFamily: fonts.bold,
  },
  display: {
    fontSize: 28,
    lineHeight: 34,
    color: colors.white,
    fontFamily: fonts.bold,
  },
  caption: { fontSize: 13, color: colors.muted, fontFamily: fonts.medium, lineHeight: 18 },
  muted: { fontSize: 14, color: colors.muted, fontFamily: fonts.medium, lineHeight: 20 },
  danger: { fontSize: 14, color: colors.danger, fontFamily: fonts.regular },
  success: { fontSize: 14, color: colors.success, fontFamily: fonts.medium },
  button: { fontSize: 16, color: colors.white, fontFamily: fonts.bold },
  onBrand: { fontSize: 14, color: colors.white, fontFamily: fonts.medium, lineHeight: 20 },
} as const satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof variants;

type AppTextProps = TextProps & {
  variant?: TextVariant;
};

export function AppText({ variant = 'body', style, ...props }: AppTextProps) {
  return <Text style={[variants[variant], style]} {...props} />;
}
