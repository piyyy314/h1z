import { describe, it, expect } from 'vitest';
import {
  calculateDistanceKm,
  calculateDistanceDeg,
  convertCoordsToSvg,
  buildLiveStrategicZones,
  evaluateThreatEnvironment,
  STATIC_STRATEGIC_ZONES
} from '../utils/strategicOverlayUtils.ts';

describe('Strategic Overlay Utility Suite', () => {
  it('calculates accurate Haversine distance between London and Paris (~344 km)', () => {
    const london = { lat: 51.5074, lng: -0.1278 };
    const paris = { lat: 48.8566, lng: 2.3522 };
    const dist = calculateDistanceKm(london, paris);
    expect(dist).toBeGreaterThan(330);
    expect(dist).toBeLessThan(360);
  });

  it('correctly maps coordinates into SVG equirectangular [0-100, 0-50] space', () => {
    // Equator / Prime Meridian (0, 0) -> x=50, y=25
    const origin = convertCoordsToSvg({ lat: 0, lng: 0 });
    expect(origin.x).toBeCloseTo(50, 4);
    expect(origin.y).toBeCloseTo(25, 4);

    // North Pole (90, 0) -> y=0
    const northPole = convertCoordsToSvg({ lat: 90, lng: 0 });
    expect(northPole.y).toBeCloseTo(0, 4);

    // South Pole (-90, 0) -> y=50
    const southPole = convertCoordsToSvg({ lat: -90, lng: 0 });
    expect(southPole.y).toBeCloseTo(50, 4);

    // 180°W (-180) -> x=0, 180°E (180) -> x=100
    const westLimit = convertCoordsToSvg({ lat: 0, lng: -180 });
    const eastLimit = convertCoordsToSvg({ lat: 0, lng: 180 });
    expect(westLimit.x).toBeCloseTo(0, 4);
    expect(eastLimit.x).toBeCloseTo(100, 4);
  });

  it('contains expected categories: restricted airspace, jamming zones, and high-risk interference areas', () => {
    const airspaces = STATIC_STRATEGIC_ZONES.filter(z => z.type === 'restricted_airspace');
    const jamming = STATIC_STRATEGIC_ZONES.filter(z => z.type === 'jamming_zone');
    const interference = STATIC_STRATEGIC_ZONES.filter(z => z.type === 'interference_area');

    expect(airspaces.length).toBeGreaterThanOrEqual(5);
    expect(jamming.length).toBeGreaterThanOrEqual(4);
    expect(interference.length).toBeGreaterThanOrEqual(4);

    // Check specific known zones
    expect(airspaces.some(z => z.id === 'zone-r4808n')).toBe(true);
    expect(jamming.some(z => z.id === 'zone-levant')).toBe(true);
    expect(interference.some(z => z.id === 'zone-scint-amazon')).toBe(true);
  });

  it('dynamically injects an active EW jamming zone when isJamming is true', () => {
    const userLoc = { lat: 35.0, lng: -110.0 };
    const normalZones = buildLiveStrategicZones(userLoc, undefined, false, 0);
    expect(normalZones.some(z => z.id === 'dynamic-live-jamming')).toBe(false);

    const jammedZones = buildLiveStrategicZones(userLoc, undefined, true, 45);
    const dynamicEmitter = jammedZones.find(z => z.id === 'dynamic-live-jamming');

    expect(dynamicEmitter).toBeDefined();
    expect(dynamicEmitter?.severity).toBe('CRITICAL');
    expect(dynamicEmitter?.isDynamic).toBe(true);
    expect(dynamicEmitter?.radiusDeg).toBeGreaterThan(3);
    expect(dynamicEmitter?.telemetryImpact).toContain('Real-time SNR drop');
  });

  it('detects when the operator station is located inside a restricted airspace', () => {
    // Station located inside Nevada Test Range
    const stationInArea51 = { lat: 37.24, lng: -115.81 };
    const zones = buildLiveStrategicZones(stationInArea51);
    const evaluation = evaluateThreatEnvironment(stationInArea51, zones);

    expect(evaluation.insideZones.length).toBeGreaterThan(0);
    expect(evaluation.insideZones[0].id).toBe('zone-r4808n');
    expect(evaluation.overallThreatLevel).toBe('CRITICAL');
    expect(evaluation.advisoryText).toContain('BREACH ALERT');
  });

  it('escalates North Atlantic rain fade zone severity to CRITICAL during HEAVY_STORM', () => {
    const userLoc = { lat: 50.0, lng: 0.0 };
    const stormZones = buildLiveStrategicZones(userLoc, undefined, false, 0, 'HEAVY_STORM');
    const stormZone = stormZones.find(z => z.id === 'zone-storm-natlantic');

    expect(stormZone?.severity).toBe('CRITICAL');
    expect(stormZone?.telemetryImpact).toContain('Severe Tropical Atmospheric Wipeout');
  });
});
