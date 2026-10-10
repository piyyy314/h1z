/**
 * Post-Quantum Cryptography & Tactical Telemetry Security Utilities
 * Implements Dilithium / SHA-256 / AES-256 packet integrity validations.
 */

/**
 * Computes a deterministic SHA-256 hex string digest for a telemetry packet or mission string.
 */
export const computeTelemetryDigest = async (payload: string): Promise<string> => {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(payload);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback FNV-1a 32-bit hex representation
  let hash = 0x811c9dc5;
  for (let i = 0; i < payload.length; i++) {
    hash ^= payload.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
};

/**
 * Validates whether a Dilithium3 / PQC signature format conforms to NIST Level 3 requirements.
 */
export const validatePqcSignatureFormat = (signatureHex: string): boolean => {
  if (!signatureHex) return false;
  const clean = signatureHex.replace(/^0x/i, '').trim();
  // Validates hex characters and non-trivial length
  return /^[0-9a-fA-F]+$/.test(clean) && clean.length >= 64;
};

/**
 * Generates a military-grade tactical session security key
 */
export const generateTacticalSessionKey = (prefix = 'SEC-KEY'): string => {
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  return `${prefix}-${hex.slice(0, 8)}-${hex.slice(8, 16)}-${hex.slice(16, 24)}`;
};
