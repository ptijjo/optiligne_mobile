import { StopScheduleMarker } from '@/map/StopScheduleMarker';
import { render } from '@testing-library/react-native';

describe('StopScheduleMarker', () => {
  it('affiche l’horaire GTFS et marque le prochain arrêt', () => {
    const view = render(
      <StopScheduleMarker name="Forbach" arrivalSec={26100} isNext />,
    );
    expect(view.getByText('07:15')).toBeTruthy();
    expect(view.getByLabelText('Arrêt Forbach 07:15 prochain')).toBeTruthy();
  });
});
