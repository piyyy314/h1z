import { describe, it, expect } from 'vitest';
import { calculateLookAngles } from '../utils/geoUtils.ts';

describe('Orbital Mechanics - Geostationary Look Angles', () => {
  it('calculates look angles from London (51.5°N, 0.1°W) to Astra 28.2°E', () => {
    const london = { lat: 51.5074, lng: -0.1278 };
    const astraLon = 28.2;
    const angles = calculateLookAngles(london, astraLon);

    expect(angles.azimuth).toBeGreaterThan(130);
    expect(angles.azimuth).toBeLessThan(160);
    expect(angles.elevation).toBeGreaterThan(20);
    expect(angles.elevation).toBeLessThan(35);
    expect(angles.distance).toBeGreaterThan(37000);
    expect(angles.distance).toBeLessThan(40000);
  });

  it('calculates 90° elevation directly below sub-satellite point on the equator', () => {
    const subSatPoint = { lat: 0, lng: 13.0 };
    const satLon = 13.0;
    const angles = calculateLookAngles(subSatPoint, satLon);

    expect(Math.round(angles.elevation)).toBe(90);
    expect(angles.distance).toBeLessThan(36000); // approx GEO altitude (~35,786 km)
  });

  it('calculates negative elevation for satellites beyond the radio horizon', () => {
    // London trying to see a satellite on the opposite side of Earth (180°W)
    const london = { lat: 51.5074, lng: -0.1278 };
    const antipodalSat = -180;
    const angles = calculateLookAngles(london, antipodalSat);

    expect(angles.elevation).toBeLessThan(0);
  });

  it('calculates polarization skew symmetry', () => {
    const station = { lat: 35.0, lng: 0.0 };
    const satEast = calculateLookAngles(station, 20.0);
    const satWest = calculateLookAngles(station, -20.0);

    // Skew angles should have opposite signs for symmetrical longitude offsets
    expect(satEast.skew).toBeCloseTo(-satWest.skew, 1);
  });
});
