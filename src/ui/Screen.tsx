import { colors, fonts, spacing, tapMin } from '@/theme';
import { AppText } from '@/ui/AppText';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ScreenProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  variant?: 'default' | 'hero';
};

export function Screen({
  children,
  title,
  subtitle,
  showBack = false,
  variant = 'default',
}: ScreenProps) {
  const router = useRouter();
  const hero = variant === 'hero';

  return (
    <SafeAreaView style={[styles.safe, hero && styles.safeHero]} edges={['top', 'left', 'right']}>
      <StatusBar style={hero ? 'light' : 'dark'} />
      {hero && title ? (
        <View style={styles.hero}>
          {showBack ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Retour"
              onPress={() => router.back()}
              style={styles.backHero}
              testID="button-Retour"
            >
              <AppText variant="onBrand">Retour</AppText>
            </Pressable>
          ) : null}
          <AppText accessibilityRole="header" style={styles.brandMark}>
            {title === 'OptiLigne' ? (
              <>
                <Text style={styles.opti}>Opti</Text>
                <Text style={styles.ligne}>Ligne</Text>
              </>
            ) : (
              title
            )}
          </AppText>
          {subtitle ? (
            <AppText variant="onBrand" style={styles.heroSubtitle}>
              {subtitle}
            </AppText>
          ) : null}
        </View>
      ) : null}
      <View style={[styles.content, hero && styles.contentHero]}>
        {!hero && showBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retour"
            onPress={() => router.back()}
            style={styles.back}
            testID="button-Retour"
          >
            <AppText variant="caption" style={styles.backLabel}>
              Retour
            </AppText>
          </Pressable>
        ) : null}
        {!hero && title ? (
          <AppText accessibilityRole="header" variant="title" style={styles.title}>
            {title}
          </AppText>
        ) : null}
        {!hero && subtitle ? (
          <AppText variant="muted" style={styles.subtitle}>
            {subtitle}
          </AppText>
        ) : null}
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  safeHero: {
    backgroundColor: colors.brand,
  },
  hero: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  brandMark: {
    fontSize: 28,
    lineHeight: 34,
    color: colors.white,
  },
  opti: {
    fontFamily: fonts.bold,
    color: colors.white,
    fontSize: 28,
  },
  ligne: {
    fontFamily: fonts.regular,
    color: colors.white,
    fontSize: 28,
  },
  heroSubtitle: {
    marginTop: spacing.xs,
    opacity: 0.92,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  contentHero: {
    backgroundColor: colors.canvas,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: spacing.lg,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.sm,
  },
  back: {
    minHeight: tapMin,
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  backHero: {
    minHeight: tapMin,
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  backLabel: {
    color: colors.brand,
    fontFamily: fonts.bold,
  },
});
