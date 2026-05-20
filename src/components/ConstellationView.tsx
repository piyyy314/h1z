import React, { useState } from 'react';
import { Layers, Compass, Radio, RefreshCw, Star, Orbit } from 'lucide-react';

interface ConstellationState {
  orbitType: 'LEO' | 'MEO' | 'GEO';
  satCount: number;
  period: number; // minutes
  coherence: string;
}

export const ConstellationView: React.FC = () => {
  const [constState, setConstState] = useState<ConstellationState>({
    orbitType: 'LEO',
    satCount: 32,
    period: 90,
    coherence: '99.8%'
  });

  const handleSwitchOrbit = (type: 'LEO' | 'MEO' | 'GEO') => {
    const map = {
      LEO: { orbitType: 'LEO' as const, satCount: 32, period: 90, coherence: '99.8%' },
      MEO: { orbitType: 'MEO' as const, satCount: 16, period: 360, coherence: '98.5%' },
      GEO: { orbitType: 'GEO' as const, satCount: 8, period: 1440, coherence: '99.9%' }
    };
    setConstState(map[type]);
  };

  return (
    <div className="p-4 bg-slate-950 border-2 border-slate-900 rounded-3xl flex flex-col space-y-3.5 select-none shadow-lg">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-2">
        <label className="text-[8px] font-black uppercase tracking-widest text-slate-500 flex items-center space-x-1.5">
          <Orbit className="w-3.5 h-3.5 text-cyan-405 animate-spin" style={{ animationDuration: '8s' }} />
          <span>Active Tracking Constellations</span>
        </label>
        <span className="text-[7.5px] font-mono uppercase bg-slate-950 text-cyan-400 border border-slate-900 px-1 py-0.5 rounded">
          {constState.orbitType} FIELD
        </span>
      </div>

      {/* Selector switches */}
      <div className="grid grid-cols-3 gap-1.5 pt-0.5 font-mono text-[8px] font-black uppercase">
        {(['LEO', 'MEO', 'GEO'] as const).map(type => (
          <button
            key={type}
            onClick={() => handleSwitchOrbit(type)}
            className={`py-1 rounded-lg border transition ${
              constState.orbitType === type
                ? 'bg-cyan-950/40 border-cyan-500 text-cyan-405'
                : 'bg-slate-950 border-slate-900 text-slate-505 hover:text-slate-350'
            }`}
          >
            {type} Orbit
          </button>
        ))}
      </div>

      {/* Orbital visual radar mimic */}
      <div className="bg-black border border-slate-900 rounded-2xl h-24 relative overflow-hidden flex items-center justify-center p-3">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:10px_10px] opacity-40"></div>
        <div className="absolute w-12 h-12 border border-cyan-900/15 rounded-full animate-spin"></div>
        <div className="absolute w-20 h-20 border border-cyan-850/10 rounded-full"></div>

        <div className="relative z-10 text-center font-mono space-y-1">
          <div className="text-[9.5px] text-slate-205 font-bold uppercase">{constState.satCount} SATELLITES OPERATING</div>
          <p className="text-[6.5px] text-slate-505 uppercase">ORBITAL INTERCEPT HANDSHAKE VALID</p>
        </div>
      </div>

      {/* Metrics breakdown */}
      <div className="grid grid-cols-2 gap-2 text-[7.5px] font-mono text-center">
        <div className="bg-slate-100/5 p-2 rounded-xl border border-slate-900">
          <span className="text-slate-505 block uppercase">Orbital Period</span>
          <span className="text-cyan-405 font-black">{constState.period} Min</span>
        </div>
        <div className="bg-slate-100/5 p-2 rounded-xl border border-slate-900">
          <span className="text-slate-550 block uppercase">Signal Coherence</span>
          <span className="text-cyan-405 font-black">{constState.coherence}</span>
        </div>
      </div>

    </div>
  );
};
