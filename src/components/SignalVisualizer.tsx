import React, { useState, useEffect, useMemo } from 'react';
import { Activity, ShieldAlert, Wifi, AlertTriangle } from 'lucide-react';

interface SignalVisualizerProps {
  quality: number; // 0 to 100
  isJamming: boolean;
  jammingPower: number;
  rainFade: number;
  isStealthMode: boolean;
  snr?: number | string;
}

export const SignalVisualizer: React.FC<SignalVisualizerProps> = ({
  quality,
  isJamming,
  jammingPower,
  rainFade,
  isStealthMode,
  snr
}) => {
  const [ticker, setTicker] = useState(0);

  useEffect(() => {
    const handle = setInterval(() => {
      setTicker(t => t + 1);
    }, 150);
    return () => clearInterval(handle);
  }, []);

  // Compute resolved numeric SNR and threshold-based critical degradation status (< 5.0 dB)
  const numericSnr = useMemo(() => {
    if (typeof snr === 'number') return snr;
    if (typeof snr === 'string') {
      const parsed = parseFloat(snr);
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  }, [snr]);

  const isCriticalDegradation = numericSnr !== null && numericSnr < 5.0;

  // Compute a dynamic mathematical curve based on jamming, weather (rainFade)
  // Viewport size: width=300, height=80
  const points: string[] = [];
  const totalPoints = 60;
  const width = 300;
  const height = 80;

  // Determine peak power height
  let carrierPeak = isStealthMode ? 28 : (quality > 0 ? 55 : 4);
  if (isJamming) {
    carrierPeak = Math.max(12, carrierPeak - (jammingPower / 4));
  }
  // Rain path fade loss reduces carrier signal height slightly
  carrierPeak = Math.max(2, carrierPeak - rainFade);

  // When SNR is critically degraded, carrier collapses and becomes noisy
  if (isCriticalDegradation) {
    carrierPeak = Math.max(4, carrierPeak * (numericSnr / 10));
  }

  for (let i = 0; i <= totalPoints; i++) {
    const x = (i / totalPoints) * width;
    
    // Ambient noise floor curve
    let baselineNoise = 12; // db depth relative to floor
    if (isJamming) {
      baselineNoise += (jammingPower / 3);
    }
    if (isCriticalDegradation) {
      baselineNoise += 10;
    }

    // Add jitter / noise harmonics
    const noiseJitterRange = isJamming || isCriticalDegradation ? 12 : 1.8;
    // Standard sinusoidal variation representing frequency sweeps
    const jitter = Math.sin((i / 2) + ticker) * noiseJitterRange + (Math.random() - 0.5) * (isJamming || isCriticalDegradation ? 4 : 1);
    
    // Centered Gaussian Carrier Peak representation
    // Center of graph is at index = 30
    const centerIndex = 30;
    const gaussianWidth = isStealthMode ? 3 : (isCriticalDegradation ? 8 : 5);
    const exponent = -Math.pow(i - centerIndex, 2) / (2 * Math.pow(gaussianWidth, 2));
    const peakHeight = carrierPeak * Math.exp(exponent);

    // Sum path parameters up
    const rawY = height - (baselineNoise + peakHeight + jitter);
    const y = Math.max(5, Math.min(height - 2, rawY));
    
    points.push(`${x},${y}`);
  }

  const svgPathCoords = points.join(' ');

  return (
    <div className={`p-4 bg-slate-950/90 border-2 rounded-3xl flex flex-col space-y-3.5 select-none shadow-lg transition-all duration-300 ${
      isCriticalDegradation
        ? 'border-red-600/90 shadow-[0_0_24px_rgba(239,68,68,0.35)] ring-1 ring-red-500/50'
        : 'border-slate-800'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
        <label className="text-[8px] font-black uppercase tracking-widest text-slate-500 flex items-center space-x-1.5">
          <Activity className={`w-3.5 h-3.5 ${isCriticalDegradation ? 'text-red-500 animate-pulse' : 'text-slate-650'}`} />
          <span className={isCriticalDegradation ? 'text-red-400 font-bold' : ''}>Ku-Band Realtime Spectrum</span>
        </label>
        
        <div className="flex items-center space-x-2">
          {isCriticalDegradation && (
            <span className="text-[7.5px] font-mono font-black text-red-400 bg-red-950/80 border border-red-600/80 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center space-x-1 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]">
              <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />
              <span>SNR ALERT: {numericSnr.toFixed(1)} dB (&lt; 5.0 dB)</span>
            </span>
          )}

          {isJamming && !isCriticalDegradation && (
            <span className="text-[7px] font-mono font-bold text-red-400 uppercase tracking-widest flex items-center space-x-1 animate-pulse">
              <ShieldAlert className="w-3 h-3 text-red-500" />
              <span>Harmonic Distortion Detected</span>
            </span>
          )}
        </div>
      </div>

      {/* Analyzer Graph Screen */}
      <div className="bg-black border border-slate-900 rounded-2xl p-2 h-26 overflow-hidden relative flex flex-col justify-between">
        {/* Graticule grid ticks */}
        <div className="absolute inset-2 border border-dashed border-slate-900/40 pointer-events-none grid grid-cols-5 grid-rows-3">
          {[...Array(15)].map((_, idx) => <div key={idx} className="border-[0.25px] border-slate-900/20"></div>)}
        </div>

        {/* Visual Threshold-Based Alert: Red Blinking Overlay when SNR < 5.0 dB */}
        {isCriticalDegradation && (
          <div className="absolute inset-0 bg-red-950/40 border-2 border-red-500/80 z-30 pointer-events-none animate-pulse flex flex-col items-center justify-center p-2 backdrop-blur-[0.5px]">
            <div className="bg-red-950/90 border border-red-500 px-3 py-1 rounded-lg flex items-center space-x-1.5 shadow-[0_0_15px_rgba(239,68,68,0.7)] animate-bounce">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-spin" style={{ animationDuration: '3s' }} />
              <span className="text-[8px] font-mono font-black text-red-200 tracking-widest uppercase">
                CRITICAL SIGNAL DEGRADATION (SNR: {numericSnr.toFixed(1)} dB)
              </span>
            </div>
            <span className="text-[6.5px] font-mono text-red-400 uppercase tracking-widest mt-1 bg-black/60 px-2 py-0.5 rounded">
              THRESHOLD VIOLATION &lt; 5.0 dB // CARRIER LOCK AT RISK
            </span>
          </div>
        )}

        {/* Live SVG spectrum envelope */}
        <svg className="w-full h-full relative z-10 overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          {/* Shaded Area underneath the spectrum */}
          <polygon
            fill={isCriticalDegradation ? "rgba(239, 68, 68, 0.18)" : (isStealthMode ? "rgba(168, 85, 247, 0.04)" : (isJamming ? "rgba(239, 68, 68, 0.04)" : "rgba(34, 211, 238, 0.04)"))}
            points={`0,${height} ${svgPathCoords} ${width},${height}`}
          />
          {/* Spectrum Trace Line */}
          <polyline
            fill="none"
            stroke={isCriticalDegradation ? "#ef4444" : (isStealthMode ? "#c084fc" : (isJamming ? "#ef4444" : "#22d3ee"))}
            strokeWidth={isCriticalDegradation ? "2" : "1.5"}
            points={svgPathCoords}
          />

          {/* Locked Carrier marker */}
          {quality > 0 && !isJamming && !isCriticalDegradation && (
            <g transform={`translate(${width/2}, ${height - 62})`}>
              <line x1="0" y1="0" x2="0" y2="50" stroke="#05b6d4" strokeWidth="0.5" strokeDasharray="2,2" />
              <text x="3" y="10" className="fill-cyan-400 font-mono text-[6px] tracking-widest">FC: 14.25GHZ</text>
            </g>
          )}
        </svg>

        {/* Live frequency labels at bottom */}
        <div className="flex items-center justify-between text-[6.5px] font-mono text-slate-500 uppercase tracking-wider relative z-20">
          <span>U_FC: 14.00 GHz</span>
          <span className={`font-extrabold ${isCriticalDegradation ? 'text-red-400' : 'text-slate-350'}`}>
            {isCriticalDegradation ? 'CARRIER LOCK DEGRADED' : 'Uplink Peak Center'}
          </span>
          <span>U_FC: 14.50 GHz</span>
        </div>
      </div>

      {/* Footer Metrics */}
      <div className="flex items-center justify-between font-mono text-[7px] text-slate-550 uppercase">
        <span>Carrier Span: 500 MHz</span>
        <span>Resolution Bandwidth (RBW): 100 kHz</span>
      </div>
    </div>
  );
};
