import * as ExpoLocation from 'expo-location';

export type GpsFix = {
  lat: number;
  lon: number;
  heading: number;
  ts: number;
};

export type GpsWatch = {
  granted: boolean;
  stop: () => void;
};

export async function requestPermission(): Promise<boolean> {
  const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
  return status === 'granted';
}

export async function watchPositions(onFix: (fix: GpsFix) => void): Promise<() => void> {
  const sub = await ExpoLocation.watchPositionAsync(
    {
      accuracy: ExpoLocation.Accuracy.High,
      timeInterval: 1000,
      distanceInterval: 3,
    },
    (loc) => {
      const heading = loc.coords.heading;
      onFix({
        lat: loc.coords.latitude,
        lon: loc.coords.longitude,
        heading: heading != null && heading >= 0 ? heading : 0,
        ts: Math.floor(loc.timestamp),
      });
    },
  );
  return () => sub.remove();
}

/** 1. Demande la permission. 2. Suit le GPS. */
export async function startGuidanceGps(onFix: (fix: GpsFix) => void): Promise<GpsWatch> {
  const ok = await requestPermission();
  if (!ok) {
    return { granted: false, stop: () => undefined };
  }
  const stop = await watchPositions(onFix);
  return { granted: true, stop };
}
