export function boundsFromCoordinates(
  coords: [number, number][],
): { ne: [number, number]; sw: [number, number] } | null {
  if (coords.length === 0) {
    return null;
  }
  let minLon = coords[0][0];
  let maxLon = coords[0][0];
  let minLat = coords[0][1];
  let maxLat = coords[0][1];
  for (const [lon, lat] of coords) {
    minLon = Math.min(minLon, lon);
    maxLon = Math.max(maxLon, lon);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }
  return { ne: [maxLon, maxLat], sw: [minLon, minLat] };
}
