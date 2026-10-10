/**
 * Satellite Link Budget & Attenuation Formulations
 */

/**
 * Free Space Path Loss (FSPL) in dB
 * @param distanceKm Slant range distance in kilometers
 * @param frequencyGhz Carrier frequency in Gigahertz
 * @returns Path loss in decibels (dB)
 */
export const calculateFspl = (distanceKm: number, frequencyGhz: number): number => {
  if (distanceKm <= 0 || frequencyGhz <= 0) return 0;
  const fspl = 20 * Math.log10(distanceKm) + 20 * Math.log10(frequencyGhz) + 92.45;
  return Number(fspl.toFixed(2));
};

/**
 * Computes Received Carrier Power (C) in dBW
 */
export const calculateReceivedPower = ({
  bucPowerWatts,
  txGainDbi,
  rxGainDbi,
  fsplDb,
  attenuationDb = 0
}: {
  bucPowerWatts: number;
  txGainDbi: number;
  rxGainDbi: number;
  fsplDb: number;
  attenuationDb?: number;
}): number => {
  const bucPowerDbw = 10 * Math.log10(bucPowerWatts > 0 ? bucPowerWatts : 1);
  const rxPower = bucPowerDbw + txGainDbi - fsplDb + rxGainDbi - attenuationDb;
  return Number(rxPower.toFixed(2));
};

/**
 * Computes link margin over thermal noise floor (-120 dBW nominal baseline)
 */
export const calculateLinkMargin = (rxPowerDbw: number, noiseFloorDbw = -120.0): number => {
  return Number((rxPowerDbw - noiseFloorDbw).toFixed(2));
};
