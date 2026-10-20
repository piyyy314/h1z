import { Coordinates } from '../types.ts';
import { FireDetection, HORMUZ_MARITIME_FIRES } from './heatmapData.ts';

export type VesselCategory = 
  | 'VLCC Crude Tanker' 
  | 'LNG Carrier' 
  | 'Chemical Tanker' 
  | 'Bulk Carrier' 
  | 'Container Ship' 
  | 'Patrol Vessel' 
  | 'Bunkering Barge'
  | 'Support / SAR Tug';

export type NavStatus = 
  | 'Underway using engine' 
  | 'Not under command (Emergency)' 
  | 'Restricted maneuverability' 
  | 'At anchor' 
  | 'Engaged in SAR / Firefighting'
  | 'Dead in water';

export type FireHazardStatus = 'ON_FIRE' | 'CRITICAL_PROXIMITY' | 'CAUTION' | 'SAFE';

export interface AisVessel {
  mmsi: string;
  imo: string;
  name: string;
  callSign: string;
  type: VesselCategory;
  flag: string;
  countryCode: string;
  lat: number;
  lng: number;
  sogKnots: number;
  cogDegrees: number;
  heading: number;
  navStatus: NavStatus;
  destination: string;
  eta: string;
  draughtMeters: number;
  lengthMeters: number;
  beamMeters: number;
  associatedFireId?: string;
  fireHazardStatus: FireHazardStatus;
  nearestFireDistanceNm?: number;
  nearestFireId?: string;
  nearestFireName?: string;
  nearestFireFrp?: number;
  vhfChannel: number;
  lastAisPingUtc: string;
}

export interface ShippingLane {
  id: string;
  name: string;
  laneType: 'TSS_INBOUND' | 'TSS_OUTBOUND' | 'SEPARATION_ZONE' | 'ANCHORAGE' | 'COASTAL_ACCESS';
  points: Coordinates[];
  trafficDensity: 'VERY_HIGH' | 'HIGH' | 'MEDIUM';
  description: string;
  color: string;
}

/**
 * Calculates distance in Nautical Miles between two geographic coordinates.
 * 1 degree latitude ~ 60 nautical miles.
 */
export function calculateDistanceNm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3440.065; // Earth radius in nautical miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

/**
 * Key Maritime Shipping Lanes & Traffic Separation Schemes (TSS) in the Strait of Hormuz
 */
