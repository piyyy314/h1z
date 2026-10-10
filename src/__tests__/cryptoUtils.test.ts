import { describe, it, expect } from 'vitest';
import { computeTelemetryDigest, validatePqcSignatureFormat, generateTacticalSessionKey } from '../utils/cryptoUtils.ts';

describe('Post-Quantum Cryptography & Tactical Security Utilities', () => {
  it('computes consistent SHA-256 telemetry digest', async () => {
    const payload = 'VSAT_TELEMETRY_PACKET_ID_9901_FREQ_14.25GHZ';
    const digest1 = await computeTelemetryDigest(payload);
    const digest2 = await computeTelemetryDigest(payload);

    expect(digest1).toBe(digest2);
    expect(digest1.length).toBeGreaterThanOrEqual(8);
  });

  it('validates PQC signature formats accurately', () => {
    // Valid 64-char hex
    const validSig = 'a'.repeat(64);
    expect(validatePqcSignatureFormat(validSig)).toBe(true);

    // Invalid non-hex characters
    const invalidSig = 'z'.repeat(64);
    expect(validatePqcSignatureFormat(invalidSig)).toBe(false);

    // Too short
    expect(validatePqcSignatureFormat('abc123')).toBe(false);
  });

  it('generates tactical session keys with proper format', () => {
    const key = generateTacticalSessionKey('DEFCON-1');
    expect(key.startsWith('DEFCON-1-')).toBe(true);
    expect(key.length).toBeGreaterThan(24);
  });
});
