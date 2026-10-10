import { describe, it, expect } from 'vitest';
import { generateTacticalReport, calculateFSPL, formatCoordinates } from '../utils/tacticalReportGenerator.ts';
import { Satellite, Coordinates, LookAngles } from '../types.ts';

describe('Tactical Report Generator', () => {
  const dummySat: Satellite = {
    id: 'test-sat-1',
    name: 'MILSTAR-4-C2',
    longitude: 13.0,
    orbitalSlot: '13.0°E',
    operator: 'DoD / NATO Tactical SatCom',
    apogee: 35790,
    perigee: 35780,
    inclination: 0.05
  };

  const dummyCoords: Coordinates = { lat: 51.5074, lng: -0.1278 };

  const dummyLookAngles: LookAngles = {
    azimuth: 156.42,
    elevation: 29.85,
    skew: 9.31,
    distance: 38750
  };

  it('correctly calculates Free Space Path Loss (FSPL)', () => {
    const fspl = calculateFSPL(38750, 12.0); // 38,750 km at 12 GHz Ku-band
    expect(fspl).toBeGreaterThan(200);
    expect(fspl).toBeLessThan(215);
  });

  it('correctly formats military coordinates with cardinal directions', () => {
    const formatted = formatCoordinates(dummyCoords);
    expect(formatted).toBe('51.5074°N, 0.1278°W');

    const southEast = formatCoordinates({ lat: -33.8688, lng: 151.2093 });
    expect(southEast).toBe('33.8688°S, 151.2093°E');
  });

  it('generates a valid jsPDF document without errors', () => {
    const doc = generateTacticalReport({
      defcon: 2,
      isStealthMode: false,
      isJamming: true,
      jammingPower: 75,
      weather: 'CLEAR',
      operatorName: 'CALLSIGN-GHOST-9',
      stationCoordinates: dummyCoords,
      selectedSatellite: dummySat,
      lookAngles: dummyLookAngles,
      telemetry: {
        snr: '14.25',
        rxPower: '-43.0',
        bucTemp: '46.5',
        packetLoss: '0.00',
        status: 'NOMINAL'
      },
      activeView: 'tactical',
      eventLogs: [
        {
          id: 'evt-1',
          timestamp: '14:32:00',
          satName: dummySat.name,
          satId: dummySat.id,
          status: 'CRITICAL',
          detail: 'ECM Jamming pulse detected on Ku downlink'
        }
      ],
      notes: 'Test mission assessment under active electronic countermeasures.'
    });

    expect(doc).toBeDefined();
    // Validate page count is at least 1
    const pageCount = (doc.internal as any).getNumberOfPages ? (doc.internal as any).getNumberOfPages() : 1;
    expect(pageCount).toBeGreaterThanOrEqual(1);

    // Validate that output as arrayBuffer or blob is generated
    const arrayBuffer = doc.output('arraybuffer');
    expect(arrayBuffer.byteLength).toBeGreaterThan(1000);
  });
});
