import React, { useRef, useState } from 'react';
import { Compass, Crosshair, MapPin, Navigation, Orbit } from 'lucide-react';
import { Coordinates, Satellite } from '../types.ts';

interface TacticalMapProps {
  userLoc: Coordinates;
  satellite: Satellite;
  isTracking: boolean;
  isStealthMode: boolean;
  onLocChange: (loc: Coordinates) => void;
}

export const TacticalMap: React.FC<TacticalMapProps> = ({
  userLoc,
  satellite,
  isTracking,
  isStealthMode,
  onLocChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverCoord, setHoverCoord] = useState<Coordinates | null>(null);

  // Quick helper to map relative clicks back into typical Latitude [-90, 90] and Longitude [-180, 180] values
  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert pixel mapping to coordinate space:
    // Left edge (x=0) matches Lng -180, Right edge (x=rect.width) matches Lng 180
    // Top edge (y=0) matches Lat 90, Bottom edge (y=rect.height) matches Lat -90
    const lng = -180 + (x / rect.width) * 360;
    const lat = 90 - (y / rect.height) * 180;

    onLocChange({
      lat: Math.max(-90, Math.min(90, lat)),
      lng: Math.max(-180, Math.min(180, lng))
    });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const lng = -180 + (x / rect.width) * 360;
    const lat = 90 - (y / rect.height) * 180;

    setHoverCoord({
      lat: Math.max(-90, Math.min(90, lat)),
      lng: Math.max(-180, Math.min(180, lng))
    });
  };

  const handleMouseLeave = () => {
    setHoverCoord(null);
  };

  // Convert real coordinates to flat percentage coordinates for SVG viewport [0-100]
  const getSvgCoords = (coords: Coordinates) => {
    const x = ((coords.lng + 180) / 360) * 100;
    const y = ((90 - coords.lat) / 180) * 100;
    return { x, y };
  };

  const userSvg = getSvgCoords(userLoc);
  // Geostationary satellites sit directly over the Equator (latitude 0)
  const satEquatorialLoc = { lat: 0, lng: satellite.longitude };
  const satSvg = getSvgCoords(satEquatorialLoc);

  return (
    <div className={`p-4 rounded-3xl border-2 transition-all duration-300 relative overflow-hidden flex flex-col space-y-3.5 select-none ${
      isStealthMode 
        ? 'bg-black border-purple-950/50 shadow-[inset_0_0_24px_rgba(168,85,247,0.03)]' 
        : 'bg-slate-950/90 border-slate-800 shadow-lg'
    }`}>
      {/* HUD Header */}
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
        <div className="flex items-center space-x-2">
          <Compass className={`w-3.5 h-3.5 ${isStealthMode ? 'text-purple-400' : 'text-cyan-400'} animate-spin-slow`} />
          <span className="text-[9px] font-black tracking-widest uppercase text-slate-300 font-mono">
            CYBER_ORBITAL_PLOTTING
          </span>
        </div>
        <span className="text-[7px] font-mono text-slate-500 tracking-wider">
          CALIBRATION: STABLE
        </span>
      </div>

      {/* Grid Canvas Map Workspace */}
      <div 
        ref={containerRef}
        className="relative aspect-[2/1] w-full rounded-2xl bg-black border border-slate-900 overflow-hidden cursor-crosshair group"
      >
        {/* Dynamic sweeping overlay */}
        <div className={`absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03] ${
          isStealthMode ? 'bg-purple-500' : 'bg-cyan-500'
        } animate-pulse`}></div>

        <svg 
          className="w-full h-full absolute inset-0 z-10" 
          viewBox="0 0 100 50" 
          onClick={handleMapClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* EQUATOR GRID LINES */}
          <line x1="0" y1="25" x2="100" y2="25" stroke="#334155" strokeWidth="0.15" strokeDasharray="1,1" />
          {/* MERIDIAN LINE */}
          <line x1="50" y1="0" x2="50" y2="50" stroke="#334155" strokeWidth="0.15" strokeDasharray="1,1" />
          
          {/* Latitude guide notches */}
          <line x1="0" y1="12.5" x2="100" y2="12.5" stroke="#1e293b" strokeWidth="0.1" />
          <line x1="0" y1="37.5" x2="100" y2="37.5" stroke="#1e293b" strokeWidth="0.1" />
          {/* Longitude guide notches */}
          <line x1="25" y1="0" x2="25" y2="50" stroke="#1e293b" strokeWidth="0.1" />
          <line x1="75" y1="0" x2="75" y2="50" stroke="#1e293b" strokeWidth="0.1" />

          {/* Reference cities/bases plotting dots for world aesthetic */}
          <g fill="#475569" opacity="0.35">
            {/* Norfolk Station */}
            <circle cx="28.6" cy="14.8" r="0.6" />
            {/* Svalbard Base */}
            <circle cx="54.3" cy="3.3" r="0.6" />
            {/* Doha */}
            <circle cx="64.3" cy="18.0" r="0.6" />
            {/* Pine Gap */}
            <circle cx="87.1" cy="34.4" r="0.6" />
            {/* Falklands */}
            <circle cx="34.0" cy="39.8" r="0.6" />
            {/* Hawaii */}
            <circle cx="5.0" cy="20.0" r="0.6" />
          </g>

          {/* SATELLITE BEAM COVERAGE / PLOTTING ENVELOPE */}
          <circle 
            cx={satSvg.x} 
            cy={satSvg.y} 
            r="16" 
            fill="transparent" 
            stroke={isStealthMode ? "#a855f7" : "#06b6d4"} 
            strokeWidth="0.18" 
            strokeDasharray="1,1" 
            opacity="0.38"
          />

          {/* REALTIME TRACING VECTOR FROM STATION TO GEOSCIENTIFIC NODE */}
          <line 
            x1={userSvg.x} 
            y1={userSvg.y} 
            x2={satSvg.x} 
            y2={satSvg.y} 
            stroke={isStealthMode ? "#d8b4fe" : "#22d3ee"} 
            strokeWidth="0.25" 
            strokeDasharray="0.8,0.8" 
            className="animate-pulse"
          />

          {/* OPERATOR LOCATION CARD PIN */}
          <g transform={`translate(${userSvg.x - 1}, ${userSvg.y - 1})`}>
            {/* Pulsing visual halo */}
            <circle cx="1" cy="1" r="2.8" fill="transparent" stroke={isStealthMode ? "#c084fc" : "#22d3ee"} strokeWidth="0.15" className="animate-ping" style={{ transformOrigin: '1px 1px' }} />
            <circle cx="1" cy="1" r="0.9" fill={isStealthMode ? "#a855f7" : "#06b6d4"} />
            <line x1="1" y1="-1" x2="1" y2="3" stroke={isStealthMode ? "#c084fc" : "#22d3ee"} strokeWidth="0.1" />
            <line x1="-1" y1="1" x2="3" y2="1" stroke={isStealthMode ? "#c084fc" : "#22d3ee"} strokeWidth="0.1" />
          </g>

          {/* TARGET SATELLITE LONGITUDE POSITION MARK */}
          <g transform={`translate(${satSvg.x - 1.2}, ${satSvg.y - 1.2})`}>
            <circle cx="1.2" cy="1.2" r="1.4" fill="transparent" stroke={isStealthMode ? "#d8b4fe" : "#38bdf8"} strokeWidth="0.15" />
            <rect x="0.8" y="0.8" width="0.8" height="0.8" fill={isStealthMode ? "#c084fc" : "#38bdf8"} />
          </g>
        </svg>

        {/* Floating crosshair details */}
        <div className="absolute left-2.5 bottom-2.5 pointer-events-none font-mono text-[7px] text-slate-500 uppercase space-y-0.5 z-20">
          <div>SAT STRAW SLOT: {satellite.orbitalSlot}</div>
          <div>EST_RADIAL: {(Math.abs(userLoc.lng - satellite.longitude)).toFixed(1)}° Offset</div>
        </div>

        {/* Hover coordinate label */}
        {hoverCoord && (
          <div className="absolute right-2.5 top-2.5 bg-slate-950/90 border border-slate-800/80 px-2 py-1 rounded text-[7.5px] font-mono text-cyan-400 pointer-events-none z-20 animate-in fade-in duration-100">
            LOC: {hoverCoord.lat.toFixed(2)}N, {hoverCoord.lng.toFixed(2)}E
          </div>
        )}
      </div>

      {/* Click mapping prompt */}
      <div className="flex items-center justify-between text-[7px] font-mono text-slate-500 uppercase tracking-widest px-0.5">
        <span className="flex items-center space-x-1">
          <Crosshair className="w-3 h-3 text-slate-650" />
          <span>Click Grid Array to Manual Repoint</span>
        </span>
        <span className={isStealthMode ? 'text-purple-400' : 'text-cyan-400 font-extrabold'}>
          {satellite.name.toUpperCase()} LOCK
        </span>
      </div>
    </div>
  );
};
