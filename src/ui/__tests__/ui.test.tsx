import { AppText } from '@/ui/AppText';
import { Button } from '@/ui/Button';
import { Chip } from '@/ui/Chip';
import { EmptyState } from '@/ui/EmptyState';
import { ErrorBanner } from '@/ui/ErrorBanner';
import { GuidanceBanner } from '@/ui/GuidanceBanner';
import { Screen } from '@/ui/Screen';
import { Skeleton } from '@/ui/Skeleton';
import { fireEvent, render } from '@testing-library/react-native';

describe('ui', () => {
  it('ErrorBanner n’affiche rien sans message', () => {
    const view = render(<ErrorBanner message="" />);
    expect(view.toJSON()).toBeNull();
  });

  it('ErrorBanner affiche le message', () => {
    const view = render(<ErrorBanner message="Course introuvable." />);
    expect(view.getByText('Course introuvable.')).toBeTruthy();
  });

  it('Button déclenche onPress', () => {
    const onPress = jest.fn();
    const view = render(<Button label="Réessayer" onPress={onPress} />);
    fireEvent.press(view.getByLabelText('Réessayer'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('Button loading n’est pas pressable', () => {
    const onPress = jest.fn();
    const view = render(<Button label="Réessayer" onPress={onPress} loading />);
    fireEvent.press(view.getByLabelText('Réessayer'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('Screen compose titre et contenu', () => {
    const view = render(
      <Screen title="OptiLigne" subtitle="Aide à la conduite">
        <AppText>OK</AppText>
      </Screen>,
    );
    expect(view.getByText('OptiLigne')).toBeTruthy();
    expect(view.getByText('Aide à la conduite')).toBeTruthy();
    expect(view.getByText('OK')).toBeTruthy();
  });

  it('Screen hero affiche Opti et Ligne', () => {
    const view = render(
      <Screen variant="hero" title="OptiLigne" subtitle="Lignes de votre dépôt">
        <AppText>OK</AppText>
      </Screen>,
    );
    expect(view.getByText('OptiLigne')).toBeTruthy();
    expect(view.getByText('Lignes de votre dépôt')).toBeTruthy();
  });

  it('EmptyState et Skeleton s’affichent', () => {
    const empty = render(<EmptyState message="Aucune ligne scolaire pour ce dépôt." />);
    expect(empty.getByText('Aucune ligne scolaire pour ce dépôt.')).toBeTruthy();
    expect(render(<Skeleton />).getByLabelText('Chargement')).toBeTruthy();
  });

  it('Chip sélectionné', () => {
    const onPress = jest.fn();
    const view = render(<Chip label="Régulières" selected onPress={onPress} />);
    fireEvent.press(view.getByLabelText('Régulières'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('Chip non sélectionné', () => {
    render(<Chip label="Toutes" onPress={() => undefined} />);
  });

  it('GuidanceBanner affiche le libellé', () => {
    const view = render(
      <GuidanceBanner title="FORBACH" label="Sur le tracé" state="on_route" />,
    );
    expect(view.getByText('FORBACH')).toBeTruthy();
    expect(view.getByText('Sur le tracé')).toBeTruthy();
  });

  it('Screen affiche Retour', () => {
    const view = render(
      <Screen title="Courses" showBack>
        <AppText>OK</AppText>
      </Screen>,
    );
    fireEvent.press(view.getByLabelText('Retour'));
    const router = require('expo-router') as { __router: { back: jest.Mock } };
    expect(router.__router.back).toHaveBeenCalled();
  });
});
