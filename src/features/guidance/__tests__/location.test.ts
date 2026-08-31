import * as ExpoLocation from 'expo-location';
import { startGuidanceGps } from '@/features/guidance/location';

describe('guidance location', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('refuse sans permission', async () => {
    jest
      .mocked(ExpoLocation.requestForegroundPermissionsAsync)
      .mockResolvedValueOnce({ status: 'denied', granted: false, canAskAgain: true, expires: 'never' });

    const onUpdate = jest.fn();
    const result = await startGuidanceGps(onUpdate);
    expect(result.granted).toBe(false);
    expect(ExpoLocation.watchPositionAsync).not.toHaveBeenCalled();
    expect(onUpdate).not.toHaveBeenCalled();
    result.stop();
  });

  it('émet lat/lon/heading et s’arrête au cleanup', async () => {
    jest
      .mocked(ExpoLocation.requestForegroundPermissionsAsync)
      .mockResolvedValueOnce({ status: 'granted', granted: true, canAskAgain: true, expires: 'never' });

    let handler: ((loc: {
      coords: { latitude: number; longitude: number; heading: number | null };
      timestamp: number;
    }) => void) | null = null;
    const remove = jest.fn();
    jest.mocked(ExpoLocation.watchPositionAsync).mockImplementationOnce(async (_opts, cb) => {
      handler = cb as typeof handler;
      return { remove };
    });

    const onUpdate = jest.fn();
    const result = await startGuidanceGps(onUpdate);
    expect(result.granted).toBe(true);
    handler?.({
      coords: { latitude: 49.1, longitude: 6.17, heading: 90 },
      timestamp: 1000,
    });
    expect(onUpdate).toHaveBeenCalledWith({ lat: 49.1, lon: 6.17, heading: 90, ts: 1000 });
    result.stop();
    expect(remove).toHaveBeenCalled();
  });
});
