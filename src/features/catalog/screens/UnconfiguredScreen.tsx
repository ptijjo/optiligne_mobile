import { Screen } from '@/ui/Screen';
import { EmptyState } from '@/ui/EmptyState';

export function UnconfiguredScreen() {
  return (
    <Screen variant="hero" title="Appareil non configuré" subtitle="Ce téléphone n’a pas de dépôt provisionné.">
      <EmptyState message="Impossible d’afficher le catalogue. Contactez la régie." />
    </Screen>
  );
}
