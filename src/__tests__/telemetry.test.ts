import { describe, it, expect } from 'vitest';
import { calculateFspl, calculateReceivedPower, calculateLinkMargin } from '../utils/linkBudgetUtils.ts';

describe('Satellite Link Budget & RF Calculations', () => {
  it('calculates Free Space Path Loss (FSPL) correctly for standard Ku-band (14.25 GHz)', () => {
    const distanceKm = 38000; // typical GEO slant range
    const freqGhz = 14.25; // standard Ku uplink
    const fspl = calculateFspl(distanceKm, freqGhz);

    // Standard expected Ku-band FSPL is ~207 dB
    expect(fspl).toBeGreaterThan(200);
    expect(fspl).toBeLessThan(215);
  });

  it('calculates received power with amplifier and dish gains', () => {
    const bucPowerWatts = 40; // ~16 dBW
    const txGainDbi = 42.0;
    const rxGainDbi = 38.5;
    const fsplDb = 207.0;

    const rxPower = calculateReceivedPower({
      bucPowerWatts,
      txGainDbi,
      rxGainDbi,
      fsplDb
    });

    // Expecting rx power around -110 dBW
    expect(rxPower).toBeLessThan(-100);
    expect(rxPower).toBeGreaterThan(-125);
  });

  it('correctly calculates link margin relative to noise floor', () => {
    const rxPower = -110.5;
    const noiseFloor = -120.0;
    const margin = calculateLinkMargin(rxPower, noiseFloor);

    expect(margin).toBeCloseTo(9.5, 1);
    expect(margin).toBeGreaterThan(0); // Positive link margin denotes closed link
  });

  it('handles zero or negative boundary inputs gracefully', () => {
    expect(calculateFspl(0, 14)).toBe(0);
    expect(calculateFspl(38000, 0)).toBe(0);
  });
});
