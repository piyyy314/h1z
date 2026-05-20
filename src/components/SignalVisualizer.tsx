import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, Wifi } from 'lucide-react';

interface SignalVisualizerProps {
  quality: number; // 0 to 100
  isJamming: boolean;
  jammingPower: number;
  rainFade: number;
  isStealthMode: boolean;
}

export const SignalVisualizer: React.FC<SignalVisualizerProps> = ({
  quality,
  isJamming,
  jammingPower,
  rainFade,
  isStealthMode
}) => {
  const [ticker, setTicker] = useState(0);

  useEffect(() => {
    const handle = setInterval(() => {
      setTicker(t => t + 1);
    }, 150);
    return () => clearInterval(handle);
  }, []);

  // Compute a beautiful dynamic mathematical curve based on jamming, weather (rainFade)
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

  for (let i = 0; i <= totalPoints; i++) {
    const x = (i / totalPoints) * width;
    
    // Ambient noise floor curve
    let baselineNoise = 12; // db depth relative to floor
    if (isJamming) {
      baselineNoise += (jammingPower / 3);
    }

    // Add jitter / noise harmonics
    const noiseJitterRange = isJamming ? 10 : 1.8;
    // Standard sinusoidal variation representing frequency sweeps
    const jitter = Math.sin((i / 2) + ticker) * noiseJitterRange + (Math.random() - 0.5) * (isJamming ? 4 : 1);
    
    // Centered Gaussian Carrier Peak representation
    // Center of graph is at index = 30
    const centerIndex = 30;
    const gaussianWidth = isStealthMode ? 3 : 5;
    const exponent = -Math.pow(i - centerIndex, 2) / (2 * Math.pow(gaussianWidth, 2));
    const peakHeight = carrierPeak * Math.exp(exponent);

    // Sum path parameters up
    // In SVG, Y coordinate 0 is top. So we subtract height parameter values from total height
    const rawY = height - (baselineNoise + peakHeight + jitter);
    const y = Math.max(5, Math.min(height - 2, rawY));
    
    points.push(`${x},${y}`);
  }

  const svgPathCoords = points.join(' ');

  return (
    <div className="p-4 bg-slate-950/90 border-2 border-slate-800 rounded-3xl flex flex-col space-y-3.5 select-none shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
        <label className="text-[8px] font-black uppercase tracking-widest text-slate-500 flex items-center space-x-1.5">
          <Activity className="w-3.5 h-3.5 text-slate-650" />
          <span>Ku-Band Realtime Spectrum</span>
        </label>
        
        {isJamming && (
          <span className="text-[7px] font-mono font-bold text-red-400 uppercase tracking-widest flex items-center space-x-1 animate-pulse">
            <ShieldAlert className="w-3 h-3 text-red-500" />
            <span>Harmonic Distortion Detected</span>
          </span>
        )}
      </div>

      {/* Analyzer Graph Screen */}
      <div className="bg-black border border-slate-900 rounded-2xl p-2 h-26 overflow-hidden relative flex flex-col justify-between">
        {/* Graticule grid ticks */}
        <div className="absolute inset-2 border border-dashed border-slate-900/40 pointer-events-none grid grid-cols-5 grid-rows-3">
          {[...Array(15)].map((_, idx) => <div key={idx} className="border-[0.25px] border-slate-900/20"></div>)}
        </div>

        {/* Live SVG spectrum envelope */}
        <svg className="w-full h-full relative z-10 overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          {/* Shaded Area underneath the spectrum */}
          <polygon
            fill={isStealthMode ? "rgba(168, 85, 247, 0.04)" : (isJamming ? "rgba(239, 68, 68, 0.04)" : "rgba(34, 211, 238, 0.04)")}
            points={`0,${height} ${svgPathCoords} ${width},${height}`}
          />
          {/* Spectrum Trace Line */}
          <polyline
            fill="none"
            stroke={isStealthMode ? "#c084fc" : (isJamming ? "#ef4444" : "#22d3ee")}
            strokeWidth="1.5"
            points={svgPathCoords}
          />

          {/* Locked Carrier marker */}
          {quality > 0 && !isJamming && (
            <g transform={`translate(${width/2}, ${height - 62})`}>
              <line x1="0" y1="0" x2="0" y2="50" stroke="#05b6d4" strokeWidth="0.5" strokeDasharray="2,2" />
              <text x="3" y="10" className="fill-cyan-400 font-mono text-[6px] tracking-widest">FC: 14.25GHZ</text>
            </g>
          )}
        </svg>

        {/* Live frequency labels at bottom */}
        <div className="flex items-center justify-between text-[6.5px] font-mono text-slate-500 uppercase tracking-wider relative z-20">
          <span>U_FC: 14.00 GHz</span>
          <span className="font-extrabold text-slate-350">Uplink Peak Center</span>
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
