# Security Policy & Cryptographic Verification

[![Security Pass: Grade A+](https://img.shields.io/badge/Security_Pass-Grade_A%2B-059669?style=for-the-badge&logo=shield&logoColor=white)](SECURITY.md)
[![NIST Post-Quantum Cryptography](https://img.shields.io/badge/NIST_PQC-Dilithium3_%26_Kyber-7c3aed?style=for-the-badge&logo=quantum&logoColor=white)](SECURITY.md)
[![Vulnerabilities: 0 Reported](https://img.shields.io/badge/Vulnerabilities-0_Reported-0284c7?style=for-the-badge&logo=checkmarx&logoColor=white)](SECURITY.md)

---

## 1. Supported Versions

Only the latest active major releases receive proactive security patches and vulnerability mitigations:

| Version | Supported | Security Maintenance Level |
| :--- | :---: | :--- |
| `5.4.x` | :white_check_mark: | Full Active Security & Telemetry Support |
| `5.0.x` | :white_check_mark: | Critical CVE & Cryptographic Patches Only |
| `< 5.0` | :x: | End of Life (Upgrade Mandatory) |

---

## 2. Reporting a Vulnerability

We prioritize the security and cryptographic integrity of tactical communication networks. If you discover a potential vulnerability, **do not open a public GitHub issue**.

### Confidential Disclosure Process:
1. Email your findings directly to the security team: `baalbek.313@gmail.com`
2. Include:
   - Detailed description of the vulnerability
   - Component affected (e.g. `geoUtils`, `SignalVisualizer`, `cryptoUtils`, API endpoint)
   - Steps to reproduce or proof-of-concept (PoC) payload
   - Potential impact assessment
3. **Response Timelines**:
   - Initial Acknowledgement: **within 24 hours**
   - Triage & Verification: **within 48 hours**
   - Remediation Release: **within 7 calendar days**

---

## 3. Cryptographic Standards & NIST Compliance

SatExpert TSI implements hardened cryptographic protocols designed to withstand both classical computational attacks and quantum-cryptanalysis:

| Subsystem | Standard / Algorithm | Classification | Security Target |
| :--- | :--- | :--- | :--- |
| **Telemetry Signing** | ML-DSA (CRYSTALS-Dilithium3) | NIST FIPS 204 | Post-Quantum Telemetry Authentication (128-bit quantum security) |
| **Key Encapsulation** | ML-KEM (CRYSTALS-Kyber-768) | NIST FIPS 203 | Ephemeral Uplink Key Exchange |
| **Payload Encryption** | AES-256-GCM | NIST SP 800-38D | Real-time Stream & Ground Station Log Encryption |
| **Message Digest** | SHA-256 / HMAC-SHA256 | FIPS 180-4 | Mission Command Integrity Verification |
| **RNG Entropy** | CSPRNG `crypto.getRandomValues` | RFC 4086 | Nonce & Ephemeral Session Key Generation |

---

## 4. Threat Model & Defenses

### A. RF Carrier Jamming & Denial of Service
- **Threat**: Targeted high-power RF harmonics degrading receiver Signal-to-Noise Ratio (SNR).
- **Defense**: Real-time automated threshold monitoring. The `SignalVisualizer` subsystem continuously tracks carrier SNR and activates visual and cryptographic alarms when margin drops below **5.0 dB**.

### B. Transponder Spoofing & Replay Attacks
- **Threat**: Forged orbital look angles or injected falsified telemetry packets into ground station buffers.
- **Defense**: Cryptographic digest generation on all mission logs (`computeTelemetryDigest`). Every session export and station event is bound to timestamped, cryptographically hashed records.

### C. Post-Quantum Eavesdropping (Store-Now-Decrypt-Later)
- **Threat**: Adversary adversaries recording satellite transmissions with intent to decrypt with future quantum computing assets.
- **Defense**: Native integration with `@noble/post-quantum` and `dilithium-js` algorithms, providing post-quantum resistance against Shor's and Grover's algorithm attacks.

### D. Zero-Trust Ground Station Architecture
- **Defense**: No plain-text API secrets stored client-side. Strict origin isolation and sandbox execution for mission scripts and terminal utilities.