export const HORMUZ_SHIPPING_LANES: ShippingLane[] = [
  {
    id: 'lane-tss-inbound',
    name: 'Strait of Hormuz Inbound TSS (Gulf of Oman -> Persian Gulf)',
    laneType: 'TSS_INBOUND',
    trafficDensity: 'VERY_HIGH',
    description: 'International 2-nautical-mile wide inbound traffic corridor passing north of Musandam Peninsula toward Abu Musa & Larak.',
    color: '#06b6d4', // cyan-500
    points: [
      { lat: 25.50, lng: 57.30 },
      { lat: 25.90, lng: 56.90 },
      { lat: 26.35, lng: 56.65 },
      { lat: 26.55, lng: 56.40 },
      { lat: 26.65, lng: 56.10 },
      { lat: 26.60, lng: 55.60 },
      { lat: 26.45, lng: 55.00 },
      { lat: 26.30, lng: 54.40 }
    ]
  },
  {
    id: 'lane-tss-outbound',
    name: 'Strait of Hormuz Outbound TSS (Persian Gulf -> Indian Ocean)',
    laneType: 'TSS_OUTBOUND',
    trafficDensity: 'VERY_HIGH',
    description: 'Primary laden crude tanker export lane exiting the Persian Gulf toward the Arabian Sea and Asian refineries.',
    color: '#3b82f6', // blue-500
    points: [
      { lat: 26.15, lng: 54.50 },
      { lat: 26.30, lng: 55.10 },
      { lat: 26.45, lng: 55.70 },
      { lat: 26.48, lng: 56.25 },
      { lat: 26.38, lng: 56.55 },
      { lat: 26.05, lng: 56.85 },
      { lat: 25.65, lng: 57.15 },
      { lat: 25.25, lng: 57.45 }
    ]
  },
  {
    id: 'lane-separation-buffer',
    name: 'TSS Separation Buffer Zone (Non-Navigable Median)',
    laneType: 'SEPARATION_ZONE',
    trafficDensity: 'MEDIUM',
    description: '1-nautical-mile buffer separating inbound and outbound corridors to prevent head-on collisions.',
    color: '#a855f7', // purple-500
    points: [
      { lat: 26.22, lng: 54.45 },
      { lat: 26.37, lng: 55.05 },
      { lat: 26.52, lng: 55.65 },
      { lat: 26.56, lng: 56.17 },
      { lat: 26.46, lng: 56.60 },
      { lat: 26.20, lng: 56.88 },
      { lat: 25.77, lng: 57.22 }
    ]
  },
  {
    id: 'lane-fujairah-anchorage',
    name: 'Fujairah Offshore Bunkering & Anchorage Roadstead',
    laneType: 'ANCHORAGE',
    trafficDensity: 'HIGH',
    description: 'Global bunkering hub outside Strait of Hormuz where 150+ ultra-large tankers await STS transfers and clearance.',
    color: '#10b981', // emerald-500
    points: [
      { lat: 25.10, lng: 56.40 },
      { lat: 25.25, lng: 56.40 },
      { lat: 25.25, lng: 56.60 },
      { lat: 25.10, lng: 56.60 },
      { lat: 25.10, lng: 56.40 }
    ]
  },
  {
    id: 'lane-bandar-abbas',
    name: 'Bandar Abbas Deepwater Naval & Commercial Channel',
    laneType: 'COASTAL_ACCESS',
    trafficDensity: 'HIGH',
    description: 'Northern approaches connecting Shahid Rajaee port and Iranian naval base past Hormuz Island.',
    color: '#f59e0b', // amber-500
    points: [
      { lat: 27.10, lng: 56.15 },
      { lat: 26.95, lng: 56.25 },
      { lat: 26.80, lng: 56.35 },
      { lat: 26.65, lng: 56.40 }
    ]
  }
];

/**
 * Verified AIS Vessel Tracking Fleet in the Strait of Hormuz & Gulf of Oman corridor.
 * Includes vessels directly mapped to active FIRMS fire incidents plus active commercial & military traffic.
 */
