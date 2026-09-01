import { MinibusMarker, busMarkerRotation } from '@/map/MinibusMarker';
import { render } from '@testing-library/react-native';

describe('MinibusMarker', () => {
  it('affiche l’asset bus img.png', () => {
    const view = render(<MinibusMarker />);
    expect(view.getByLabelText('Position du bus')).toBeTruthy();
  });
});

describe('busMarkerRotation', () => {
  it('suit le cap GPS normalisé', () => {
    expect(busMarkerRotation(0)).toBe(0);
    expect(busMarkerRotation(90)).toBe(90);
    expect(busMarkerRotation(360)).toBe(0);
  });
});
