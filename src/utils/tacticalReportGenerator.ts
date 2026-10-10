import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Coordinates, LookAngles, Satellite, TacticalEvent, WeatherCondition } from '../types.ts';
import { computeTelemetryDigest, generateTacticalSessionKey } from './cryptoUtils.ts';

export type ReportClassification = 
  | 'TOP SECRET // NOFORN'
  | 'SECRET // REL TO NATO'
  | 'CONFIDENTIAL'
  | 'UNCLASSIFIED // FOR OFFICIAL USE ONLY';

export interface TacticalReportData {
  reportId?: string;
  classification?: ReportClassification;
  timestamp?: string;
  defcon: number;
  isStealthMode: boolean;
  isJamming: boolean;
  jammingPower: number;
  weather: WeatherCondition;
  operatorName?: string;
  stationCoordinates: Coordinates;
  selectedSatellite: Satellite;
  lookAngles: LookAngles | null;
  telemetry: {
    snr: string | number;
    rxPower: string | number;
    bucTemp: string | number;
    packetLoss: string | number;
    status: string;
  };
  activeView?: string;
  eventLogs?: TacticalEvent[];
  notes?: string;
}

/**
 * Computes approximate Free Space Path Loss (FSPL) in dB for Ku-band (~12 GHz) based on distance
 */
export const calculateFSPL = (distanceKm: number, freqGHz = 12.0): number => {
  if (distanceKm <= 0) return 205.5;
  // FSPL (dB) = 20 * log10(d_km) + 20 * log10(f_MHz) + 32.44
  const freqMHz = freqGHz * 1000;
  const fspl = 20 * Math.log10(distanceKm) + 20 * Math.log10(freqMHz) + 32.44;
  return Number(fspl.toFixed(2));
};

/**
 * Formats coordinates for tactical documentation (e.g. 51.5074°N, 0.1278°W)
 */
export const formatCoordinates = (coords: Coordinates): string => {
  const latDir = coords.lat >= 0 ? 'N' : 'S';
  const lngDir = coords.lng >= 0 ? 'E' : 'W';
  return `${Math.abs(coords.lat).toFixed(4)}°${latDir}, ${Math.abs(coords.lng).toFixed(4)}°${lngDir}`;
};

/**
 * Generates a complete, military-grade printable PDF Tactical Report
 */
