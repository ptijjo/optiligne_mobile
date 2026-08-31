import { isApiError } from '@/api/errors';
import { useHealth } from '@/api/health';
import { getScope } from '@/scope';
import { colors, radius, spacing } from '@/theme';
import { AppText } from '@/ui/AppText';
import { Button } from '@/ui/Button';
import { ErrorBanner } from '@/ui/ErrorBanner';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export function HealthStatus() {
  const health = useHealth();
  const scope = getScope();
  const errorMessage = isApiError(health.error)
    ? health.error.message
    : health.isError
      ? 'Impossible de joindre le serveur'
      : '';
  const online = health.data?.status === 'ok';

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        {health.isPending ? <ActivityIndicator accessibilityLabel="Connexion à l’API" /> : null}
        {online ? (
          <View style={styles.pill}>
            <View style={styles.dot} />
            <AppText variant="success">API connectée</AppText>
          </View>
        ) : null}
        {health.isError ? <AppText>API hors ligne</AppText> : null}
      </View>
      <AppText variant="caption">
        Dépôt {scope.depotId} · {scope.operatorId}
      </AppText>
      {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
      {health.isError ? (
        <Button label="Réessayer" onPress={() => void health.refetch()} loading={health.isFetching} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.success,
  },
});
