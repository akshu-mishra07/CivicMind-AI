import { GeoPoint } from '@civicmind/shared';

/**
 * Calculate the distance between two points in meters using the Haversine formula
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Check if a location is within a radius of another location
 */
export function isWithinRadius(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number },
  radiusMeters: number
): boolean {
  const distance = haversineDistance(
    point1.lat,
    point1.lng,
    point2.lat,
    point2.lng
  );
  return distance <= radiusMeters;
}

/**
 * Create a GeoJSON Point object from latitude and longitude
 */
export function createGeoPoint(lat: number, lng: number): GeoPoint {
  return {
    type: 'Point',
    coordinates: [lng, lat], // Mongo stores [lng, lat]
  };
}

/**
 * Convert meters to radians (useful for MongoDB $nearSphere queries when using spherical coordinates)
 */
export function metersToRadians(meters: number): number {
  const EARTH_RADIUS_METERS = 6378137;
  return meters / EARTH_RADIUS_METERS;
}

/**
 * Convert coordinates list to bounding box (useful for map queries)
 */
export function createGeoBoundingBox(
  lat: number,
  lng: number,
  radiusMeters: number
) {
  // Approximate coordinate degree deltas
  const latDelta = radiusMeters / 111320; // 1 degree latitude ~ 111.32km
  const lngDelta =
    radiusMeters / (40075000 * Math.cos((lat * Math.PI) / 180) / 360);

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
}