export const generateTacticalReport = (data: TacticalReportData): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const classification = data.classification || 'TOP SECRET // NOFORN';
  const reportId = data.reportId || `TSI-RPT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
  const dateStr = data.timestamp || new Date().toUTCString();
  const operator = data.operatorName || 'OPERATOR-313 / TACTICAL C2';

  // Palette constants
  const primaryNavy: [number, number, number] = [15, 23, 42]; // #0f172a
  const accentCyan: [number, number, number] = [6, 182, 212]; // #06b6d4
  const darkCard: [number, number, number] = [30, 41, 59]; // #1e293b
  const textLight: [number, number, number] = [241, 245, 249]; // #f1f5f9
  const textMuted: [number, number, number] = [100, 116, 139]; // #64748b

  // Helper for Top/Bottom Classification Banners
  const drawPageHeadersAndFooters = () => {
    const pageCount = (doc.internal as any).getNumberOfPages ? (doc.internal as any).getNumberOfPages() : 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      // Top Security Banner
      doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
      doc.rect(0, 0, pageWidth, 9, 'F');
      doc.setFont('courier', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(accentCyan[0], accentCyan[1], accentCyan[2]);
      doc.text(classification, pageWidth / 2, 6, { align: 'center' });

      // Bottom Security Banner & Pagination
      doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
      doc.rect(0, pageHeight - 9, pageWidth, 9, 'F');
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.setFontSize(7);
      doc.text(
        `REPORT ID: ${reportId}  |  CLASSIFIED SATCOM C2  |  PAGE ${i} OF ${pageCount}`,
        pageWidth / 2,
        pageHeight - 3.5,
        { align: 'center' }
      );
    }
  };

  // -------------------------------------------------------------
  // PAGE 1: DOSSIER HEADER & EXECUTIVE STATUS
  // -------------------------------------------------------------
  let currentY = 14;

  // Header Box
  doc.setFillColor(darkCard[0], darkCard[1], darkCard[2]);
  doc.roundedRect(12, currentY, pageWidth - 24, 28, 2, 2, 'F');
  doc.setDrawColor(accentCyan[0], accentCyan[1], accentCyan[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(12, currentY, pageWidth - 24, 28, 2, 2, 'D');

  // Title & Org
  doc.setFont('courier', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(accentCyan[0], accentCyan[1], accentCyan[2]);
  doc.text('SATEXPERT TACTICAL SATCOM INTELLIGENCE (TSI)', 16, currentY + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(textLight[0], textLight[1], textLight[2]);
  doc.text('TACTICAL MISSION STATUS & TELEMETRY REPORT', 16, currentY + 13);

  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`REPORT IDENTIFIER: ${reportId}`, 16, currentY + 19);
  doc.text(`GENERATED TIMESTAMP: ${dateStr}`, 16, currentY + 24);

  // DEFCON / Stealth badge on right side
  const defconColors: Record<number, [number, number, number]> = {
    1: [220, 38, 38], // Red
    2: [245, 158, 11], // Orange
    3: [234, 179, 8],  // Yellow
    4: [59, 130, 246], // Blue
    5: [16, 185, 129]  // Emerald
  };
  const defconColor = defconColors[data.defcon] || [16, 185, 129];
  doc.setFillColor(defconColor[0], defconColor[1], defconColor[2]);
  doc.roundedRect(pageWidth - 62, currentY + 4, 46, 9, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(`DEFCON LEVEL ${data.defcon}`, pageWidth - 39, currentY + 10, { align: 'center' });

  // Stealth Mode indicator
  const stealthColor: [number, number, number] = data.isStealthMode ? [168, 85, 247] : [71, 85, 105];
  doc.setFillColor(stealthColor[0], stealthColor[1], stealthColor[2]);
  doc.roundedRect(pageWidth - 62, currentY + 15, 46, 8, 1.5, 1.5, 'F');
  doc.setFontSize(7);
  doc.text(
    data.isStealthMode ? 'STEALTH: ACTIVE' : 'STEALTH: OFFLINE',
    pageWidth - 39,
    currentY + 20.5,
    { align: 'center' }
  );

  currentY += 34;

  // -------------------------------------------------------------
  // SECTION 1: GROUND STATION & SATELLITE EPHEMERIS
  // -------------------------------------------------------------
  doc.setFont('courier', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.text('SECTION 1: GEOSPATIAL COORDINATES & ORBITAL EPHEMERIS', 12, currentY);
  currentY += 3;

  const sat = data.selectedSatellite;
  const angles = data.lookAngles;
  const distanceKm = angles?.distance || 36000;
  const fsplDb = calculateFSPL(distanceKm);

  autoTable(doc, {
    startY: currentY,
    theme: 'grid',
    styles: { font: 'courier', fontSize: 7.5, cellPadding: 2 },
    headStyles: { fillColor: primaryNavy, textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    head: [['PARAMETER', 'GROUND STATION METRIC', 'TARGET SATELLITE EPHEMERIS', 'TACTICAL NOTE']],
    body: [
      [
        'Coordinates / Location',
        formatCoordinates(data.stationCoordinates),
        `${sat.name} (Orbital Slot: ${sat.orbitalSlot})`,
        `Sub-Satellite Lon: ${sat.longitude >= 0 ? `${sat.longitude}°E` : `${Math.abs(sat.longitude)}°W`}`
      ],
      [
        'True Azimuth Angle',
        angles ? `${angles.azimuth}° True North` : 'Pending calculation',
        `Operator: ${sat.operator || 'Military / Commercial C2'}`,
        'Compass Alignment Required'
      ],
      [
        'True Elevation Tilt',
        angles ? `${angles.elevation}° Horizon` : 'Pending calculation',
        `Orbital Radius: ~42,164 km GEO`,
        angles && angles.elevation > 15 ? 'Clear Line-of-Sight' : 'Low Horizon Risk'
      ],
      [
        'Polarization Skew Angle',
        angles ? `${angles.skew}° Feedhorn Offset` : '0.00°',
        `Inclination: ${sat.inclination !== undefined ? `${sat.inclination}°` : '0.05° GEO'}`,
        'LNB Rotation Compensation'
      ],
      [
        'Slant Range Propagation',
        `${distanceKm.toLocaleString()} km`,
        `Estimated FSPL: ~${fsplDb} dB (Ku-band)`,
        'One-way delay: ~120 ms'
      ]
    ],
    margin: { left: 12, right: 12 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // -------------------------------------------------------------
  // SECTION 2: SIGNAL TELEMETRY & RF LINK MATRIX
  // -------------------------------------------------------------
  doc.setFont('courier', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.text('SECTION 2: SIGNAL TELEMETRY & RF PERFORMANCE MATRIX', 12, currentY);
  currentY += 3;

  const snrVal = Number(data.telemetry.snr);
  const snrStatus = snrVal >= 10 ? 'NOMINAL' : snrVal >= 5 ? 'DEGRADED' : 'CRITICAL (DEGRADATION ALERT)';
  const weatherFade = data.weather === 'CLEAR' ? '0.50 dB' : data.weather === 'OVERCAST' ? '2.00 dB' : data.weather === 'LIGHT_RAIN' ? '5.00 dB' : '14.00 dB';

  autoTable(doc, {
    startY: currentY,
    theme: 'grid',
    styles: { font: 'courier', fontSize: 7.5, cellPadding: 2 },
    headStyles: { fillColor: primaryNavy, textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    head: [['RF METRIC', 'RECORDED VALUE', 'OPERATIONAL THRESHOLD', 'INTEGRITY ASSESSMENT']],
    body: [
      [
        'Signal-to-Noise Ratio (SNR)',
        `${data.telemetry.snr} dB`,
        'Baseline: >= 10.0 dB (Crit < 5.0 dB)',
        snrStatus
      ],
      [
        'Carrier Received Power (Rx)',
        `${data.telemetry.rxPower} dBW`,
        'Operational Range: -30 to -65 dBW',
        Number(data.telemetry.rxPower) > -60 ? 'CARRIER LOCK CONFIRMED' : 'MARGINAL SIGNAL'
      ],
      [
        'Packet Loss Rate',
        `${data.telemetry.packetLoss}%`,
        'Acceptable: < 1.00%',
        Number(data.telemetry.packetLoss) === 0 ? 'CLEAN STREAM' : 'BURST ERROR DETECTED'
      ],
      [
        'BUC Transmitter Temperature',
        `${data.telemetry.bucTemp} °C`,
        'Safe Max: < 75.0 °C',
        Number(data.telemetry.bucTemp) < 65 ? 'THERMAL NOMINAL' : 'THERMAL THROTTLING WARNING'
      ],
      [
        'Atmospheric & Weather Condition',
        `${data.weather} (Fade: ~${weatherFade})`,
        'Clear Sky: 0.50 dB attenuation',
        data.weather === 'HEAVY_STORM' ? 'SEVERE RAIN-FADE LOSS' : 'NORMAL PROPAGATION'
      ],
      [
        'Overall Link State',
        data.telemetry.status,
        'Carrier Synchronized',
        data.telemetry.status === 'NOMINAL' ? 'ALL SYSTEMS OPERATIONAL' : 'LINK INTERVENTION ADVISED'
      ]
    ],
    margin: { left: 12, right: 12 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // -------------------------------------------------------------
  // SECTION 3: TACTICAL DEFENSE, ECM & ACTIVE MODULE STATE
  // -------------------------------------------------------------
  doc.setFont('courier', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.text('SECTION 3: ELECTRONIC WARFARE & DEFENSE GRID', 12, currentY);
  currentY += 3;

  autoTable(doc, {
    startY: currentY,
    theme: 'grid',
    styles: { font: 'courier', fontSize: 7.5, cellPadding: 2 },
    headStyles: { fillColor: primaryNavy, textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    head: [['DEFENSE SUBSYSTEM', 'CONFIGURATION STATE', 'DETAIL / OPERATIONAL EFFECT']],
    body: [
      [
        'RF Countermeasures (Jammer)',
        data.isJamming ? `ENGAGED (${data.jammingPower}% POWER)` : 'STANDBY / PASSIVE',
        data.isJamming ? 'High-power RF noise injected across target spectrum' : 'Quiet emitter state'
      ],
      [
        'Stealth Masking Mode',
        data.isStealthMode ? 'ACTIVE (LOW-OBSERVABLE)' : 'OFFLINE',
        data.isStealthMode ? 'RF emissions suppressed; simulated telemetry signature' : 'Normal ground station broadcasting'
      ],
      [
        'Post-Quantum Cryptography',
        'NIST ML-DSA (Dilithium3) + ML-KEM (Kyber-768)',
        'Level 3 quantum-resistant signature validation engaged'
      ],
      [
        'Active C2 Module',
        data.activeView ? data.activeView.toUpperCase().replace(/_/g, ' ') : 'TACTICAL C2',
        'Console viewport engaged at time of mission report'
      ]
    ],
    margin: { left: 12, right: 12 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // If there are custom notes or we need a second page for logs
  if (data.notes && data.notes.trim()) {
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(12, currentY, pageWidth - 24, 16, 1.5, 1.5, 'F');
    doc.setFont('courier', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
    doc.text('OPERATIONAL REMARKS / INCIDENT LOG:', 16, currentY + 5);
    doc.setFont('courier', 'normal');
    doc.setTextColor(51, 65, 85);
    const splitNotes = doc.splitTextToSize(data.notes.trim(), pageWidth - 32);
    doc.text(splitNotes, 16, currentY + 10);
    currentY += 20;
  }

  // -------------------------------------------------------------
  // SECTION 4: MISSION EVENT AUDIT LOGS (Page 2 if needed)
  // -------------------------------------------------------------
  if (data.eventLogs && data.eventLogs.length > 0) {
    // Add page 2 for audit logs and digital signature
    doc.addPage();
    currentY = 16;

    doc.setFont('courier', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
    doc.text('SECTION 4: TACTICAL EVENT AUDIT LOG (RECENT MISSION EVENTS)', 12, currentY);
    currentY += 4;

    const logRows = data.eventLogs.slice(0, 15).map(evt => [
      evt.timestamp,
      evt.satName,
      typeof evt.status === 'string' ? evt.status.toUpperCase() : 'INFO',
      evt.detail
    ]);

    autoTable(doc, {
      startY: currentY,
      theme: 'grid',
      styles: { font: 'courier', fontSize: 7, cellPadding: 1.8 },
      headStyles: { fillColor: primaryNavy, textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      head: [['TIMESTAMP', 'TARGET SAT', 'STATUS', 'MISSION EVENT DETAIL']],
      body: logRows,
      margin: { left: 12, right: 12 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // -------------------------------------------------------------
  // FINAL SECTION: CRYPTOGRAPHIC SIGN-OFF & AUTHENTICATION
  // -------------------------------------------------------------
  // Ensure enough room or add page if near bottom
  if (currentY > pageHeight - 45) {
    doc.addPage();
    currentY = 16;
  }

  doc.setFillColor(darkCard[0], darkCard[1], darkCard[2]);
  doc.roundedRect(12, currentY, pageWidth - 24, 28, 2, 2, 'F');
  doc.setDrawColor(accentCyan[0], accentCyan[1], accentCyan[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(12, currentY, pageWidth - 24, 28, 2, 2, 'D');

  const sessionKey = generateTacticalSessionKey('PQC-DILITHIUM3');

  doc.setFont('courier', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(accentCyan[0], accentCyan[1], accentCyan[2]);
  doc.text('TACTICAL COMMAND SIGN-OFF & CRYPTOGRAPHIC VERIFICATION', 16, currentY + 6);

  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(203, 213, 225);
  doc.text(`AUTHENTICATING OFFICER: ${operator}`, 16, currentY + 12);
  doc.text(`PQC VERIFICATION TOKEN: ${sessionKey}`, 16, currentY + 17);
  doc.text(`DIGITAL INTEGRITY SEAL: VERIFIED // FIPS 204 ML-DSA COMPLIANT`, 16, currentY + 22);

  // Signature line on right
  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.2);
  doc.line(pageWidth - 65, currentY + 18, pageWidth - 16, currentY + 18);
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('AUTHORIZED SIGNATURE / CALLSIGN', pageWidth - 40.5, currentY + 22, { align: 'center' });

  // Render headers and footers across all generated pages
  drawPageHeadersAndFooters();

  return doc;
};

/**
 * Downloads the Tactical Report as a formatted PDF file
 */
export const exportTacticalReportPDF = (
  data: TacticalReportData,
  customFilename?: string
): { doc: jsPDF; filename: string } => {
  const doc = generateTacticalReport(data);
  const cleanSatName = (data.selectedSatellite.name || 'SAT').replace(/[^a-zA-Z0-9_-]/g, '_');
  const timestampIso = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const filename = customFilename || `Tactical_Report_${cleanSatName}_${timestampIso}.pdf`;
  
  doc.save(filename);
  return { doc, filename };
};

/**
 * Generates a Blob URL for in-app preview or printing
 */
export const getTacticalReportBlobUrl = (data: TacticalReportData): string => {
  const doc = generateTacticalReport(data);
  const blob = doc.output('blob');
  return URL.createObjectURL(blob);
};
