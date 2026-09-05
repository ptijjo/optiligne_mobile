import type { GuidanceState, StartSession } from '@/features/guidance/types';
import { boundsFromCoordinates } from '@/map/bounds';
import { MinibusMarker, busMarkerRotation } from '@/map/MinibusMarker';
import { StopScheduleMarker } from '@/map/StopScheduleMarker';
import { routeLine } from '@/map/style';
import { useEffect, useMemo, useRef, useState, Fragment } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, type Region } from 'react-native-maps';

const METZ = { latitude: 49.119, longitude: 6.177 };

type LatLng = { latitude: number; longitude: number };

type GuidanceMapProps = {
  session: StartSession;
  state: GuidanceState;
  heading: number;
  coordinate?: [number, number];
  followUser?: boolean;
  nextStop?: string;
};

function toLatLng(coord: [number, number]): LatLng {
  return { latitude: coord[1], longitude: coord[0] };
}

function regionFromBounds(
  bounds: { ne: [number, number]; sw: [number, number] },
): Region {
  const latDelta = Math.max(0.02, (bounds.ne[1] - bounds.sw[1]) * 1.6);
  const lonDelta = Math.max(0.02, (bounds.ne[0] - bounds.sw[0]) * 1.6);
  return {
    latitude: (bounds.ne[1] + bounds.sw[1]) / 2,
    longitude: (bounds.ne[0] + bounds.sw[0]) / 2,
    latitudeDelta: latDelta,
    longitudeDelta: lonDelta,
  };
}

export function GuidanceMap({
  session,
  state,
  heading,
  coordinate,
  followUser = false,
  nextStop = '',
}: GuidanceMapProps) {
  const mapRef = useRef<MapView>(null);
  const [trackBus, setTrackBus] = useState(true);
  const coords = (session.shape?.coordinates ?? []).filter(
    (c) => Number.isFinite(c[0]) && Number.isFinite(c[1]),
  );
  const stops = useMemo(
    () => (session.stops ?? []).filter((stop) => Number.isFinite(stop.lat) && Number.isFinite(stop.lon)),
    [session.stops],
  );
  const bounds = boundsFromCoordinates(coords);
  const arrowLonLat =
    coordinate ?? coords[0] ?? (stops[0] ? ([stops[0].lon, stops[0].lat] as [number, number]) : null);
  const arrowAt = arrowLonLat ? toLatLng(arrowLonLat) : METZ;

  const routePoints = useMemo(() => coords.map(toLatLng), [coords]);

  const initialRegion = bounds
    ? regionFromBounds(bounds)
    : { ...arrowAt, latitudeDelta: 0.08, longitudeDelta: 0.08 };

  useEffect(() => {
    if (!bounds || routePoints.length < 2 || followUser) {
      return;
    }
    mapRef.current?.fitToCoordinates(routePoints, {
      edgePadding: { top: 140, right: 36, bottom: 48, left: 36 },
      animated: false,
    });
  }, [bounds, routePoints, followUser]);

  useEffect(() => {
    if (!followUser || !coordinate) {
      return;
    }
    const center = toLatLng(coordinate);
    mapRef.current?.animateToRegion(
      {
        ...center,
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      },
      400,
    );
  }, [followUser, coordinate]);

  useEffect(() => {
    setTrackBus(true);
    const timer = setTimeout(() => setTrackBus(false), 400);
    return () => clearTimeout(timer);
  }, [state, heading, arrowAt.latitude, arrowAt.longitude, nextStop]);

  return (
    <View testID="guidance-map" style={styles.fill}>
      <MapView
        ref={mapRef}
        style={styles.fill}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        mapType="standard"
        rotateEnabled={false}
        pitchEnabled={false}
        toolbarEnabled={false}
        showsPointsOfInterest={false}
        showsBuildings={false}
        showsTraffic={false}
        showsIndoors={false}
      >
        {routePoints.length >= 2 ? (
          <Polyline
            coordinates={routePoints}
            strokeColor={routeLine.strokeColor}
            strokeWidth={routeLine.strokeWidth}
            lineCap="round"
            lineJoin="round"
            zIndex={1}
          />
        ) : null}
        {stops.map((stop, index) => {
          const center = { latitude: stop.lat, longitude: stop.lon };
          const isNext = Boolean(nextStop) && stop.name === nextStop;
          return (
            <Fragment key={`${stop.sequence}-${stop.name}-${stop.lon}-${stop.lat}-${index}`}>
              <Marker
                coordinate={center}
                anchor={{ x: 0.5, y: 0.5 }}
                zIndex={isNext ? 5 : 3}
                tracksViewChanges={false}
              >
                <StopScheduleMarker
                  name={stop.name}
                  arrivalSec={stop.arrivalSec}
                  isNext={isNext}
                />
              </Marker>
            </Fragment>
          );
        })}
        <Marker
          coordinate={arrowAt}
          anchor={{ x: 0.5, y: 0.5 }}
          flat
          rotation={busMarkerRotation(heading)}
          zIndex={10}
          tracksViewChanges={trackBus}
        >
          <MinibusMarker />
        </Marker>
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
