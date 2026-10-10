import { Coordinates } from '../types.ts';

export type StrategicZoneType = 'restricted_airspace' | 'jamming_zone' | 'interference_area';
export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'ADVISORY';

export interface StrategicZone {
  id: string;
  name: string;
  designator: string;
  type: StrategicZoneType;
  center: Coordinates;
  radiusDeg: number;
  severity: SeverityLevel;
  altitudeBand?: string;
  frequencyBand?: string;
  description: string;
  telemetryImpact: string;
  recommendedAction: string;
  isDynamic?: boolean;
}

export interface TelemetryState {
  snr: string;
  rxPower: string;
  bucTemp: string;
  packetLoss: string;
  status: string;
}

export interface ThreatEvaluation {
  insideZones: StrategicZone[];
  closestZone: StrategicZone | null;
  closestDistanceKm: number;
  closestDistanceDeg: number;
  overallThreatLevel: SeverityLevel | 'NOMINAL';
  advisoryText: string;
}

/**
 * Calculates Great-Circle distance in kilometers between two lat/lng coordinates (Haversine formula).
 */
export function calculateDistanceKm(loc1: Coordinates, loc2: Coordinates): number {
  const R = 6371; // Earth mean radius in km
  const dLat = ((loc2.lat - loc1.lat) * Math.PI) / 180;
  const dLng = ((loc2.lng - loc1.lng) * Math.PI) / 180;
  const lat1Rad = (loc1.lat * Math.PI) / 180;
  const lat2Rad = (loc2.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Calculates Euclidean angular distance in degrees.
 */
export function calculateDistanceDeg(loc1: Coordinates, loc2: Coordinates): number {
  const dLat = loc2.lat - loc1.lat;
  let dLng = loc2.lng - loc1.lng;
  // Handle longitude wrap-around
  if (dLng > 180) dLng -= 360;
  if (dLng < -180) dLng += 360;
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

/**
 * Converts geographical coordinates into flat SVG equirectangular coordinates [0-100, 0-50].
 */
export function convertCoordsToSvg(coords: Coordinates): { x: number; y: number } {
  const x = ((coords.lng + 180) / 360) * 100;
  const y = ((90 - coords.lat) / 180) * 50;
  return { x, y };
}

/**
 * Static tactical zones catalog: Restricted Airspaces, Persistent Jamming Corridors,
 * and Known High-Risk Interference Areas.
 */
export const STATIC_STRATEGIC_ZONES: StrategicZone[] = [
  // 1. Restricted Airspaces
  {
    id: 'zone-r4808n',
    name: 'Nevada Test Range / Area 51 Complex',
    designator: 'R-4808N / P-40',
    type: 'restricted_airspace',
    center: { lat: 37.24, lng: -115.81 },
    radiusDeg: 3.8,
    severity: 'CRITICAL',
    altitudeBand: 'SFC - UNLIMITED',
    frequencyBand: 'Broadband RF & Radar Countermeasures',
    description: 'Special Access Program exclusion zone with active RF stealth testing and automated radar interlocks.',
    telemetryImpact: 'Severe downlink frequency masking & carrier hop desynchronization.',
    recommendedAction: 'Steer main lobe outside test radial. Engage frequency spread-spectrum mode.'
  },
  {
    id: 'zone-kola',
    name: 'Kola Peninsula Strategic Exclusion Airspace',
    designator: 'RU-NORTH ADIZ',
    type: 'restricted_airspace',
    center: { lat: 68.9, lng: 33.1 },
    radiusDeg: 5.2,
    severity: 'HIGH',
    altitudeBand: 'FL100 - FL650',
    frequencyBand: 'Over-The-Horizon (OTH) Radar & Early Warning',
    description: 'High-latitude military maritime defense perimeter with high-power Voronezh-DM and resonance radar arrays.',
    telemetryImpact: 'Harmonic spurs in Ku/Ka baseband demodulators, SNR drops of 3 to 6 dB.',
    recommendedAction: 'Engage Ku-Band notch filtering and increase ground station elevation angle.'
  },
  {
    id: 'zone-hormuz',
    name: 'Strait of Hormuz Naval Defense Buffer',
    designator: 'HORMUZ-SUA / A-0492',
    type: 'restricted_airspace',
    center: { lat: 26.5, lng: 56.2 },
    radiusDeg: 4.2,
    severity: 'CRITICAL',
    altitudeBand: 'SFC - FL450',
    frequencyBand: 'Surface-to-Air Guidance & L-Band GNSS Jamming',
    description: 'Chokepoint naval missile defense envelope with persistent surface-to-air tracking radars and GPS deception.',
    telemetryImpact: 'Carrier drift, high packet jitter, elevation look angles subject to multipath.',
    recommendedAction: 'Switch to optical/gyro tracking lock; verify ephemeris coordinates independently.'
  },
  {
    id: 'zone-taiwan',
    name: 'Taiwan Strait Defense Air Identification Zone',
    designator: 'ROC-ADIZ / MEDIAN-ALPHA',
    type: 'restricted_airspace',
    center: { lat: 24.5, lng: 119.8 },
    radiusDeg: 4.0,
    severity: 'HIGH',
    altitudeBand: 'SFC - UNLIMITED',
    frequencyBand: 'Combat Air Patrol Active Radar Arrays',
    description: 'Contested maritime airspace corridor subject to electronic combat identification and high-pulse density.',
    telemetryImpact: 'Sporadic burst interference and FEC frame error rate spikes.',
    recommendedAction: 'Lower DVB-S2X MODCOD to QPSK 1/2 for maximum forward error correction resilience.'
  },
  {
    id: 'zone-dmz',
    name: 'Korean Demilitarized Zone Air Buffer',
    designator: 'P-518 / NFL CORRIDOR',
    type: 'restricted_airspace',
    center: { lat: 38.3, lng: 127.1 },
    radiusDeg: 3.0,
    severity: 'CRITICAL',
    altitudeBand: 'SFC - FL500',
    frequencyBand: 'Anti-Aircraft Radar & Heavy VHF/UHF Jamming',
    description: 'Militarized buffer corridor fortified with multi-spectral electronic surveillance and kinetic air defense.',
    telemetryImpact: 'Intermittent signal wipeout on low elevation satellites (<15°).',
    recommendedAction: 'Prioritize geostationary orbital slots with >35° elevation angles.'
  },
  {
    id: 'zone-bab-el-mandeb',
    name: 'Bab el-Mandeb Maritime Air Defense Sector',
    designator: 'MARITIME-EXCLUSION RED SEA',
    type: 'restricted_airspace',
    center: { lat: 12.8, lng: 43.3 },
    radiusDeg: 3.6,
    severity: 'HIGH',
    altitudeBand: 'SFC - FL300',
    frequencyBand: 'Tactical Drone C2 & Anti-Ship Guidance Radars',
    description: 'Southern Red Sea security corridor with active electronic warfare and counter-UAS frequency denial emitters.',
    telemetryImpact: 'Packet loss escalation (+4% to +10%) and LNB front-end saturation.',
    recommendedAction: 'Activate Low-Noise Block (LNB) attenuator and switch to circular polarization.'
  },

  // 2. Jamming Zones (Persistent Known EW Platforms)
  {
    id: 'zone-levant',
    name: 'Eastern Mediterranean & Levant GNSS Spoofing Bubble',
    designator: 'EW-MED-09 / KRASUKHA',
    type: 'jamming_zone',
    center: { lat: 34.8, lng: 35.5 },
    radiusDeg: 4.8,
    severity: 'HIGH',
    frequencyBand: 'GPS L1/L2 (1575.42 MHz) & Ku Uplink (14 GHz)',
    description: 'Concentrated ground-based EW emitters generating false GNSS pseudo-ranges and uplink transponder noise floors.',
    telemetryImpact: 'Carrier-to-Noise degradation up to -7.5 dB, synthetic GPS offset injection.',
    recommendedAction: 'Disable automated GPS location lock. Use manual coordinate calibration.'
  },
  {
    id: 'zone-baltic',
    name: 'Baltic Sea / Kaliningrad Electronic Warfare Basin',
    designator: 'TOBOL-1 COMPLEX / BALTIC EW',
    type: 'jamming_zone',
    center: { lat: 54.8, lng: 20.2 },
    radiusDeg: 4.5,
    severity: 'HIGH',
    frequencyBand: 'L/S/Ku-Band Broadband Denial',
    description: 'State-level electronic warfare node executing continuous GNSS denial and commercial satellite uplink suppression.',
    telemetryImpact: 'Transponder inter-modulation distortion and sudden carrier signal fades.',
    recommendedAction: 'Deploy spatial adaptive null-steering array. Increase ground BUC transmission power.'
  },
  {
    id: 'zone-blacksea',
    name: 'Black Sea / Crimean Transponder Denial Complex',
    designator: 'MURMANSK-BN / CRIMEA EW',
    type: 'jamming_zone',
    center: { lat: 44.5, lng: 34.0 },
    radiusDeg: 4.2,
    severity: 'HIGH',
    frequencyBand: 'HF/SHF Tactical Uplink Disruption',
    description: 'High-power strategic EW arrays targeting military satcom channels and maritime communication backbones.',
    telemetryImpact: 'High packet loss (up to 18%), severe carrier harmonic distortion.',
    recommendedAction: 'Re-route traffic via military X-band transponder or EHF protected cross-links.'
  },
  {
    id: 'zone-southchinasea',
    name: 'South China Sea Maritime EW Radial',
    designator: 'SPRATLY-EW RADIAL 04',
    type: 'jamming_zone',
    center: { lat: 10.2, lng: 114.5 },
    radiusDeg: 5.0,
    severity: 'ELEVATED',
    frequencyBand: 'C/Ku Band Maritime Tracking Denial',
    description: 'Reef-based surveillance platforms and electronic countermeasure transmitters monitoring navigation corridors.',
    telemetryImpact: 'Intermittent carrier lock losses during naval radar sweeping cycles.',
    recommendedAction: 'Engage carrier phase tracking loop (PLL) with narrow loop bandwidth.'
  },

  // 3. Known High-Risk Interference Areas (Scintillation, Storms, Space Weather)
  {
    id: 'zone-scint-amazon',
    name: 'Equatorial Scintillation Belt (Amazon Sector)',
    designator: 'IONO-ANOMALY AMAZONAS',
    type: 'interference_area',
    center: { lat: -3.0, lng: -60.0 },
    radiusDeg: 7.5,
    severity: 'HIGH',
    frequencyBand: 'L/C/Ku-Band Ionospheric Scintillation',
    description: 'Post-sunset Rayleigh-Taylor plasma instability causing rapid electron density depletion and severe phase scintillation.',
    telemetryImpact: 'Deep signal fades (>10 dB) lasting 10-30 seconds, cycle slips in carrier tracking.',
    recommendedAction: 'Activate dual-frequency carrier diversity to mitigate amplitude fading.'
  },
  {
    id: 'zone-scint-africa',
    name: 'Central Africa Equatorial Plasma Trench',
    designator: 'IONO-CONGO TROUGH',
    type: 'interference_area',
    center: { lat: 4.0, lng: 22.0 },
    radiusDeg: 7.0,
    severity: 'ELEVATED',
    frequencyBand: 'Ku-Band High-Order MODCOD Phase De-lock',
    description: 'Deep geomagnetic anomaly belt with frequent trans-ionospheric phase rapid jitter and depolarization.',
    telemetryImpact: 'High packet jitter and bit-error-rate (BER) spikes during nocturnal peak hours.',
    recommendedAction: 'Increase interleaver depth and reduce modulation constellation density.'
  },
  {
    id: 'zone-saa',
    name: 'South Atlantic Radiation Anomaly (SAA)',
    designator: 'SAA-VAN ALLEN DIP',
    type: 'interference_area',
    center: { lat: -26.0, lng: -46.0 },
    radiusDeg: 8.5,
    severity: 'HIGH',
    frequencyBand: 'Space Weather Proton / Electron Flux',
    description: 'Significant dip in Earth’s magnetic field exposing low-orbit satellites and transponder electronics to high-energy particles.',
    telemetryImpact: 'Single-event latchups (SEU) in transponder controllers, bit flips in telemetry downlink.',
    recommendedAction: 'Enable Reed-Solomon telemetry parity scrubbing and telemetry redundancy.'
  },
  {
    id: 'zone-storm-natlantic',
    name: 'North Atlantic Deep Frontal Rain Fade Trench',
    designator: 'TROPO-RAIN ATLANTIC NORTH',
    type: 'interference_area',
    center: { lat: 51.0, lng: -35.0 },
    radiusDeg: 7.5,
    severity: 'ELEVATED',
    frequencyBand: 'Ku/Ka-Band Atmospheric Hydrometeor Absorption',
    description: 'Persistent mid-latitude oceanic frontal cyclones with massive vertical cloud columns causing hydrometeor attenuation.',
    telemetryImpact: 'Heavy atmospheric rain fade (-5 to -14 dB), extreme packet loss during storms.',
    recommendedAction: 'Activate Uplink Power Control (AUPC) and enable Adaptive Coding & Modulation (ACM).'
  },
  {
    id: 'zone-bengal-monsoon',
    name: 'Bay of Bengal Monsoonal Attenuation Hub',
    designator: 'MONSOON-TROUGH BENGAL',
    type: 'interference_area',
    center: { lat: 16.5, lng: 88.5 },
    radiusDeg: 6.0,
    severity: 'ELEVATED',
    frequencyBand: 'Ku-Band Convective Precipitation Absorption',
    description: 'Severe seasonal tropical storm cells creating localized water-vapor vapor absorption and cross-polarization.',
    telemetryImpact: 'Polarization cross-talk degradation and carrier-to-interference ratio drops.',
    recommendedAction: 'Recalibrate ground feedhorn polarization skew angle; elevate uplink gain.'
  }
];

/**
 * Generates the full tactical zones list, dynamically synthesizing live jamming emitters
 * and reactive weather/interference corridors based on current telemetry.
 */
export function buildLiveStrategicZones(
  userLoc: Coordinates,
  telemetry?: TelemetryState,
  isJamming?: boolean,
  jammingPower: number = 20,
  weather?: string
): StrategicZone[] {
  const zones: StrategicZone[] = [...STATIC_STRATEGIC_ZONES];

  // If live telemetry reports active jamming, synthesize a real-time EW emitter centered on the operator's radial
  if (isJamming) {
    const dynamicRadius = Math.min(10, Math.max(3.2, 2.5 + jammingPower * 0.08));
    zones.unshift({
      id: 'dynamic-live-jamming',
      name: `ACTIVE EW CARRIER DENIAL [${jammingPower} dBm]`,
      designator: `LIVE-EW INTERCEPTOR`,
      type: 'jamming_zone',
      center: {
        lat: Math.max(-85, Math.min(85, userLoc.lat + 1.2)),
        lng: Math.max(-175, Math.min(175, userLoc.lng + 1.8))
      },
      radiusDeg: dynamicRadius,
      severity: 'CRITICAL',
      frequencyBand: `Targeted SatCom Uplink / BUC Suppression (${jammingPower} dBm)`,
      description: `Active electronic attack in progress. Directional RF high-power amplifier is sweeping ground station frequency.`,
      telemetryImpact: `Real-time SNR drop: -${(jammingPower / 5).toFixed(1)} dB | Packet Loss: +${(jammingPower / 2).toFixed(1)}%`,
      recommendedAction: 'Deploy Quantum Decryption / Frequency Hopping immediately; engage neural filtering.',
      isDynamic: true
    });
  }

  // If weather is heavy storm, elevate the severity of rain fade areas
  if (weather === 'HEAVY_STORM') {
    const stormZone = zones.find(z => z.id === 'zone-storm-natlantic');
    if (stormZone) {
      stormZone.severity = 'CRITICAL';
      stormZone.telemetryImpact = 'Severe Tropical Atmospheric Wipeout: -14 dB SNR attenuation, >12% packet loss.';
    }
  }

  return zones;
}

/**
 * Evaluates proximity of the operator's location to all active strategic zones,
 * determining whether the station is breached or in threat proximity.
 */
export function evaluateThreatEnvironment(
  userLoc: Coordinates,
  zones: StrategicZone[]
): ThreatEvaluation {
  const insideZones: StrategicZone[] = [];
  let closestZone: StrategicZone | null = null;
  let closestDistanceKm = Infinity;
  let closestDistanceDeg = Infinity;

  for (const zone of zones) {
    const distDeg = calculateDistanceDeg(userLoc, zone.center);
    const distKm = calculateDistanceKm(userLoc, zone.center);

    if (distDeg <= zone.radiusDeg) {
      insideZones.push(zone);
    }

    if (distKm < closestDistanceKm) {
      closestDistanceKm = distKm;
      closestDistanceDeg = distDeg;
      closestZone = zone;
    }
  }

  let overallThreatLevel: SeverityLevel | 'NOMINAL' = 'NOMINAL';
  let advisoryText = 'All operational vectors nominal. No proximity alerts detected.';

  if (insideZones.length > 0) {
    const hasCritical = insideZones.some(z => z.severity === 'CRITICAL');
    const hasHigh = insideZones.some(z => z.severity === 'HIGH');
    overallThreatLevel = hasCritical ? 'CRITICAL' : hasHigh ? 'HIGH' : 'ELEVATED';

    const topBreach = insideZones[0];
    advisoryText = `BREACH ALERT: Operator position inside ${topBreach.designator} (${topBreach.name}). Impact: ${topBreach.telemetryImpact}`;
  } else if (closestZone && closestDistanceKm < 800) {
    overallThreatLevel = 'ADVISORY';
    advisoryText = `PROXIMITY WARNING: ${closestDistanceKm} km from ${closestZone.designator} perimeter (${closestZone.name}).`;
  }

  return {
    insideZones,
    closestZone,
    closestDistanceKm,
    closestDistanceDeg,
    overallThreatLevel,
    advisoryText
  };
}
