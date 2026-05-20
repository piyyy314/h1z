import React, { useState, useEffect } from 'react';
import { Shield, KeyRound, RefreshCw, Zap } from 'lucide-react';

export const QuantumEntropy: React.FC = () => {
  const [entropyRate, setEntropyRate] = useState(7.984);
  const [keyHash, setKeyHash] = useState('D5_E7a9f_9c0b..81fa');
  const [isRotating, setIsRotating] = useState(false);

  // Auto rotate hashes to simulate cryptographic channel sync
  useEffect(() => {
    const handle = setInterval(() => {
      rotateKeys();
    }, 4000);
    return () => clearInterval(handle);
  }, []);

  const rotateKeys = () => {
    setIsRotating(true);
    // Mimic real-time computational cycle
    setTimeout(() => {
      const hexChars = '0123456789abcdef';
      let randomPart1 = '';
      let randomPart2 = '';
      for (let i = 0; i < 5; i++) {
        randomPart1 += hexChars[Math.floor(Math.random() * 16)];
        randomPart2 += hexChars[Math.floor(Math.random() * 16)];
      }
      setKeyHash(`D5_${randomPart1.toUpperCase()}_${randomPart2.toUpperCase()}..${Math.floor(Math.random() * 90 + 10)}X1`);
      // Simulative jitter to entropy level showing dynamic temperature shifts
      setEntropyRate(7.98 + (Math.random() - 0.5) * 0.03);
      setIsRotating(false);
    }, 450);
  };

  return (
    <div className="p-4 bg-slate-950/90 border-2 border-slate-800 rounded-3xl flex flex-col space-y-3 select-none shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
        <label className="text-[8px] font-black uppercase tracking-widest text-slate-500 flex items-center space-x-1.5">
          <Shield className="w-3.5 h-3.5 text-slate-650" />
          <span>Post-Quantum Channel Lock</span>
        </label>
        <span className="text-[7.5px] font-mono uppercase bg-purple-950/40 text-purple-400 border border-purple-900/40 px-1 py-0.5 rounded">
          Dilithium-5
        </span>
      </div>

      {/* Key Rotate Box */}
      <div className="bg-slate-950 border border-slate-900 rounded-2xl p-3 flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[7.5px] font-mono text-slate-500 uppercase tracking-widest flex items-center space-x-1">
            <KeyRound className="w-3 h-3 text-slate-600" />
            <span>Active Payload Key-ID</span>
          </span>
          <button
            onClick={rotateKeys}
            disabled={isRotating}
            className="p-1 rounded bg-slate-900 hover:bg-slate-850 text-slate-450 hover:text-cyan-400 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin text-cyan-405' : ''}`} />
          </button>
        </div>

        <div className="font-mono text-[10px] bg-black/50 p-2 border border-slate-900 rounded-xl flex items-center justify-between select-all leading-none text-slate-200">
          <span>{keyHash}</span>
          <span className="text-[7px] text-slate-600 uppercase font-black tracking-widest pl-2">SECURE</span>
        </div>
      </div>

      {/* Entropy Scale Meter */}
      <div className="bg-slate-950 border border-slate-900 rounded-2xl p-3 flex flex-col space-y-2">
        <div className="flex items-center justify-between text-[7px] font-mono text-slate-500 uppercase tracking-widest">
          <span>Shannons Entropy Metric</span>
          <span className="text-cyan-400 font-extrabold">{entropyRate.toFixed(4)} bits/byte</span>
        </div>

        {/* Small horizontal gauge slider */}
        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-900">
          <div 
            className="h-full bg-gradient-to-r from-cyan-600 via-sky-500 to-purple-505 rounded-full transition-all duration-500"
            style={{ width: `${(entropyRate / 8) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[6.5px] font-mono text-slate-500 uppercase tracking-widest leading-none pt-0.5">
          <span>MIN_RATED: 7.95</span>
          <span className="text-emerald-450 font-bold">STATE: MAX_RANDOM_LOCKED</span>
        </div>
      </div>
    </div>
  );
};
