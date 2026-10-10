
import { Coordinates, LookAngles } from '../types.ts';

const EARTH_RADIUS_KM = 6378.137;
const GEO_RADIUS_KM = 42164.14; // Orbital radius (altitude ~35,786 km + Earth radius)

const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

/**
 * Calculates geostationary satellite look angles (Azimuth, Elevation, Polarization Skew, Distance)
 * based on observer coordinates and satellite orbital longitude.
 */
export const calculateLookAngles = (
  loc: Coordinates,
  satLongitude: number
): LookAngles => {
  const latRad = toRad(loc.lat);
  const diffLonRad = toRad(satLongitude - loc.lng);

  // Central angle gamma between earth station and sub-satellite point
  const cosGamma = Math.cos(latRad) * Math.cos(diffLonRad);
  const sinGamma = Math.sqrt(Math.max(0, 1 - cosGamma * cosGamma));

  // Orbital radius ratio
  const r = EARTH_RADIUS_KM / GEO_RADIUS_KM;

  // Elevation Angle calculation
  let elevation = 0;
  if (sinGamma > 1e-7) {
    const elevRad = Math.atan2(cosGamma - r, sinGamma);
    elevation = toDeg(elevRad);
  } else if (cosGamma >= 1) {
    elevation = 90; // Directly overhead at sub-satellite point
  }

  // Azimuth Angle calculation
  let azimuth = 180;
  const deltaLon = satLongitude - loc.lng;
  const lat = loc.lat;

  if (Math.abs(lat) < 1e-5) {
    // Ground station on the equator
    azimuth = deltaLon >= 0 ? 90 : 270;
  } else {
    const absDiffLonRad = toRad(Math.abs(deltaLon));
    const absLatRad = toRad(Math.abs(lat));
    const alphaRad = Math.atan(Math.tan(absDiffLonRad) / Math.sin(absLatRad));
    const alphaDeg = toDeg(alphaRad);

    if (lat > 0) {
      // Northern Hemisphere
      azimuth = deltaLon >= 0 ? 180 - alphaDeg : 180 + alphaDeg;
    } else {
      // Southern Hemisphere
      azimuth = deltaLon >= 0 ? alphaDeg : 360 - alphaDeg;
    }
  }

  // Polarization Tilt / Skew Angle
  let skew = 0;
  if (Math.abs(lat) > 1e-5) {
    const skewRad = Math.atan2(Math.sin(diffLonRad), Math.tan(latRad));
    skew = toDeg(skewRad);
  }

  // Slant Range Distance (km)
  const distanceKm = Math.sqrt(
    EARTH_RADIUS_KM * EARTH_RADIUS_KM +
      GEO_RADIUS_KM * GEO_RADIUS_KM -
      2 * EARTH_RADIUS_KM * GEO_RADIUS_KM * cosGamma
  );

  return {
    azimuth: Number(azimuth.toFixed(2)),
    elevation: Number(elevation.toFixed(2)),
    skew: Number(skew.toFixed(2)),
    distance: Math.round(distanceKm)
  };
};
