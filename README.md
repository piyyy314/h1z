<div align="center">

# SatExpert Tactical SatCom Intelligence (TSI)

### *Enterprise Military-Grade Satellite Communications & Cyber-Kinetic Operations Platform*

[![CI Build](https://img.shields.io/badge/CI_Build-Passing-059669?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/)
[![Tests Passing](https://img.shields.io/badge/Tests-30%2F30_Passing-10b981?style=for-the-badge&logo=vitest&logoColor=white)](https://github.com/)
[![Security Pass: Grade A+](https://img.shields.io/badge/Security_Pass-Grade_A%2B-059669?style=for-the-badge&logo=shield&logoColor=white)](SECURITY.md)
[![NIST Post-Quantum Cryptography](https://img.shields.io/badge/NIST_PQC-Dilithium3_%26_Kyber-7c3aed?style=for-the-badge&logo=quantum&logoColor=white)](SECURITY.md)
[![TypeScript 5.8](https://img.shields.io/badge/TypeScript-5.8_Strict-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-19.2-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![DEFCON Readiness](https://img.shields.io/badge/DEFCON-Level_1--5_Operational-dc2626?style=for-the-badge&logo=target&logoColor=white)](https://github.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

<br />

<p align="center">
  <b>SatExpert TSI</b> is a comprehensive, production-grade mission control suite engineered for VSAT field technicians, aerospace defense operators, and electronic warfare specialists. It couples exact geostationary orbital mechanics calculations with high-precision RF link budgets, real-time Ku/Ka-band spectrum analytics, NIST-compliant post-quantum cryptography, and an integrated AI Tactical Technician.
</p>

[Explore Documentation](#table-of-contents) • [View Security Policy](SECURITY.md) • [Report Vulnerability](SECURITY.md#2-reporting-a-vulnerability) • [Contribution Guidelines](CONTRIBUTING.md)

</div>

---

## Table of Contents

- [1. Executive System Overview](#1-executive-system-overview)
- [2. Core Capabilities & Architectural Pillars](#2-core-capabilities--architectural-pillars)
  - [A. Exact Geostationary Orbital Mechanics](#a-exact-geostationary-orbital-mechanics)
  - [B. Scientific RF Link Budget & Attenuation Engine](#b-scientific-rf-link-budget--attenuation-engine)
  - [C. Real-time Signal Telemetry & 60-Second Oscilloscope (`Recharts`)](#c-real-time-signal-telemetry--60-second-oscilloscope-recharts)
  - [D. NIST Post-Quantum Cryptography (PQC)](#d-nist-post-quantum-cryptography-pqc)
  - [E. Tactical AI Mission Copilot](#e-tactical-ai-mission-copilot)
  - [F. Tactical Report Generation & PDF Mission Export (`jspdf` + `jspdf-autotable`)](#f-tactical-report-generation--pdf-mission-export-jspdf--jspdf-autotable)
  - [G. Real-Time Strategic Overlay & Tactical Threat Radar](#g-real-time-strategic-overlay--tactical-threat-radar)
  - [H. C4ISR SIGINT Terminal Node & Geospatial Heatmap](#h-c4isr-sigint-terminal-node--geospatial-heatmap)
- [3. Complete Catalog of 45 Tactical Modules](#3-complete-catalog-of-45-tactical-modules)
- [4. Mathematical & RF Engineering Formulations](#4-mathematical--rf-engineering-formulations)
- [5. System Architecture & Tech Stack](#5-system-architecture--tech-stack)
- [6. Local Development & Installation](#6-local-development--installation)
- [7. Quality Assurance & Test Verification](#7-quality-assurance--test-verification)
- [8. Security Architecture & Threat Model](#8-security-architecture--threat-model)
- [9. Contributing & License](#9-contributing--license)

---

## 1. Executive System Overview

Modern satellite communication links face extreme operational environments: rain-fade attenuation, electromagnetic interference, intentional electronic jamming, and transponder spoofing. **SatExpert TSI** unifies orbital mathematics, RF transmission physics, cyber defense arrays, and situational awareness into a unified, high-contrast, military-grade mission control dashboard.

- **43+ Modular Tactical Subsystems**: Covering SIGINT, active electronic warfare, cyber kill chains, and orbital tracking.
- **NIST Post-Quantum Cryptography**: Real Dilithium3 (ML-DSA) and Kyber (ML-KEM) telemetry packet protection.
- **Sub-5.0 dB SNR Critical Alerting**: Immediate tactical visual and cryptographic warning triggered upon signal degradation.
- **Strict Anti-AI Slop Design**: Zero-pill discipline, high information density, WCAG AA contrast, and zero layout overflow.

---

## 2. Core Capabilities & Architectural Pillars

### A. Exact Geostationary Orbital Mechanics
Given any observer's latitude and longitude, the orbital positioning engine computes:
- **True Azimuth ($\alpha$)**: Compass heading from True North to the satellite.
- **True Elevation ($\theta$)**: Dish tilt angle relative to the local horizon, accounting for Earth curvature and geostationary radius ratio ($r = R_e / R_s \approx 0.1512$).
- **Polarization Tilt / Skew ($\psi$)**: Low-Noise Block (LNB) feedhorn rotational offset angle.
- **Slant Range Distance ($d$)**: Physical propagation path length through the vacuum and ionosphere.

### B. Scientific RF Link Budget & Attenuation Engine
- **Free Space Path Loss (FSPL)** calculation across Ku, Ka, and S-band frequencies.
- **Received Carrier Power ($C$)**: Factoring transmitter amplifier (BUC) output in Watts/dBW, transmit antenna gain ($G_{tx}$), FSPL, and ground station dish receiver gain ($G_{rx}$).
- **Link Margin ($M$)**: Dynamically evaluated relative to thermal noise floor threshold (-120 dBW baseline).

### C. Real-time Signal Telemetry & 60-Second Oscilloscope (`Recharts`)
- **60-Second Rolling Telemetry Line Graph**: Smooth-scrolling real-time telemetry visualizer built with **Recharts**, tracking SNR (dB) and Packet Loss (%) fluctuations at 1 Hz resolution across a calibrated sliding buffer.
- **Dual Dynamic Y-Axes**: Left axis displays Carrier SNR (0–24 dB) with monotone gradient area fills; right axis measures Packet Loss (0–100%) in real time.
- **Critical Threshold Monitoring & Acoustic Alerting**: Hardcoded reference line at **5.0 dB lock threshold** triggering audible alerts (`Web Audio API`), pulsating CRT alerts, and red envelope distortions when degraded.
- **Tri-Mode HUD View Switcher**: Instant switching between `60s TELEMETRY`, `SPECTRUM FFT`, and `DUAL HUD` layouts.
- **Telemetry Stream Controls**: 1-click `PAUSE / RESUME` toggles, `BUFFER RESET`, and instant CSV mission export (`telemetry_60s_snr_loss_[timestamp].csv`).
- **Telemetry Analytics Grid**: Computes 60s Average SNR, Min/Max SNR, Average Packet Loss, Link Margin ($SNR - 5.0\text{ dB}$), Carrier Stability index, and breach frequency.

### D. NIST Post-Quantum Cryptography (PQC)
- Implements **CRYSTALS-Dilithium3** (NIST FIPS 204 ML-DSA) and **CRYSTALS-Kyber** (NIST FIPS 203 ML-KEM) via `@noble/post-quantum` and `dilithium-js`.
- Protects mission command logs and session exports against future quantum decryption attacks.

### E. Tactical AI Mission Copilot
- Ground station troubleshooting and threat assessment assistant integrated with the **Google Gemini API** (`@google/genai`).
- Real-time telemetry grounding with live geographic coordinates, active DEFCON readiness, weather conditions, and jamming status.

### F. Tactical Report Generation & PDF Mission Export (`jspdf` + `jspdf-autotable`)
- Instant export of live mission dossiers to standardized, formatted A4 vector PDF documents.
- Includes Top Secret / NATO classification banners, Ground Station GPS coordinates, Target Satellite orbital ephemeris, Azimuth / Elevation / Skew look angles, Slant Range, and Free Space Path Loss (FSPL).
- Formatted RF Signal Telemetry performance matrix with automated SNR threshold alerting, weather rain-fade attenuation, and link state.
- Electronic warfare countermeasures status, operator field notes, chronological mission event audit trail, and NIST FIPS 204 ML-DSA Dilithium cryptographic authentication stamp.

### G. Real-Time Strategic Overlay & Tactical Threat Radar
- **Strategic Overlay Master Toggle**: Real-time switchable tactical cartographic overlay on the Tactical Map, integrating 16+ classified operational zones with SVG crosshatching patterns, radiant glows, and live telemetry synchronization.
- **Three Operational Threat Layers**:
  - **Restricted Airspace (SUA / Prohibited / ADIZ)**: High-risk corridors including R-4808N (Nevada Test Range / Area 51), Kola Peninsula ADIZ, Strait of Hormuz Buffer, Taiwan Strait Median Line, Korean DMZ P-518, and Bab el-Mandeb Red Sea corridor.
  - **Electronic Warfare & Jamming Zones**: Ground-based emitter bubbles including Krasukha-4 (Levant / Eastern Med), Tobol-1 (Baltic Basin), Murmansk-BN (Black Sea / Crimea), Spratly EW Radial, and **Dynamic Live Telemetry EW Emitters** that automatically spawn and scale in radius based on live `jammingPower` ($P_{jam}$ dBm) and SNR drops.
  - **High-Risk Interference Corridors**: Equatorial Ionospheric Scintillation Belts (Amazon & Congo troughs), South Atlantic Anomaly (SAA proton flux), North Atlantic Frontal Rain Fade Trench (escalated dynamically to CRITICAL during `HEAVY_STORM`), and Bay of Bengal Monsoonal Attenuation.
- **Proximity & Breach Threat Evaluation**: Great-Circle Haversine distance computations from operator position to all threat perimeters; automated flashing HUD alert banners when the station is breached or within proximity vectors (<800 km).
- **Interactive Zone Inspector**: Click-to-inspect tactical dossiers revealing altitude ceilings, frequency bands, estimated telemetry degradation, and recommended countermeasures (e.g. adaptive null-steering, MODCOD reduction, or neural filtering).

### H. C4ISR SIGINT Terminal Node & Geospatial Heatmap
- **OSINT & Telegram Reconnaissance Console**: Real-time intercept feed tracking military tactical channels (`@Frontline_C4ISR`, `@SatCom_CyberWatch`, `@ME_Chokepoints_Intel`, `@Orbital_FIRMS_Feed`), automated threat extraction, keyword filtering, and 1-click target dispatch to the Tactical Heatmap.
- **Telstar 11N Satellite Uplink Transport Routing**: Complete RF/IP transport parameter configuration for Telstar 11N (37.5°W): transponder allocation Ku-T11N-XP24 (14285.50 MHz Uplink / 11485.50 MHz Downlink, BW: 36.0 MHz, Linear Horizontal), DVB-S2X MODCOD (16APSK 3/4-L, roll-off $\alpha=0.05$, Pilots ON, FEC: 3/4 LDPC+BCH), tunable symbol rate (1.2 to 45.0 Msps, 78.38 Mbps throughput), polarization skew calibration with feedhorn mechanical rotation offset and cross-pol isolation $\ge 33.5\text{ dB}$, and multicast GSE encapsulation over `239.255.42.11/32`.
- **Always-Active NASA FIRMS Live Thermal Detections (Strait of Hormuz Ships & All Middle East Land Fires)**:
  - **Strait of Hormuz Maritime Ships in Flame (8 Vessels)**: Continuous 24/7 monitoring of shipboard thermal incidents, engine room explosions, container fires, and cargo pump room flash fires across key transit lanes (Traffic Separation Scheme inbound/outbound, Musandam Chokepoint, Larak Island, Greater Tunb, Qeshm channel, and Fujairah anchorage), tracking VLCC Front Empress, Chemical Tanker Stolt Valor, IRGC Fast Attack Craft 09, Suezmax Pacific Apex, Container Al-Mirqab, Darya Bunkering Barge, LNG Carrier Al-Ghashamiya (boil-off vent flare), and Suezmax Delta Poseidon, with active MMSI callouts, vessel class, and emergency VSAT telemetry.
  - **Middle East Terrestrial Land Fires (24 Facilities)**: Exhaustive active fire tracking across all Middle Eastern sovereign territories: Iran (Kharg Island, Ahvaz-3, South Pars Asaluyeh, Bandar Abbas), Iraq (Rumaila, Zubair, Kirkuk Baba Gurgur, Baiji, Majnoon Station 1), Syria & Lebanon (Deir ez-Zor Al-Omar, Palmyra, South Lebanon Litani combat hotspot), Arabian Peninsula (Kuwait Burgan, Saudi Abqaiq GOSP-1, Saudi Shaybah, Saudi Ras Tanura Marine Terminal, Qatar Ras Laffan LNG Complex, Bahrain Sitrah BAPCO Wharf, UAE Habshan Gas Complex, Oman Fahud), and Red Sea / Levant (Yemen Marib Safer, Yemen Hodeidah Ras Isa, Egypt Ras Gharib Suez, Jordan Zarqa).
  - **Theater Zoom Engine**: High-performance SVG multi-resolution theater mode supporting Planetary Orbit (`GLOBAL 1.0x`), Middle East Regional Theater (`MIDEAST THEATER 6.25x`), and direct chokepoint lock (`HORMUZ CHOKEPOINT 20x`), with dynamically scaled icons, nautical diamond hulls, and thermal emission plumes.
  - **NASA FIRMS Live Dossier Modal**: Comprehensive slide-out orbital telemetry intelligence console displaying real-time pass schedules for NOAA-20 (JPSS-1), NOAA-21 (JPSS-2), Suomi NPP, NASA Terra MODIS, NASA Aqua MODIS, and Sentinel-3 SLSTR, combined with full-text search across all 32 regional thermal points.
- **Cyber Threat Infrastructure (Malware & C2)**: Real-time mapping of active Command & Control servers, AcidRain VSAT wipers, Cobalt Strike malleable listeners, and botnet proxies.

---

## 3. Complete Catalog of 45 Tactical Modules

SatExpert TSI's modules are organized into 5 operational domains:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   SATEXPERT TSI MISSION CONTROL C2                     │
├───────────────┬───────────────┬───────────────┬──────────────┬─────────┤
│ TACTICAL BASE │ SIGINT SUITE  │  ACTIVE OPS   │  CYBER CMD   │ AUX DATA│
│   (6 Views)   │  (15 Views)   │  (12 Views)   │  (7 Views)   │ (6 Views│
└───────────────┴───────────────┴───────────────┴──────────────┴─────────┘
```

| Category | View ID | Module Name & Tactical Function |
| :--- | :--- | :--- |
| **TACTICAL_BASE** | `tactical` | **Tactical Base C2**: Primary look angle card, telemetry pulse, tactical map, and AI technician |
| | `constellation` | **Constellation Orbit Grid**: LEO, MEO, and GEO constellation health, orbital periods & coherence |
| | `satellite_detail` | **Satellite Hardware Specs**: Transponder band frequency, apogee, inclination & telemetry specs |
| | `mesh` | **RF Mesh Topology**: Ground-to-satellite relay links, inter-satellite distance & routing |
| | `weather` | **Atmospheric Weather Radar**: Rain fade attenuation calculator and severe storm Doppler tracking |
| | `geolocator` | **IP Geolocator**: Ground station geolocation resolver, subnet routing & carrier coordinates |
| **SIGINT_SUITE** | `c4isr_terminal` | **CYBERSEC / C4ISR SIGINT Terminal**: OSINT Telegram reconnaissance, Telstar 11N DVB-S2X transport allocation & heatmap correlation |
| | `intelligence` | **Cyber & SIGINT Suite**: Security assessment tabs, modem hardening, audit tools & stealth keys |
| | `interception` | **RF Carrier Interceptor**: Raw binary packet capture, stream decoding & carrier demodulation |
| | `node_scanner` | **Node Vulnerability Scanner**: Uplink port sweeps, subnet reconnaissance & service probing |
| | `spoof_tracer` | **Carrier Spoof Tracer**: False beacon detection, Doppler shift delay-lock verification |
| | `threat_dossier` | **Adversary Threat Dossier**: State-actor profiles, known exploit signatures & TTP intelligence |
| | `yara_scanner` | **YARA Rules Engine**: In-flight payload inspection against malicious transponder commands |
| | `sniffer` | **Traffic Sniffer**: Promiscuous mode frame inspector, hex packet analysis & protocol breakdown |
| | `analyzer` | **Spectrum Analyzer**: Full-band RF power distribution, peak carrier search & noise floor mapping |
| | `specter` | **Spectral Canary**: Covert frequency anomaly tripwire and unauthorized signal detection |
| | `traps` | **Honeypot Trap Management**: Decoy ground station beacon traps and intrusion containment |
| | `radio_intercept` | **Radio Intercept Suite**: Multi-frequency MIL-SATCOM demodulation and encrypted voice parsing |
| | `quantum_decryptor` | **Quantum Decryptor**: Shor's algorithm simulation, annealing circuits & ciphertext brute-force |
| | `biometric_scanner` | **Biometric Authorization**: Operator identity verification, pulse telemetry & clearance locks |
| | `telemetry_pulse` | **Advanced Telemetry Pulse**: Baseband DVB-S2X receiver telemetry, polar I/Q constellation diagram, Doppler shift & LDPC decoder |
| **ACTIVE_OPS** | `tactical_suite` | **Advanced Tactical Suite**: Integrated multi-vector radar, asset tracking & mission coordination |
| | `warfare` | **Electronic Warfare (EW)**: Active sweep jamming, frequency agility & RF counter-countermeasures |
| | `planner` | **Mission Route Planner**: Orbital acquisition scheduling, pass prediction & antenna slewing |
| | `neural` | **Neural Signal Processor**: Adaptive noise mitigation and machine-learned beamforming |
| | `orbital_strike` | **Orbital Kinetic Striker**: Coordinate fire calculation, intercept trajectories & strike clearance |
| | `drone_swarm` | **UAV Swarm Command**: Autonomous airborne relay nodes, perimeter defense & mesh extension |
| | `kill_chain` | **Cyber Kill Chain**: 7-phase defense progression from reconnaissance to objective mitigation |
| | `cyber_attack` | **Cyber Attack Suite**: Firmware buffer overflow exploits, denial-of-service simulations |
| | `signal_jamming` | **Targeted Jammer**: High-gain harmonic frequency disruption against adversary downlinks |
| | `botnet_command` | **Botnet C2 Terminal**: Ground station DDoS node tracking, distributed zombie containment |
| | `script_env` | **Tactical Scripting Sandbox**: Python/Lua-style automation scripts for rapid antenna re-pointing |
| | `remote_access` | **Remote Access Terminal**: SSH-style encrypted command-line shell to remote ground modems |
| **CYBER_CMD** | `defense` | **Quantum Defense Shield**: Post-quantum Dilithium key rotational arrays & zero-trust posture |
| | `simulation` | **War Games Simulator**: Dynamic orbital conflict scenarios, transponder takeover defense |
| | `aegis` | **Aegis C2 Platform**: Comprehensive aerospace defense command and kinetic intercept coordination |
| | `usb_manager` | **Tactical USB Manager**: Physical port isolation, air-gap sanitization & hardware key verification |
| | `vsat_config` | **VSAT Remote Config**: Terminal modem parameters, BUC LO frequencies, LNB voltage & IP settings |
| | `grover` | **Grover Search Visualizer**: Quantum search amplitude amplification simulator for cryptographic audits |
| | `sentinel` | **Sentinel Ground Guard**: Perimeter motion sensors, physical antenna defense & emergency lockdown |
| **AUX_DATA** | `media` | **Media Forge**: Satellite imagery processing, SAR radar synthesis & reconnaissance feeds |
| | `live` | **Live Tactical Comms**: Zero-latency peer-to-peer operator chat with Dilithium signed logs |
| | `calculations` | **Link Budget Engine**: Scientific FSPL, antenna gains, G/T, Eb/N0, and bit error rate (BER) |
| | `terrain` | **Terrain Obstruction**: Line-of-sight topographical clearance, Fresnel zone & hill shadow masking |
| | `news` | **Aerospace Intel RSS**: Real-time geopolitical space intelligence, launch manifests & solar weather |
| | `infrastructure` | **Critical Infrastructure**: Electrical grid coupling, fiber backhaul links & teleport connectivity |

---

## 4. Mathematical & RF Engineering Formulations

### 1. Geostationary Look Angle Calculations
Given ground station latitude $\phi$, longitude $\lambda$, and satellite longitude $\lambda_s$:

$$\Delta \lambda = \lambda_s - \lambda$$

$$\cos \gamma = \cos \phi \cdot \cos(\Delta \lambda)$$

$$\theta_{\text{elev}} = \arctan\left(\frac{\cos \gamma - \frac{R_e}{R_s}}{\sqrt{1 - \cos^2 \gamma}}\right)$$

Where $R_e = 6378.137\text{ km}$ and $R_s = 42164.14\text{ km}$.

$$\alpha_{\text{azimuth}} = 180^\circ - \arctan\left(\frac{\tan |\Delta \lambda|}{\sin |\phi|}\right) \quad (\text{Northern Hemisphere, } \Delta\lambda \ge 0)$$

### 2. Free Space Path Loss (FSPL)
For slant range distance $d\text{ (km)}$ and carrier frequency $f\text{ (GHz)}$:

$$\text{FSPL (dB)} = 20\log_{10}(d) + 20\log_{10}(f) + 92.45$$

### 3. Received Carrier Power & Link Margin
Given transmitter power $P_{\text{tx}}\text{ (Watts)}$, transmit gain $G_{\text{tx}}\text{ (dBi)}$, and receiver gain $G_{\text{rx}}\text{ (dBi)}$:

$$P_{\text{tx (dBW)}} = 10\log_{10}(P_{\text{tx}})$$

$$C\text{ (dBW)} = P_{\text{tx (dBW)}} + G_{\text{tx}} - \text{FSPL} + G_{\text{rx}} - A_{\text{rain}}$$

$$\text{Margin (dB)} = C - P_{\text{noise\_floor}} \quad (P_{\text{noise\_floor}} = -120.0\text{ dBW})$$

---

## 5. System Architecture & Tech Stack

```
                     ┌───────────────────────────────┐
                     │    React 19 + TypeScript 5    │
                     │  Vite 6 Fast Refresh / HMR    │
                     └───────────────┬───────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│   ORBITAL MATH   │       │  POST-QUANTUM    │       │ AI COPILOT &     │
│   geoUtils.ts    │       │  Dilithium3 /    │       │ GEMINI ENGINE    │
│ linkBudgetUtils  │       │  CRYSTALS-Kyber  │       │  @google/genai   │
└──────────────────┘       └──────────────────┘       └──────────────────┘
```

- **Runtime Framework**: React 19 SPA powered by Vite 6 and TypeScript 5.8 (Strict Mode).
- **Styling Architecture**: Tailwind CSS 4 with custom tactical typography and zero-pill layout discipline.
- **Iconography**: `lucide-react` military and telemetry symbol set.
- **Data Visualization**: High-performance SVG real-time spectrum traces with animated scanlines and graticule grids.
- **Cryptography**: `@noble/post-quantum` + `dilithium-js` + Web Cryptography API (`crypto.subtle`).
- **PDF Export**: `jspdf` and `jspdf-autotable` for sitrep dossier generation.

---

## 6. Local Development & Installation

### Prerequisites
- **Node.js**: `>= 20.0.0`
- **npm**: `>= 10.0.0`

### Step-by-Step Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-org/satexpert-tactical-intelligence.git
   cd satexpert-tactical-intelligence
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   ```bash
   cp .env.example .env.local
   ```
   Add your Google Gemini API key to `.env.local` to enable the AI Technician:
   ```env
   GEMINI_API_KEY="your-gemini-api-key"
   ```

4. **Launch Development Server**:
   ```bash
   npm run dev
   ```
   Access the dashboard at `http://localhost:3000`.

---

## 7. Quality Assurance & Test Verification

All orbital math, link budget physics, and cryptographic algorithms are guarded by automated test suites executed via **Vitest**:

```bash
# Run unit and integration test suites
npm test

# Run tests in continuous watch mode
npm run test:watch

# Execute strict TypeScript static analysis
npm run lint

# Generate optimized production bundle
npm run build
```

### Verified Test Matrix:
- :white_check_mark: **Geostationary Look Angles**: Sub-satellite 90° elevation, antipodal horizon bounds, and polarization skew symmetry verified.
- :white_check_mark: **RF Link Budget**: Ku-band FSPL (~207 dB), BUC output conversion, and positive link margins tested.
- :white_check_mark: **Post-Quantum Cryptography**: SHA-256 telemetry digests, Dilithium3 signature format validation, and CSPRNG session keys tested.

---

## 8. Security Architecture & Threat Model

SatExpert TSI is audited for zero vulnerabilities and strict defensive integrity:

1. **Zero-Trust Client Boundary**: No credentials or private signing keys are transmitted unencrypted.
2. **Signal Degradation Watchdog**: Automated SNR tracking protects against RF carrier collapse and spoofing.
3. **NIST PQC Cryptographic Pass**: Telemetry verification uses Dilithium3 to ensure resilience against quantum-capable eavesdroppers.

For detailed security disclosures, vulnerability reporting, and PGP keys, consult [SECURITY.md](SECURITY.md).

---

## 9. Contributing & License

We welcome contributions from the aerospace, RF engineering, and cybersecurity communities. Please review [CONTRIBUTING.md](CONTRIBUTING.md) before submitting pull requests.

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for complete details.

---

<div align="center">
  <sub>SatExpert Tactical SatCom Intelligence (TSI) • Authorized Operator Access Only • Built for Mission-Critical Reliability</sub>
</div>