export const HORMUZ_AIS_VESSELS: AisVessel[] = [
  // 1. Actively burning vessels (associated with HORMUZ_MARITIME_FIRES)
  {
    mmsi: 'MMSI-538008123',
    imo: 'IMO-9745124',
    name: 'MT Front Altair',
    callSign: 'V7Q92',
    type: 'VLCC Crude Tanker',
    flag: 'Marshall Islands',
    countryCode: 'MH',
    lat: 26.38,
    lng: 56.62,
    sogKnots: 1.2,
    cogDegrees: 114,
    heading: 108,
    navStatus: 'Not under command (Emergency)',
    destination: 'KAOHSIUNG TW',
    eta: 'OCT 26 14:00',
    draughtMeters: 20.5,
    lengthMeters: 333,
    beamMeters: 60,
    associatedFireId: 'fire-hormuz-ship-01',
    fireHazardStatus: 'ON_FIRE',
    nearestFireDistanceNm: 0.0,
    nearestFireId: 'fire-hormuz-ship-01',
    nearestFireName: 'MT Front Altair Cargo Tank Deck Blaze',
    nearestFireFrp: 640,
    vhfChannel: 16,
    lastAisPingUtc: '07:54 UTC'
  },
  {
    mmsi: 'MMSI-354891000',
    imo: 'IMO-9821098',
    name: 'Stolt Valor',
    callSign: '3FYE2',
    type: 'Chemical Tanker',
    flag: 'Panama',
    countryCode: 'PA',
    lat: 26.22,
    lng: 56.45,
    sogKnots: 0.4,
    cogDegrees: 240,
    heading: 235,
    navStatus: 'Not under command (Emergency)',
    destination: 'JUBAIL SA',
    eta: 'OCT 18 09:30',
    draughtMeters: 11.2,
    lengthMeters: 176,
    beamMeters: 31,
    associatedFireId: 'fire-hormuz-ship-02',
    fireHazardStatus: 'ON_FIRE',
    nearestFireDistanceNm: 0.0,
    nearestFireId: 'fire-hormuz-ship-02',
    nearestFireName: 'Stolt Valor Manifold Flare Inferno',
    nearestFireFrp: 480,
    vhfChannel: 16,
    lastAisPingUtc: '07:52 UTC'
  },
  {
    mmsi: 'LBR-99412',
    imo: 'IMO-9430129',
    name: 'Front Empress',
    callSign: 'A8TK4',
    type: 'VLCC Crude Tanker',
    flag: 'Liberia',
    countryCode: 'LR',
    lat: 26.22,
    lng: 56.68,
    sogKnots: 0.1,
    cogDegrees: 310,
    heading: 305,
    navStatus: 'Dead in water',
    destination: 'NINGBO CN',
    eta: 'OCT 29 18:00',
    draughtMeters: 21.0,
    lengthMeters: 332,
    beamMeters: 60,
    associatedFireId: 'fire-hormuz-ship-03',
    fireHazardStatus: 'ON_FIRE',
    nearestFireDistanceNm: 0.0,
    nearestFireId: 'fire-hormuz-ship-03',
    nearestFireName: 'Front Empress Engine Room Flash Fire',
    nearestFireFrp: 310,
    vhfChannel: 16,
    lastAisPingUtc: '07:49 UTC'
  },
  {
    mmsi: 'IRN-9912',
    imo: 'MIL-88219',
    name: 'Zolfaghar Missile Patrol 14',
    callSign: 'IRGCN-14',
    type: 'Patrol Vessel',
    flag: 'Iran (IRGCN)',
    countryCode: 'IR',
    lat: 26.68,
    lng: 56.32,
    sogKnots: 2.5,
    cogDegrees: 95,
    heading: 90,
    navStatus: 'Restricted maneuverability',
    destination: 'BANDAR ABBAS',
    eta: 'OCT 17 12:00',
    draughtMeters: 1.8,
    lengthMeters: 17,
    beamMeters: 4,
    associatedFireId: 'fire-hormuz-ship-04',
    fireHazardStatus: 'ON_FIRE',
    nearestFireDistanceNm: 0.0,
    nearestFireId: 'fire-hormuz-ship-04',
    nearestFireName: 'Zolfaghar Missile Fast Patrol Craft Fire',
    nearestFireFrp: 195,
    vhfChannel: 16,
    lastAisPingUtc: '07:48 UTC'
  },
  {
    mmsi: 'MMSI-636019842',
    imo: 'IMO-9602485',
    name: 'Advantage Sweet',
    callSign: 'D5LU8',
    type: 'VLCC Crude Tanker',
    flag: 'Marshall Islands',
    countryCode: 'MH',
    lat: 25.88,
    lng: 56.88,
    sogKnots: 0.8,
    cogDegrees: 180,
    heading: 175,
    navStatus: 'Not under command (Emergency)',
    destination: 'HOUSTON US',
    eta: 'NOV 12 06:00',
    draughtMeters: 20.8,
    lengthMeters: 299,
    beamMeters: 55,
    associatedFireId: 'fire-hormuz-ship-05',
    fireHazardStatus: 'ON_FIRE',
    nearestFireDistanceNm: 0.0,
    nearestFireId: 'fire-hormuz-ship-05',
    nearestFireName: 'Advantage Sweet Bunker Fuel Fire',
    nearestFireFrp: 420,
    vhfChannel: 16,
    lastAisPingUtc: '07:51 UTC'
  },
  {
    mmsi: 'IRN-4421',
    imo: 'IMO-8924018',
    name: 'Darya Bunkering Barge 4',
    callSign: 'EQB4',
    type: 'Bunkering Barge',
    flag: 'Iran (Commercial)',
    countryCode: 'IR',
    lat: 26.85,
    lng: 56.12,
    sogKnots: 0.2,
    cogDegrees: 45,
    heading: 40,
    navStatus: 'At anchor',
    destination: 'QESHM ROADSTEAD',
    eta: 'OCT 17 08:00',
    draughtMeters: 5.4,
    lengthMeters: 85,
    beamMeters: 16,
    associatedFireId: 'fire-hormuz-ship-06',
    fireHazardStatus: 'ON_FIRE',
    nearestFireDistanceNm: 0.0,
    nearestFireId: 'fire-hormuz-ship-06',
    nearestFireName: 'Darya Bunkering Barge 4 Fuel Rupture',
    nearestFireFrp: 280,
    vhfChannel: 16,
    lastAisPingUtc: '07:44 UTC'
  },
  {
    mmsi: 'QAT-63211',
    imo: 'IMO-9397315',
    name: 'Al-Ghashamiya',
    callSign: 'A7GA',
    type: 'LNG Carrier',
    flag: 'Qatar',
    countryCode: 'QA',
    lat: 26.12,
    lng: 56.74,
    sogKnots: 1.5,
    cogDegrees: 130,
    heading: 125,
    navStatus: 'Restricted maneuverability',
    destination: 'ROTHESAY UK',
    eta: 'OCT 31 16:00',
    draughtMeters: 12.0,
    lengthMeters: 315,
    beamMeters: 50,
    associatedFireId: 'fire-hormuz-ship-07',
    fireHazardStatus: 'ON_FIRE',
    nearestFireDistanceNm: 0.0,
    nearestFireId: 'fire-hormuz-ship-07',
    nearestFireName: 'LNG Carrier Al-Ghashamiya Boil-off Flare',
    nearestFireFrp: 510,
    vhfChannel: 16,
    lastAisPingUtc: '07:53 UTC'
  },
  {
    mmsi: 'GRC-2410',
    imo: 'IMO-9411983',
    name: 'Delta Poseidon',
    callSign: 'SVBW8',
    type: 'VLCC Crude Tanker',
    flag: 'Greece',
    countryCode: 'GR',
    lat: 26.58,
    lng: 56.28,
    sogKnots: 0.3,
    cogDegrees: 210,
    heading: 205,
    navStatus: 'Not under command (Emergency)',
    destination: 'TRIESTE IT',
    eta: 'OCT 28 07:00',
    draughtMeters: 15.6,
    lengthMeters: 274,
    beamMeters: 48,
    associatedFireId: 'fire-hormuz-ship-08',
    fireHazardStatus: 'ON_FIRE',
    nearestFireDistanceNm: 0.0,
    nearestFireId: 'fire-hormuz-ship-08',
    nearestFireName: 'Suezmax Tanker Delta Poseidon Pump Room Fire',
    nearestFireFrp: 450,
    vhfChannel: 16,
    lastAisPingUtc: '07:50 UTC'
  },

  // 2. High-Risk Vessels in Critical Proximity (< 3.0 nm) to FIRMS Fire Anomalies
  {
    mmsi: 'MMSI-636015522',
    imo: 'IMO-9721004',
    name: 'Pacific Gold',
    callSign: 'A8LH2',
    type: 'VLCC Crude Tanker',
    flag: 'Liberia',
    countryCode: 'LR',
    lat: 26.39,
    lng: 56.64,
    sogKnots: 8.4,
    cogDegrees: 118,
    heading: 115,
    navStatus: 'Restricted maneuverability',
    destination: 'YOKOHAMA JP',
    eta: 'NOV 04 10:00',
    draughtMeters: 20.2,
    lengthMeters: 330,
    beamMeters: 60,
    fireHazardStatus: 'CRITICAL_PROXIMITY',
    nearestFireDistanceNm: 1.2,
    nearestFireId: 'fire-hormuz-ship-01',
    nearestFireName: 'MT Front Altair Cargo Tank Deck Blaze',
    nearestFireFrp: 640,
    vhfChannel: 16,
    lastAisPingUtc: '07:54 UTC'
  },
  {
    mmsi: 'MMSI-538006412',
    imo: 'IMO-9654123',
    name: 'Q-Flex Zekreet',
    callSign: 'V7X33',
    type: 'LNG Carrier',
    flag: 'Marshall Islands',
    countryCode: 'MH',
    lat: 26.23,
    lng: 56.47,
    sogKnots: 6.8,
    cogDegrees: 238,
    heading: 236,
    navStatus: 'Underway using engine',
    destination: 'INCHEON KR',
    eta: 'OCT 30 22:00',
    draughtMeters: 12.2,
    lengthMeters: 315,
    beamMeters: 50,
    fireHazardStatus: 'CRITICAL_PROXIMITY',
    nearestFireDistanceNm: 1.8,
    nearestFireId: 'fire-hormuz-ship-02',
    nearestFireName: 'Stolt Valor Manifold Flare Inferno',
    nearestFireFrp: 480,
    vhfChannel: 16,
    lastAisPingUtc: '07:55 UTC'
  },
  {
    mmsi: 'MMSI-240182000',
    imo: 'IMO-9512349',
    name: 'Minerva Symphony',
    callSign: 'SVCM9',
    type: 'VLCC Crude Tanker',
    flag: 'Greece',
    countryCode: 'GR',
    lat: 26.62,
    lng: 56.24,
    sogKnots: 11.2,
    cogDegrees: 215,
    heading: 214,
    navStatus: 'Underway using engine',
    destination: 'SINGAPORE SG',
    eta: 'OCT 27 04:00',
    draughtMeters: 19.8,
    lengthMeters: 330,
    beamMeters: 60,
    fireHazardStatus: 'CAUTION',
    nearestFireDistanceNm: 2.9,
    nearestFireId: 'fire-hormuz-ship-08',
    nearestFireName: 'Delta Poseidon Pump Room Fire',
    nearestFireFrp: 450,
    vhfChannel: 16,
    lastAisPingUtc: '07:53 UTC'
  },

  // 3. SAR & Naval Defense Units Engaged in Escort & Firefighting
  {
    mmsi: 'USA-369970076',
    imo: 'MIL-DDG76',
    name: 'USS Higgins (DDG-76)',
    callSign: 'NHIG',
    type: 'Patrol Vessel',
    flag: 'United States Navy',
    countryCode: 'US',
    lat: 26.28,
    lng: 56.50,
    sogKnots: 18.5,
    cogDegrees: 42,
    heading: 40,
    navStatus: 'Engaged in SAR / Firefighting',
    destination: 'TASK FORCE 153 PATROL',
    eta: 'ON STATION',
    draughtMeters: 9.3,
    lengthMeters: 154,
    beamMeters: 20,
    fireHazardStatus: 'CAUTION',
    nearestFireDistanceNm: 3.2,
    nearestFireId: 'fire-hormuz-ship-01',
    nearestFireName: 'MT Front Altair Cargo Tank Deck Blaze',
    nearestFireFrp: 640,
    vhfChannel: 16,
    lastAisPingUtc: '07:55 UTC'
  },
  {
    mmsi: 'UAE-470123',
    imo: 'IMO-9812456',
    name: 'Fujairah Ocean Rescuer 1',
    callSign: 'A6OR',
    type: 'Support / SAR Tug',
    flag: 'United Arab Emirates',
    countryCode: 'AE',
    lat: 25.95,
    lng: 56.82,
    sogKnots: 14.0,
    cogDegrees: 345,
    heading: 342,
    navStatus: 'Engaged in SAR / Firefighting',
    destination: 'HORMUZ TSS SAR SECTOR',
    eta: 'OCT 17 08:30',
    draughtMeters: 6.2,
    lengthMeters: 72,
    beamMeters: 18,
    fireHazardStatus: 'CAUTION',
    nearestFireDistanceNm: 4.8,
    nearestFireId: 'fire-hormuz-ship-05',
    nearestFireName: 'Advantage Sweet Bunker Fuel Fire',
    nearestFireFrp: 420,
    vhfChannel: 16,
    lastAisPingUtc: '07:54 UTC'
  },

  // 4. Commercial Traffic Navigating Strait of Hormuz Channels
  {
    mmsi: 'MMSI-636017890',
    imo: 'IMO-9851234',
    name: 'MSC Ariane',
    callSign: 'A8ZM2',
    type: 'Container Ship',
    flag: 'Liberia',
    countryCode: 'LR',
    lat: 26.42,
    lng: 55.45,
    sogKnots: 16.2,
    cogDegrees: 92,
    heading: 90,
    navStatus: 'Underway using engine',
    destination: 'JEBEL ALI AE',
    eta: 'OCT 17 19:00',
    draughtMeters: 14.5,
    lengthMeters: 366,
    beamMeters: 51,
    fireHazardStatus: 'SAFE',
    nearestFireDistanceNm: 8.4,
    vhfChannel: 12,
    lastAisPingUtc: '07:52 UTC'
  },
  {
    mmsi: 'MMSI-311000889',
    imo: 'IMO-9781290',
    name: 'Arabian Sea Express',
    callSign: 'C6XY4',
    type: 'Bulk Carrier',
    flag: 'Bahamas',
    countryCode: 'BS',
    lat: 25.35,
    lng: 57.20,
    sogKnots: 12.8,
    cogDegrees: 318,
    heading: 315,
    navStatus: 'Underway using engine',
    destination: 'KUWAIT PORT',
    eta: 'OCT 19 02:00',
    draughtMeters: 13.0,
    lengthMeters: 229,
    beamMeters: 38,
    fireHazardStatus: 'SAFE',
    nearestFireDistanceNm: 15.2,
    vhfChannel: 12,
    lastAisPingUtc: '07:51 UTC'
  }
];

