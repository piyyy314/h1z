import React, { useState, useEffect } from 'react';
import { Target, RefreshCw, Cpu, Wifi, ShieldCheck, Play, Pause, AlertTriangle } from 'lucide-react';

interface TelemetryPulseProps {
  telemetry?: any;
  isStealthMode?: boolean;
}

export const TelemetryPulse: React.FC<TelemetryPulseProps> = ({ telemetry, isStealthMode }) => {
  const [pulseSnr, setPulseSnr] = useState<number>(16.2);
  const [pulsePower, setPulsePower] = useState<number>(-42.5);
  const [pulseLoss, setPulseLoss] = useState<number>(0.0);
  const [logs, setLogs] = useState<string[]>(['[TELEM] Pulse monitoring grid online. Ready.']);

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString([], { hour12: false })}] ${msg.toUpperCase()}`, ...prev].slice(0, 5));
  };

  useEffect(() => {
    const handle = setInterval(() => {
      setPulseSnr(parseFloat((14 + Math.random() * 4).toFixed(2)));
      setPulsePower(parseFloat((-45 + Math.random() * 4).toFixed(1)));
      setPulseLoss(parseFloat((Math.random() * 0.1).toFixed(2)));
    }, 1000);
    return () => clearInterval(handle);
  }, []);

  return (
    <div className="p-6 bg-slate-950 border-2 border-slate-900 rounded-3xl text-slate-100 flex flex-col space-y-6 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-4">
        <div className="flex items-center space-x-3">
          <Wifi className="w-5 h-5 text-cyan-405 animate-pulse" />
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider font-mono">Live Telemetry Pulse & SNR monitor</h3>
            <p className="text-[10px] text-slate-500 font-mono">Direct realtime baseband receiver telemetry, displaying carrier signal SNR, drift loss, and amplifier output levels</p>
          </div>
        </div>
        <span className="text-[7.5px] font-mono uppercase bg-slate-900 text-cyan-405 border border-cyan-900/40 px-2 py-0.5 rounded animate-pulse">
          PULSE_MON
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Core telemetry specs left */}
        <div className="md:col-span-8 bg-slate-950/40 border border-slate-900 p-4 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
            <div className="bg-slate-950 border border-slate-900 p-3.5 rounded-2xl">
              <span className="text-[7.5px] text-slate-500 block">CARRIER SIGNAL SNR</span>
              <strong className="text-sm text-cyan-405 animate-pulse">{pulseSnr} dB</strong>
            </div>

            <div className="bg-slate-950 border border-slate-900 p-3.5 rounded-2xl">
              <span className="text-[7.5px] text-slate-500 block">RECEIVING AMPLIFIER POWER</span>
              <strong className="text-sm text-slate-205">{pulsePower} dBm</strong>
            </div>

            <div className="bg-slate-950 border border-slate-900 p-3.5 rounded-2xl">
              <span className="text-[7.5px] text-slate-500 block">CARRIER PACKET LOSS</span>
              <strong className="text-sm text-slate-205">{pulseLoss}%</strong>
            </div>
          </div>

          {/* Interactive visual layout mock sweep */}
          <div className="bg-black border border-slate-900 h-28 rounded-xl relative overflow-hidden flex items-center justify-center p-3 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:12px_12px] opacity-45"></div>
            <div className="absolute w-24 h-24 border border-cyan-900/10 rounded-full animate-ping" style={{ animationDuration: '6s' }}></div>

            <div className="relative z-10 font-mono space-y-1">
              <div className="text-[9.5px] font-black text-cyan-453 tracking-widest uppercase animate-pulse">
                RECEIVER STATUS COHERENCE: OPTIMAL_NOMINAL
              </div>
              <p className="text-[7px] text-slate-505 uppercase">
                Lock on polarizations complete. Carrier drift aligned with local digital frequency bounds.
              </p>
            </div>
          </div>
        </div>

        {/* Audit logs stats right */}
        <div className="md:col-span-4 bg-slate-950/40 border border-slate-900 p-4 rounded-2xl flex flex-col justify-between space-y-4 font-mono">
          <div className="space-y-4">
            <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest block">Pulse Audit Logs</span>

            <div className="bg-black border border-slate-900 p-3 h-44 rounded-xl overflow-y-auto scrollbar-none text-[7px] text-slate-400 space-y-1">
              {logs.map((log, idx) => (
                <div key={idx} className="truncate">
                  <span className="text-cyan-505 pr-1">▶</span> {log}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-900 pt-3 flex items-center justify-between text-[7px] text-slate-655 uppercase">
            <span>Receivers aligned with TSI-Space regulations</span>
            <span className="text-emerald-450 font-black flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> CONFIRMED
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
