import type { GuidanceState } from '@/features/guidance/types';
import { pointerColor } from '@/map/pointer';
import { colors, fonts, radius, spacing } from '@/theme';
import { AppText } from '@/ui/AppText';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type GuidanceBannerProps = {
  title: string;
  label: string;
  state: GuidanceState;
};

export function GuidanceBanner({ title, label, state }: GuidanceBannerProps) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (state === 'off_route') {
      opacity.value = withRepeat(withTiming(0.35, { duration: 450 }), -1, true);
      return () => {
        cancelAnimation(opacity);
        opacity.value = 1;
      };
    }
    cancelAnimation(opacity);
    opacity.value = 1;
    return undefined;
  }, [opacity, state]);

  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      style={[styles.banner, { backgroundColor: pointerColor(state) }, animated]}
    >
      <AppText style={styles.title}>{title}</AppText>
      <AppText style={styles.label}>{label}</AppText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.xs,
  },
  title: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 18,
    lineHeight: 24,
  },
  label: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
  },
});
