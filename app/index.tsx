import { RoutesScreen } from '@/features/catalog/screens/RoutesScreen';
import { UnconfiguredScreen } from '@/features/catalog/screens/UnconfiguredScreen';
import { isScopeConfigured } from '@/scope';

export default function Index() {
  if (!isScopeConfigured()) {
    return <UnconfiguredScreen />;
  }
  return <RoutesScreen />;
}
