import { describe, it, expect } from 'vitest';

export function computeTelemetryStats(data: { snr: number; packetLoss: number }[]) {
  if (data.length === 0) {
    return {
      avgSnr: 0,
      minSnr: 0,
      maxSnr: 0,
      avgLoss: 0,
      maxLoss: 0,
      linkMargin: 0,
      stabilityPct: 0,
      breachCount: 0
    };
  }

  const snrs = data.map(d => d.snr);
  const losses = data.map(d => d.packetLoss);

  const avgSnr = parseFloat((snrs.reduce((a, b) => a + b, 0) / snrs.length).toFixed(2));
  const minSnr = parseFloat(Math.min(...snrs).toFixed(2));
  const maxSnr = parseFloat(Math.max(...snrs).toFixed(2));

  const avgLoss = parseFloat((losses.reduce((a, b) => a + b, 0) / losses.length).toFixed(2));
  const maxLoss = parseFloat(Math.max(...losses).toFixed(2));

  const latest = data[data.length - 1];
  const linkMargin = parseFloat((latest.snr - 5.0).toFixed(2));
  const breachCount = data.filter(d => d.snr < 5.0).length;
  const nominalCount = data.filter(d => d.snr >= 10.0).length;
  const stabilityPct = parseFloat(((nominalCount / data.length) * 100).toFixed(1));

  return {
    avgSnr,
    minSnr,
    maxSnr,
    avgLoss,
    maxLoss,
    linkMargin,
    stabilityPct,
    breachCount
  };
}

export function classifyLinkStatus(snr: number): 'NOMINAL' | 'DEGRADED' | 'CRITICAL' {
  if (snr < 5.0) return 'CRITICAL';
  if (snr < 10.0) return 'DEGRADED';
  return 'NOMINAL';
}

describe('Signal Telemetry & 60-Second Rolling Window Suite', () => {
  it('correctly classifies link status based on SNR thresholds', () => {
    expect(classifyLinkStatus(16.5)).toBe('NOMINAL');
    expect(classifyLinkStatus(10.0)).toBe('NOMINAL');
    expect(classifyLinkStatus(9.9)).toBe('DEGRADED');
    expect(classifyLinkStatus(5.0)).toBe('DEGRADED');
    expect(classifyLinkStatus(4.9)).toBe('CRITICAL');
    expect(classifyLinkStatus(1.2)).toBe('CRITICAL');
  });

  it('accurately computes 60-second window summary statistics', () => {
    const mock60sData = Array.from({ length: 60 }, (_, i) => ({
      snr: 15.0 + Math.sin(i / 10) * 2, // ranges roughly 13.0 to 17.0
      packetLoss: (i % 5 === 0) ? 0.2 : 0.0
    }));

    const stats = computeTelemetryStats(mock60sData);
    expect(mock60sData.length).toBe(60);
    expect(stats.avgSnr).toBeGreaterThan(13);
    expect(stats.avgSnr).toBeLessThan(17);
    expect(stats.minSnr).toBeGreaterThan(12);
    expect(stats.maxSnr).toBeLessThan(18);
    expect(stats.maxLoss).toBeCloseTo(0.2, 1);
    expect(stats.linkMargin).toBeGreaterThan(5.0); // > 5.0 dB margin
    expect(stats.stabilityPct).toBe(100); // all samples >= 10 dB
    expect(stats.breachCount).toBe(0);
  });

  it('detects critical breaches and negative link margins during jamming or severe fade', () => {
    const degradedData = Array.from({ length: 60 }, (_, i) => ({
      snr: i < 30 ? 12.0 : 3.5, // 30 nominal, 30 critical (< 5.0 dB)
      packetLoss: i < 30 ? 0.05 : 18.5
    }));

    const stats = computeTelemetryStats(degradedData);
    expect(stats.breachCount).toBe(30);
    expect(stats.linkMargin).toBeCloseTo(-1.5, 1); // 3.5 - 5.0 = -1.5 dB
    expect(stats.stabilityPct).toBe(50); // half >= 10.0 dB
    expect(stats.maxLoss).toBeCloseTo(18.5, 1);
  });
});
