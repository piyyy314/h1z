import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Wifi, ShieldCheck, Play, Pause, AlertTriangle, Radio, 
  RotateCcw, Sliders, Activity, Cpu, Download, CheckCircle, Crosshair
} from 'lucide-react';
import { audioController } from '../services/audioService.ts';

interface TelemetryPulseProps {
  telemetry?: any;
  isStealthMode?: boolean;
}

type ModulationScheme = 'QPSK' | '8PSK' | '16APSK' | '32APSK';

interface ConstellationPoint {
  i: number;
  q: number;
}

export const TelemetryPulse: React.FC<TelemetryPulseProps> = ({ telemetry, isStealthMode }) => {
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [pulseSnr, setPulseSnr] = useState<number>(16.2);
  const [pulsePower, setPulsePower] = useState<number>(-42.5);
  const [pulseLoss, setPulseLoss] = useState<number>(0.0);
  const [modulation, setModulation] = useState<ModulationScheme>('16APSK');
  const [dopplerShift, setDopplerShift] = useState<number>(1420); // Hz
  const [evm, setEvm] = useState<number>(2.4); // Error Vector Magnitude %
  const [ber, setBer] = useState<string>('1.2e-7');
  const [logs, setLogs] = useState<string[]>([
    '[INIT] Baseband Telemetry Pulse processor initialized.',
    '[SYNC] DVB-S2X carrier frame locked (Roll-off: 0.05).',
    '[PQC] Telemetry telemetry digest verified with Dilithium5.'
  ]);

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString([], { hour12: false })}] ${msg.toUpperCase()}`, ...prev].slice(0, 8));
  }, []);

  // Update telemetry values every second
  useEffect(() => {
    if (!isRunning) return;
    const handle = setInterval(() => {
      const currentSnr = telemetry?.snr ? parseFloat(telemetry.snr) : 15.5;
      const currentLoss = telemetry?.packetLoss ? parseFloat(telemetry.packetLoss) : 0.02;

      const snrVal = parseFloat((currentSnr + (Math.random() - 0.5) * 0.4).toFixed(2));
      const powerVal = parseFloat((-43 + (Math.random() - 0.5) * 1.5).toFixed(1));
      const lossVal = parseFloat((currentLoss + Math.random() * 0.05).toFixed(2));
      const dopVal = Math.round(1400 + (Math.sin(Date.now() / 8000) * 350) + (Math.random() - 0.5) * 40);
      const evmVal = parseFloat(Math.max(0.8, (22 - snrVal) * 0.45 + Math.random() * 0.3).toFixed(2));

      setPulseSnr(snrVal);
      setPulsePower(powerVal);
      setPulseLoss(lossVal);
      setDopplerShift(dopVal);
      setEvm(evmVal);

      // BER estimation based on SNR
      if (snrVal >= 14) setBer('1.0e-8');
      else if (snrVal >= 10) setBer('3.4e-7');
      else if (snrVal >= 6) setBer('8.9e-5');
      else setBer('4.2e-3');
    }, 1000);

    return () => clearInterval(handle);
  }, [isRunning, telemetry]);

  // Compute I/Q Constellation scatter points for the active modulation scheme
  const constellationPoints = useMemo(() => {
    const idealPoints: ConstellationPoint[] = [];

    if (modulation === 'QPSK') {
      const amp = 0.7;
      idealPoints.push({ i: amp, q: amp }, { i: -amp, q: amp }, { i: -amp, q: -amp }, { i: amp, q: -amp });
    } else if (modulation === '8PSK') {
      for (let k = 0; k < 8; k++) {
        const theta = (k * 2 * Math.PI) / 8 + Math.PI / 8;
        idealPoints.push({ i: Math.cos(theta) * 0.75, q: Math.sin(theta) * 0.75 });
      }
    } else if (modulation === '16APSK') {
      // Ring 1 (4 points)
      for (let k = 0; k < 4; k++) {
        const theta = (k * 2 * Math.PI) / 4 + Math.PI / 4;
        idealPoints.push({ i: Math.cos(theta) * 0.38, q: Math.sin(theta) * 0.38 });
      }
      // Ring 2 (12 points)
      for (let k = 0; k < 12; k++) {
        const theta = (k * 2 * Math.PI) / 12 + Math.PI / 12;
        idealPoints.push({ i: Math.cos(theta) * 0.82, q: Math.sin(theta) * 0.82 });
      }
    } else { // 32APSK
      // Ring 1 (4 points)
      for (let k = 0; k < 4; k++) {
        const theta = (k * 2 * Math.PI) / 4 + Math.PI / 4;
        idealPoints.push({ i: Math.cos(theta) * 0.28, q: Math.sin(theta) * 0.28 });
      }
      // Ring 2 (12 points)
      for (let k = 0; k < 12; k++) {
        const theta = (k * 2 * Math.PI) / 12;
        idealPoints.push({ i: Math.cos(theta) * 0.58, q: Math.sin(theta) * 0.58 });
      }
      // Ring 3 (16 points)
      for (let k = 0; k < 16; k++) {
        const theta = (k * 2 * Math.PI) / 16 + Math.PI / 16;
        idealPoints.push({ i: Math.cos(theta) * 0.88, q: Math.sin(theta) * 0.88 });
      }
    }

    // Add noise scatter cloud around each ideal symbol
    const scatterCloud: ConstellationPoint[] = [];
    const noiseSigma = Math.max(0.015, evm / 100);

    idealPoints.forEach(p => {
      // 4 scatter samples per symbol point
      for (let s = 0; s < 4; s++) {
        const di = (Math.random() - 0.5) * noiseSigma * 2.5;
        const dq = (Math.random() - 0.5) * noiseSigma * 2.5;
        scatterCloud.push({ i: p.i + di, q: p.q + dq });
      }
    });

    return { idealPoints, scatterCloud };
  }, [modulation, evm]);

  return (
    <div className="p-6 bg-slate-950 border-2 border-slate-900 rounded-3xl text-slate-100 flex flex-col space-y-6 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
            <Wifi className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-black uppercase tracking-wider font-mono">
                Advanced Telemetry Pulse & I/Q Demodulator
              </h3>
              <span className="text-[7.5px] font-mono uppercase bg-cyan-950 text-cyan-400 border border-cyan-900/60 px-2 py-0.5 rounded">
                DVB-S2X // BASEBAND
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">
              Direct realtime baseband receiver telemetry, I/Q constellation polar analysis, Doppler shift tracking & LDPC FEC decoder metrics
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => { setIsRunning(!isRunning); audioController.playBeep(700, 'sine', 0.05); }}
            className={`px-3 py-1.5 rounded-xl border text-[9px] font-mono font-bold flex items-center space-x-1.5 transition ${
              isRunning ? 'bg-cyan-950 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isRunning ? 'RECEIVING' : 'PAUSED'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Telemetry Metrics & I/Q Constellation Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Core telemetry specs & I/Q plot (col 7) */}
        <div className="lg:col-span-7 bg-slate-950/60 border border-slate-900 p-5 rounded-2xl flex flex-col justify-between space-y-5">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div className="bg-slate-950 border border-slate-900 p-3 rounded-xl">
              <span className="text-[7.5px] text-slate-500 block uppercase tracking-wider">CARRIER SNR</span>
              <strong className={`text-base font-black ${pulseSnr < 5.0 ? 'text-red-400' : pulseSnr < 10.0 ? 'text-amber-400' : 'text-cyan-400'}`}>
                {pulseSnr.toFixed(2)} dB
              </strong>
            </div>

            <div className="bg-slate-950 border border-slate-900 p-3 rounded-xl">
              <span className="text-[7.5px] text-slate-500 block uppercase tracking-wider">RX RF POWER</span>
              <strong className="text-base font-black text-slate-200">
                {pulsePower.toFixed(1)} dBm
              </strong>
            </div>

            <div className="bg-slate-950 border border-slate-900 p-3 rounded-xl">
              <span className="text-[7.5px] text-slate-500 block uppercase tracking-wider">DOPPLER SHIFT</span>
              <strong className="text-base font-black text-emerald-400">
                {dopplerShift >= 0 ? `+${dopplerShift}` : dopplerShift} Hz
              </strong>
            </div>

            <div className="bg-slate-950 border border-slate-900 p-3 rounded-xl">
              <span className="text-[7.5px] text-slate-500 block uppercase tracking-wider">EVM (RMS)</span>
              <strong className={`text-base font-black ${evm > 6 ? 'text-red-400' : evm > 3 ? 'text-amber-400' : 'text-cyan-400'}`}>
                {evm.toFixed(2)}%
              </strong>
            </div>
          </div>

          {/* I/Q Constellation Diagram Screen */}
          <div className="bg-black border border-slate-900 rounded-2xl p-4 flex flex-col space-y-3">
            <div className="flex items-center justify-between text-[8px] font-mono border-b border-slate-900 pb-2">
              <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center space-x-1.5">
                <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                <span>POLAR I/Q CONSTELLATION POLAR DIAGRAM</span>
              </span>
              <div className="flex items-center space-x-1">
                {(['QPSK', '8PSK', '16APSK', '32APSK'] as ModulationScheme[]).map(mod => (
                  <button
                    key={mod}
                    onClick={() => { setModulation(mod); addLog(`Switched demodulator to ${mod}`); audioController.playBeep(600, 'sine', 0.05); }}
                    className={`px-2 py-0.5 rounded text-[7.5px] font-mono transition ${
                      modulation === mod 
                        ? 'bg-cyan-500 text-slate-950 font-black' 
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mod}
                  </button>
                ))}
              </div>
            </div>

            {/* Constellation Canvas / SVG Area */}
            <div className="h-48 w-full flex items-center justify-center relative">
              <svg className="w-48 h-48 overflow-visible" viewBox="-1.2 -1.2 2.4 2.4">
                {/* Polar Circles */}
                <circle cx="0" cy="0" r="1.0" fill="none" stroke="#1e293b" strokeWidth="0.015" />
                <circle cx="0" cy="0" r="0.75" fill="none" stroke="#1e293b" strokeWidth="0.01" strokeDasharray="0.05, 0.05" />
                <circle cx="0" cy="0" r="0.5" fill="none" stroke="#1e293b" strokeWidth="0.01" strokeDasharray="0.05, 0.05" />
                <circle cx="0" cy="0" r="0.25" fill="none" stroke="#1e293b" strokeWidth="0.01" strokeDasharray="0.05, 0.05" />
                {/* Axes */}
                <line x1="-1.1" y1="0" x2="1.1" y2="0" stroke="#334155" strokeWidth="0.015" />
                <line x1="0" y1="-1.1" x2="0" y2="1.1" stroke="#334155" strokeWidth="0.015" />

                {/* In-phase and Quadrature Labels */}
                <text x="1.0" y="-0.04" fontSize="0.08" fill="#64748b" textAnchor="end" fontFamily="monospace">I</text>
                <text x="0.04" y="-1.0" fontSize="0.08" fill="#64748b" textAnchor="start" fontFamily="monospace">Q</text>

                {/* Noise scatter cloud */}
                {constellationPoints.scatterCloud.map((pt, idx) => (
                  <circle key={`sc-${idx}`} cx={pt.i} cy={pt.q} r="0.012" fill="#06b6d4" opacity="0.45" />
                ))}

                {/* Ideal Constellation Points */}
                {constellationPoints.idealPoints.map((pt, idx) => (
                  <g key={`id-${idx}`}>
                    <circle cx={pt.i} cy={pt.q} r="0.028" fill="#38bdf8" stroke="#0284c7" strokeWidth="0.008" />
                    <circle cx={pt.i} cy={pt.q} r="0.01" fill="#ffffff" />
                  </g>
                ))}
              </svg>

              {/* Status Overlay */}
              <div className="absolute top-0 right-0 text-[7.5px] font-mono text-right text-slate-500 space-y-0.5">
                <div>MOD: <span className="text-cyan-400 font-bold">{modulation}</span></div>
                <div>EST. BER: <span className="text-emerald-400 font-bold">{ber}</span></div>
                <div>ROLL-OFF: <span className="text-slate-300">0.05 (DVB-S2X)</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Decoder Status & Pulse Audit Logs right (col 5) */}
        <div className="lg:col-span-5 bg-slate-950/60 border border-slate-900 p-5 rounded-2xl flex flex-col justify-between space-y-5 font-mono">
          <div className="space-y-4">
            <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest block">
              DVB-S2X Decoder Status Grid
            </span>

            <div className="grid grid-cols-2 gap-2 text-[8px]">
              <div className="bg-slate-950 border border-slate-900 p-2.5 rounded-xl flex items-center justify-between">
                <span className="text-slate-500">CARRIER LOCK:</span>
                <span className="text-emerald-400 font-bold flex items-center space-x-1">
                  <CheckCircle className="w-2.5 h-2.5" />
                  <span>LOCKED</span>
                </span>
              </div>
              <div className="bg-slate-950 border border-slate-900 p-2.5 rounded-xl flex items-center justify-between">
                <span className="text-slate-500">SYMBOL SYNC:</span>
                <span className="text-emerald-400 font-bold">OPTIMAL</span>
              </div>
              <div className="bg-slate-950 border border-slate-900 p-2.5 rounded-xl flex items-center justify-between">
                <span className="text-slate-500">LDPC DECODER:</span>
                <span className="text-cyan-400 font-bold">ITERATION 12</span>
              </div>
              <div className="bg-slate-950 border border-slate-900 p-2.5 rounded-xl flex items-center justify-between">
                <span className="text-slate-500">BCH FEC:</span>
                <span className="text-emerald-400 font-bold">0 CORR ERR</span>
              </div>
            </div>

            <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest block pt-2">
              Telemetry Audit Trail
            </span>

            <div className="bg-black border border-slate-900 p-3 h-40 rounded-xl overflow-y-auto scrollbar-none text-[7.5px] text-slate-400 space-y-1.5">
              {logs.map((log, idx) => (
                <div key={idx} className="truncate">
                  <span className="text-cyan-400 pr-1">▶</span> {log}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-900 pt-3 flex items-center justify-between text-[7px] text-slate-500 uppercase">
            <span>DVB-S2X Baseband Profile TSI-SAT</span>
            <span className="text-emerald-400 font-black flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> VALIDATED
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