/**
 * Computes proximity of every AIS vessel to active NASA FIRMS fires
 */
export function computeVesselFireProximity(
  vessels: AisVessel[],
  fires: FireDetection[]
): AisVessel[] {
  return vessels.map(v => {
    // If vessel is actively on fire
    if (v.associatedFireId) {
      const match = fires.find(f => f.id === v.associatedFireId);
      return {
        ...v,
        fireHazardStatus: 'ON_FIRE',
        nearestFireDistanceNm: 0.0,
        nearestFireId: v.associatedFireId,
        nearestFireName: match?.name || v.name + ' On-Board Inferno',
        nearestFireFrp: match?.frp || 450
      };
    }

    // Otherwise calculate distance to nearest fire
    let nearestDist = Infinity;
    let nearestFire: FireDetection | null = null;

    for (const f of fires) {
      const dist = calculateDistanceNm(v.lat, v.lng, f.lat, f.lng);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestFire = f;
      }
    }

    let hazardStatus: FireHazardStatus = 'SAFE';
    if (nearestDist <= 3.5) {
      hazardStatus = 'CRITICAL_PROXIMITY';
    } else if (nearestDist <= 8.0) {
      hazardStatus = 'CAUTION';
    }

    return {
      ...v,
      fireHazardStatus: hazardStatus,
      nearestFireDistanceNm: nearestDist < Infinity ? nearestDist : undefined,
      nearestFireId: nearestFire?.id,
      nearestFireName: nearestFire?.name,
      nearestFireFrp: nearestFire?.frp
    };
  });
}
