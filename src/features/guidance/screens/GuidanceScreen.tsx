import { isApiError } from '@/api/errors';
import { useGuidanceLive } from '@/features/guidance/hooks';
import { delayLabel } from '@/lib/delay-label';
import { GuidanceMap } from '@/map/GuidanceMap';
import { colors, fonts, spacing, tapMin } from '@/theme';
import { AppText } from '@/ui/AppText';
import { ErrorBanner } from '@/ui/ErrorBanner';
import { GuidanceBanner } from '@/ui/GuidanceBanner';
import { Skeleton } from '@/ui/Skeleton';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function GuidanceScreen() {
  const params = useLocalSearchParams<{ tripId: string; date: string; headsign?: string }>();
  const tripId = typeof params.tripId === 'string' ? params.tripId : params.tripId?.[0];
  const date = typeof params.date === 'string' ? params.date : params.date?.[0];
  const headsignRaw = typeof params.headsign === 'string' ? params.headsign : params.headsign?.[0];
  const headsign = headsignRaw || tripId || 'Course';
  const router = useRouter();

  const { start, guidance, gps, gpsError } = useGuidanceLive(tripId, date);
  const state = guidance?.state ?? 'on_route';
  const bannerLabel = guidance
    ? [guidance.next_stop, delayLabel(guidance.delay_s)].filter(Boolean).join(' · ')
    : gps
      ? 'Position reçue — calcul…'
      : 'En attente de position GPS';

  const errorMessage = isApiError(start.error)
    ? start.error.message
    : start.isError
      ? 'Impossible de démarrer le guidage'
      : !tripId || !date
        ? 'Course introuvable.'
        : '';

  const coordinate = gps ? ([gps.lon, gps.lat] as [number, number]) : undefined;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      {start.data ? (
        <GuidanceMap
          session={start.data}
          state={state}
          heading={gps?.heading ?? 0}
          coordinate={coordinate}
          followUser={Boolean(gps)}
          nextStop={guidance?.next_stop}
        />
      ) : (
        <View testID="guidance-map" style={styles.fill}>
          {start.isPending ? <Skeleton height={88} /> : null}
        </View>
      )}
      <SafeAreaView pointerEvents="box-none" style={styles.overlay} edges={['top', 'left', 'right']}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retour"
          onPress={() => router.back()}
          style={styles.back}
          testID="button-Retour"
        >
          <AppText style={styles.backLabel}>Retour</AppText>
        </Pressable>
        {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
        {gpsError && !gps ? <ErrorBanner message={gpsError} /> : null}
        {start.data ? (
          <GuidanceBanner title={headsign.toUpperCase()} label={bannerLabel} state={state} />
        ) : null}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  fill: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  back: {
    minHeight: tapMin,
    justifyContent: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 22,
  },
  backLabel: {
    color: colors.brand,
    fontFamily: fonts.bold,
  },
});
