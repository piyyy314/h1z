import { describe, it, expect } from 'vitest';
import {
  DETECTED_FIRES,
  HORMUZ_MARITIME_FIRES,
  MIDDLE_EAST_LAND_FIRES,
  ALL_MIDDLE_EAST_FIRES,
  ALL_MIDDLE_EAST_AND_HORMUZ_FIRES,
  DETECTED_MALWARE_C2,
  getTelstar11NTransportParams
} from '../utils/heatmapData.ts';
import { nasaFirmsService } from '../services/nasaFirmsService.ts';

describe('Heatmap & NASA FIRMS Live Fire Intelligence Suite', () => {
  it('contains verified thermal fire detections with realistic radiative power and temperatures', () => {
    expect(DETECTED_FIRES.length).toBeGreaterThanOrEqual(20);
    for (const fire of DETECTED_FIRES) {
      expect(fire.lat).toBeGreaterThanOrEqual(-90);
      expect(fire.lat).toBeLessThanOrEqual(90);
      expect(fire.lng).toBeGreaterThanOrEqual(-180);
      expect(fire.lng).toBeLessThanOrEqual(180);
      expect(fire.frp).toBeGreaterThan(0); // Megawatts
      expect(fire.brightnessTempK).toBeGreaterThan(300); // Kelvin
      expect(fire.confidence).toBeGreaterThanOrEqual(80);
      expect(['EXTREME', 'HIGH', 'MODERATE']).toContain(fire.severity);
      expect(['MARITIME_SHIP', 'LAND_FIRE']).toContain(fire.category);
    }
  });

  it('tracks all maritime ship fires in the Strait of Hormuz with vessel details and MMSI/incident types', () => {
    expect(HORMUZ_MARITIME_FIRES.length).toBeGreaterThanOrEqual(8);
    for (const vesselFire of HORMUZ_MARITIME_FIRES) {
      expect(vesselFire.category).toBe('MARITIME_SHIP');
      expect(vesselFire.clusterRegion).toContain('Strait of Hormuz');
      // Lat / Lng bounded by Strait of Hormuz & Gulf of Oman corridor (lat 24.5 to 27.5 N, lng 54.5 to 57.5 E)
      expect(vesselFire.lat).toBeGreaterThanOrEqual(24.5);
      expect(vesselFire.lat).toBeLessThanOrEqual(27.5);
      expect(vesselFire.lng).toBeGreaterThanOrEqual(54.5);
      expect(vesselFire.lng).toBeLessThanOrEqual(57.5);
      // Must have vessel specifics
      expect(vesselFire.vesselDetails).toBeDefined();
      expect(vesselFire.vesselDetails?.vesselName.length).toBeGreaterThan(0);
      expect(vesselFire.vesselDetails?.incidentType.length).toBeGreaterThan(0);
    }
  });

  it('tracks land fires across all Middle East regions with facility types and fuel sources', () => {
    expect(MIDDLE_EAST_LAND_FIRES.length).toBeGreaterThanOrEqual(24);
    const countries = MIDDLE_EAST_LAND_FIRES.map(f => f.countryOrWaterBody);
    
    // Verifies coverage across Middle Eastern states
    expect(countries.some(c => c.includes('Iran'))).toBe(true);
    expect(countries.some(c => c.includes('Iraq'))).toBe(true);
    expect(countries.some(c => c.includes('Syria'))).toBe(true);
    expect(countries.some(c => c.includes('Lebanon'))).toBe(true);
    expect(countries.some(c => c.includes('Kuwait'))).toBe(true);
    expect(countries.some(c => c.includes('Saudi Arabia'))).toBe(true);
    expect(countries.some(c => c.includes('Yemen'))).toBe(true);
    expect(countries.some(c => c.includes('United Arab Emirates'))).toBe(true);
    expect(countries.some(c => c.includes('Oman'))).toBe(true);
    expect(countries.some(c => c.includes('Qatar'))).toBe(true);
    expect(countries.some(c => c.includes('Bahrain'))).toBe(true);
    expect(countries.some(c => c.includes('Egypt'))).toBe(true);
    expect(countries.some(c => c.includes('Jordan'))).toBe(true);

    for (const landFire of MIDDLE_EAST_LAND_FIRES) {
      expect(landFire.category).toBe('LAND_FIRE');
      expect(landFire.landFacilityDetails).toBeDefined();
      expect(landFire.landFacilityDetails?.fuelSource.length).toBeGreaterThan(0);
    }
  });

  it('combines all Strait of Hormuz maritime ship fires and Middle East land fires in ALWAYS-ACTIVE feed', () => {
    expect(ALL_MIDDLE_EAST_AND_HORMUZ_FIRES.length).toBe(
      HORMUZ_MARITIME_FIRES.length + MIDDLE_EAST_LAND_FIRES.length
    );
    expect(ALL_MIDDLE_EAST_AND_HORMUZ_FIRES.length).toBeGreaterThanOrEqual(32);
  });

  it('provides live NASA EOSDIS FIRMS telemetry metadata with active satellite passes', () => {
    const meta = nasaFirmsService.getLiveMetadata(DETECTED_FIRES);
    expect(meta.sourceName).toContain('NASA FIRMS');
    expect(meta.feedStatus).toBe('CONNECTED');
    expect(meta.hormuzMaritimeCount).toBe(HORMUZ_MARITIME_FIRES.length);
    expect(meta.middleEastLandCount).toBe(MIDDLE_EAST_LAND_FIRES.length);
    expect(meta.maxFrpDetectedMw).toBeGreaterThan(800);
    expect(meta.hottestTempK).toBeGreaterThan(500);

    const passes = nasaFirmsService.getSatellitePasses();
    expect(passes.length).toBe(6);
    expect(passes.some(p => p.satellite.includes('NOAA-20'))).toBe(true);
    expect(passes.some(p => p.satellite.includes('NOAA-21'))).toBe(true);
    expect(passes.some(p => p.sensor.includes('MODIS'))).toBe(true);
    expect(passes.some(p => p.satellite.includes('Sentinel-3'))).toBe(true);
  });

  it('contains actionable malware and C2 detections with valid IPs and IOC hashes', () => {
    expect(DETECTED_MALWARE_C2.length).toBeGreaterThanOrEqual(6);
    for (const c2 of DETECTED_MALWARE_C2) {
      expect(c2.c2Ip).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);
      expect(c2.port).toBeGreaterThan(0);
      expect(c2.port).toBeLessThan(65536);
      expect(c2.activeBeacons).toBeGreaterThan(0);
      expect(c2.iocHash).toHaveLength(32);
      expect(c2.countermeasure.length).toBeGreaterThan(10);
    }
  });

  it('computes accurate RF/IP transport parameters for Telstar 11N (-37.5° lon)', () => {
    const london = { lat: 51.5074, lng: -0.1278 };
    const config = getTelstar11NTransportParams(london);

    expect(config.satelliteName).toBe('Telstar 11N');
    expect(config.orbitalSlot).toBe('37.5°W');
    expect(config.longitude).toBe(-37.5);
    expect(config.carrierAllocation.transponderId).toContain('Ku-T11N');
    expect(config.symbolRateAdjustment.nominalMsps).toBe(27.500);
    expect(config.polarizationSkewCalibration.crossPolIsolationDb).toBeGreaterThan(30);
  });
});
