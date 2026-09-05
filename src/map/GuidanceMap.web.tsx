import type { GuidanceState, StartSession } from '@/features/guidance/types';
import { formatDeparture } from '@/lib/format-departure';
import { colors, fonts, spacing } from '@/theme';
import { AppText } from '@/ui/AppText';
import { StyleSheet, View } from 'react-native';

type GuidanceMapProps = {
  session: StartSession;
  state: GuidanceState;
  heading: number;
  coordinate?: [number, number];
  followUser?: boolean;
  nextStop?: string;
};

/** Stub web : react-native-maps est natif-only (pas de bundling web). */
export function GuidanceMap({ session, nextStop = '' }: GuidanceMapProps) {
  const stops = session.stops ?? [];
  return (
    <View testID="guidance-map" style={styles.fill}>
      <AppText style={styles.message}>
        La carte de guidage est disponible sur l’app Android / iOS.
      </AppText>
      {stops.map((stop, index) => {
        const time = formatDeparture(stop.arrivalSec);
        const isNext = Boolean(nextStop) && stop.name === nextStop;
        return (
          <AppText
            key={`${stop.sequence}-${stop.name}-${index}`}
            style={isNext ? styles.nextStop : styles.stop}
          >
            {time} · {stop.name}
            {isNext ? ' (prochain)' : ''}
          </AppText>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.xs,
  },
  message: {
    color: colors.muted,
    fontFamily: fonts.medium,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  stop: {
    color: colors.slate,
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  nextStop: {
    color: colors.brand,
    fontFamily: fonts.bold,
    fontSize: 13,
  },
});
