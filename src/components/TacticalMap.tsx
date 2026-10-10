import React, { useRef, useState, useMemo } from 'react';
import { 
  Compass, Crosshair, MapPin, Navigation, Orbit, ShieldAlert, 
  Radio, WifiOff, AlertTriangle, CloudRain, Zap, Eye, EyeOff,
  Filter, Info, X, ChevronRight, Activity, Layers, ShieldCheck
} from 'lucide-react';
import { Coordinates, Satellite } from '../types.ts';
import { audioController } from '../services/audioService.ts';
import {
  StrategicZone,
  StrategicZoneType,
  SeverityLevel,
  TelemetryState,
  convertCoordsToSvg,
  calculateDistanceKm,
  calculateDistanceDeg,
  buildLiveStrategicZones,
  evaluateThreatEnvironment
} from '../utils/strategicOverlayUtils.ts';

interface TacticalMapProps {
  userLoc: Coordinates;
  satellite: Satellite;
  isTracking: boolean;
  isStealthMode: boolean;
  onLocChange: (loc: Coordinates) => void;
  telemetry?: TelemetryState;
  isJamming?: boolean;
  jammingPower?: number;
  weather?: string;
}

export const TacticalMap: React.FC<TacticalMapProps> = ({
  userLoc,
  satellite,
  isTracking,
  isStealthMode,
  onLocChange,
  telemetry,
  isJamming = false,
  jammingPower = 20,
  weather = 'CLEAR'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverCoord, setHoverCoord] = useState<Coordinates | null>(null);

  // Strategic Overlay Controls
  const [isOverlayEnabled, setIsOverlayEnabled] = useState<boolean>(true);
  const [layerFilters, setLayerFilters] = useState<Record<StrategicZoneType, boolean>>({
    restricted_airspace: true,
    jamming_zone: true,
    interference_area: true
  });
  const [selectedZone, setSelectedZone] = useState<StrategicZone | null>(null);
  const [hoveredZone, setHoveredZone] = useState<StrategicZone | null>(null);

  // Toggle master overlay
  const handleToggleOverlay = () => {
    const nextState = !isOverlayEnabled;
    setIsOverlayEnabled(nextState);
    if (!nextState) {
      setSelectedZone(null);
      setHoveredZone(null);
    }
    audioController.playBeep(nextState ? 960 : 440, 'triangle', 0.08);
  };

  // Toggle specific layer
  const handleToggleLayer = (type: StrategicZoneType, e: React.MouseEvent) => {
    e.stopPropagation();
    setLayerFilters(prev => ({ ...prev, [type]: !prev[type] }));
    audioController.playBeep(780, 'sine', 0.05);
  };

  // Build reactive real-time zones based on telemetry & environment
  const allZones = useMemo(() => {
    return buildLiveStrategicZones(userLoc, telemetry, isJamming, jammingPower, weather);
  }, [userLoc, telemetry, isJamming, jammingPower, weather]);

  // Filter visible zones
  const visibleZones = useMemo(() => {
    if (!isOverlayEnabled) return [];
    return allZones.filter(z => layerFilters[z.type]);
  }, [allZones, isOverlayEnabled, layerFilters]);

  // Evaluate current operator proximity and threats
  const threatEval = useMemo(() => {
    return evaluateThreatEnvironment(userLoc, allZones);
  }, [userLoc, allZones]);

  // Quick helper to map relative clicks back into typical Latitude [-90, 90] and Longitude [-180, 180] values
  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const lng = -180 + (x / rect.width) * 360;
    const lat = 90 - (y / rect.height) * 180;

    const newLoc = {
      lat: Math.max(-90, Math.min(90, lat)),
      lng: Math.max(-180, Math.min(180, lng))
    };

    onLocChange(newLoc);
    audioController.playBeep(840, 'sine', 0.04);
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

  // Convert real coordinates to flat percentage coordinates for SVG viewport [100x50]
  const userSvg = convertCoordsToSvg(userLoc);
  // Geostationary satellites sit directly over the Equator (latitude 0)
  const satEquatorialLoc = { lat: 0, lng: satellite.longitude };
  const satSvg = convertCoordsToSvg(satEquatorialLoc);

  // Inspector card zone to show
  const activeInspectorZone = hoveredZone || selectedZone;

  return (
    <div className={`p-4 rounded-3xl border-2 transition-all duration-300 relative overflow-hidden flex flex-col space-y-3.5 select-none ${
      isStealthMode 
        ? 'bg-black border-purple-950/50 shadow-[inset_0_0_24px_rgba(168,85,247,0.03)]' 
        : 'bg-slate-950/90 border-slate-800 shadow-lg'
    }`}>
      {/* HUD Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 pb-2.5">
        <div className="flex items-center space-x-2">
          <Compass className={`w-3.5 h-3.5 ${isStealthMode ? 'text-purple-400' : 'text-cyan-400'} animate-spin-slow`} />
          <span className="text-[10px] font-black tracking-widest uppercase text-slate-200 font-mono">
            TACTICAL_GEOSPATIAL_RADAR
          </span>
          <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
            WGS-84 / GEO
          </span>
        </div>

        {/* Strategic Overlay Master Toggle & Layer Filters */}
        <div className="flex items-center space-x-1.5 flex-wrap">
          <button
            onClick={handleToggleOverlay}
            className={`px-2 py-1 rounded-md text-[8px] font-mono font-bold tracking-wider uppercase transition-all duration-200 flex items-center space-x-1.5 border shadow-sm ${
              isOverlayEnabled
                ? 'bg-red-950/50 border-red-500/60 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                : 'bg-slate-900/80 border-slate-750 text-slate-400 hover:text-slate-200 hover:border-slate-600'
            }`}
            title="Toggle Strategic Overlay displaying restricted airspace, EW jamming zones, and high-risk interference areas"
          >
            <ShieldAlert className={`w-3 h-3 ${isOverlayEnabled ? 'text-red-400 animate-pulse' : 'text-slate-500'}`} />
            <span>STRATEGIC OVERLAY</span>
            <span className={`w-1.5 h-1.5 rounded-full ${isOverlayEnabled ? 'bg-red-400 animate-ping' : 'bg-slate-600'}`} />
          </button>

          {/* Sub-layer toggles visible when overlay is enabled */}
          {isOverlayEnabled && (
            <div className="flex items-center space-x-1 bg-slate-900/90 border border-slate-800 rounded-md p-0.5">
              <button
                onClick={(e) => handleToggleLayer('restricted_airspace', e)}
                className={`px-1.5 py-0.5 rounded text-[7px] font-mono uppercase transition-all flex items-center space-x-1 ${
                  layerFilters.restricted_airspace
                    ? 'bg-red-500/20 text-red-400 font-bold border border-red-500/40'
                    : 'text-slate-500 hover:text-slate-400'
                }`}
                title="Toggle Restricted Airspace (SUA, Prohibited, ADIZ)"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block"></span>
                <span>AIRSPACE (6)</span>
              </button>

              <button
                onClick={(e) => handleToggleLayer('jamming_zone', e)}
                className={`px-1.5 py-0.5 rounded text-[7px] font-mono uppercase transition-all flex items-center space-x-1 ${
                  layerFilters.jamming_zone
                    ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/40'
                    : 'text-slate-500 hover:text-slate-400'
                }`}
                title="Toggle EW Jamming Zones & GNSS Spoofing Corridors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"></span>
                <span>JAMMING ({isJamming ? '6' : '5'})</span>
              </button>

              <button
                onClick={(e) => handleToggleLayer('interference_area', e)}
                className={`px-1.5 py-0.5 rounded text-[7px] font-mono uppercase transition-all flex items-center space-x-1 ${
                  layerFilters.interference_area
                    ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40'
                    : 'text-slate-500 hover:text-slate-400'
                }`}
                title="Toggle Scintillation & High-Risk Atmospheric Interference"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block"></span>
                <span>INTERFERENCE (5)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Real-Time Telemetry Hazard Alert Banner */}
      {isOverlayEnabled && (
        <div className={`p-2 rounded-xl border text-[8px] font-mono flex items-center justify-between transition-all duration-300 ${
          threatEval.overallThreatLevel === 'CRITICAL'
            ? 'bg-red-950/70 border-red-600/80 text-red-200 shadow-[0_0_16px_rgba(239,68,68,0.25)] animate-pulse'
            : threatEval.overallThreatLevel === 'HIGH'
            ? 'bg-amber-950/60 border-amber-600/70 text-amber-200'
            : isJamming
            ? 'bg-amber-950/50 border-amber-500/60 text-amber-300'
            : 'bg-slate-900/60 border-slate-800 text-slate-400'
        }`}>
          <div className="flex items-center space-x-2 truncate">
            {threatEval.overallThreatLevel === 'CRITICAL' || isJamming ? (
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 animate-bounce" />
            ) : threatEval.overallThreatLevel === 'HIGH' ? (
              <Radio className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            )}
            <span className="font-bold uppercase tracking-wide truncate">
              {isJamming && threatEval.overallThreatLevel !== 'CRITICAL'
                ? `[EW THREAT DETECTED] ACTIVE JAMMING EMITTER (${jammingPower} dBm) - TELEMETRY DEGRADED`
                : threatEval.advisoryText}
            </span>
          </div>

          <div className="flex items-center space-x-2 shrink-0 pl-2">
            {telemetry && (
              <span className={`px-1.5 py-0.5 rounded text-[7px] font-bold ${
                Number(telemetry.snr) < 5 ? 'bg-red-600 text-white' : Number(telemetry.snr) < 10 ? 'bg-amber-500/30 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                SNR: {telemetry.snr} dB
              </span>
            )}
            <span className="text-[7px] text-slate-500">
              {visibleZones.length} ZONES ACTIVE
            </span>
          </div>
        </div>
      )}

      {/* Grid Canvas Map Workspace */}
      <div 
        ref={containerRef}
        className="relative aspect-[2/1] w-full rounded-2xl bg-black border border-slate-900 overflow-hidden cursor-crosshair group shadow-inner"
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
          {/* DEFINITIONS FOR STRATEGIC OVERLAY PATTERNS & GRADIENTS */}
          <defs>
            {/* Restricted Airspace Diagonal Crosshatch */}
            <pattern id="restricted-hatch" width="1.5" height="1.5" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="1.5" stroke="#ef4444" strokeWidth="0.25" opacity="0.6" />
            </pattern>

            {/* Jamming Radial / Wave Pattern */}
            <pattern id="jamming-dots" width="1.2" height="1.2" patternUnits="userSpaceOnUse">
              <circle cx="0.6" cy="0.6" r="0.25" fill="#f59e0b" opacity="0.5" />
            </pattern>

            {/* Scintillation / Interference Wave Pattern */}
            <pattern id="scintillation-wave" width="2" height="2" patternUnits="userSpaceOnUse">
              <path d="M 0 1 Q 0.5 0, 1 1 T 2 1" fill="none" stroke="#a855f7" strokeWidth="0.2" opacity="0.4" />
            </pattern>

            {/* Jamming Radial Gradient */}
            <radialGradient id="jamming-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </radialGradient>

            {/* Restricted Airspace Glow */}
            <radialGradient id="restricted-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
              <stop offset="70%" stopColor="#ef4444" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
            </radialGradient>

            {/* Interference Glow */}
            <radialGradient id="scintillation-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.35" />
              <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
            </radialGradient>
          </defs>

          {/* SIMPLIFIED TACTICAL CONTINENT CONTOURS FOR GEOGRAPHICAL ORIENTATION */}
          <g fill="#1e293b" fillOpacity="0.28" stroke="#334155" strokeWidth="0.12" strokeOpacity="0.35">
            {/* North America */}
            <path d="M 4.2 6.5 L 14.5 4.5 L 24.8 5.8 L 32.5 12.0 L 27.2 16.5 L 29.5 21.0 L 24.5 20.2 L 20.0 24.5 L 17.5 20.8 L 9.0 16.0 Z" />
            {/* Greenland */}
            <path d="M 33.0 2.5 L 43.5 3.0 L 40.5 7.8 L 32.5 6.0 Z" />
            {/* South America */}
            <path d="M 27.5 24.5 L 34.0 24.0 L 38.5 28.5 L 36.5 38.5 L 32.0 42.0 L 28.5 35.0 L 26.5 27.5 Z" />
            {/* Eurasia */}
            <path d="M 47.5 7.5 L 56.0 5.0 L 72.0 6.0 L 89.0 7.5 L 94.5 14.0 L 88.0 21.0 L 78.5 21.0 L 72.0 26.0 L 63.5 20.5 L 54.0 22.0 L 47.5 17.0 Z" />
            {/* British Isles */}
            <path d="M 47.0 10.5 L 49.5 9.5 L 49.0 13.0 L 46.5 13.0 Z" />
            {/* Africa */}
            <path d="M 45.5 17.5 L 59.0 17.0 L 64.0 23.0 L 59.5 34.0 L 52.0 37.5 L 48.0 30.5 L 44.5 21.5 Z" />
            {/* Australia */}
            <path d="M 81.0 28.5 L 91.5 27.5 L 93.0 34.0 L 86.5 38.0 L 80.5 34.0 Z" />
            {/* Japan Arc */}
            <path d="M 87.0 15.0 L 89.0 13.5 L 91.0 17.0 L 88.5 18.5 Z" />
            {/* Antarctica Ice Shelf */}
            <path d="M 0 47.5 L 100 47.5 L 100 50 L 0 50 Z" />
          </g>

          {/* EQUATOR GRID LINE */}
          <line x1="0" y1="25" x2="100" y2="25" stroke="#334155" strokeWidth="0.18" strokeDasharray="1,1" />
          {/* MERIDIAN LINE (PRIME MERIDIAN) */}
          <line x1="50" y1="0" x2="50" y2="50" stroke="#334155" strokeWidth="0.18" strokeDasharray="1,1" />
          
          {/* Latitude guide notches */}
          <line x1="0" y1="12.5" x2="100" y2="12.5" stroke="#1e293b" strokeWidth="0.1" />
          <line x1="0" y1="37.5" x2="100" y2="37.5" stroke="#1e293b" strokeWidth="0.1" />
          {/* Longitude guide notches */}
          <line x1="25" y1="0" x2="25" y2="50" stroke="#1e293b" strokeWidth="0.1" />
          <line x1="75" y1="0" x2="75" y2="50" stroke="#1e293b" strokeWidth="0.1" />

          {/* Reference cities/bases plotting dots for world aesthetic */}
          <g fill="#475569" opacity="0.4">
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
            {/* Diego Garcia */}
            <circle cx="70.1" cy="27.0" r="0.6" />
            {/* Guam */}
            <circle cx="89.5" cy="21.3" r="0.6" />
          </g>

          {/* STRATEGIC OVERLAY ZONES RENDERING */}
          {isOverlayEnabled && visibleZones.map((zone) => {
            const svgPos = convertCoordsToSvg(zone.center);
            // 1 degree in equirectangular projection matches (5 / 18) SVG units
            const svgRadius = Math.max(1.2, zone.radiusDeg * (5 / 18));
            const isHovered = hoveredZone?.id === zone.id;
            const isSelected = selectedZone?.id === zone.id;
            const isInside = threatEval.insideZones.some(z => z.id === zone.id);

            if (zone.type === 'restricted_airspace') {
              return (
                <g 
                  key={zone.id} 
                  className="cursor-pointer transition-all duration-200"
                  onClick={(e) => { e.stopPropagation(); setSelectedZone(zone); }}
                  onMouseEnter={() => setHoveredZone(zone)}
                  onMouseLeave={() => setHoveredZone(null)}
                >
                  {/* Glowing background fill */}
                  <circle 
                    cx={svgPos.x} 
                    cy={svgPos.y} 
                    r={svgRadius} 
                    fill="url(#restricted-glow)" 
                  />
                  {/* Diagonal crosshatch fill */}
                  <circle 
                    cx={svgPos.x} 
                    cy={svgPos.y} 
                    r={svgRadius} 
                    fill="url(#restricted-hatch)" 
                    stroke="#ef4444" 
                    strokeWidth={isSelected || isHovered ? 0.45 : isInside ? 0.35 : 0.22} 
                    strokeDasharray="0.8,0.5" 
                    className={isInside ? 'animate-pulse' : ''}
                  />
                  {/* Center beacon dot */}
                  <circle 
                    cx={svgPos.x} 
                    cy={svgPos.y} 
                    r="0.5" 
                    fill="#ef4444" 
                  />
                  {/* Active breach halo ring */}
                  {isInside && (
                    <circle 
                      cx={svgPos.x} 
                      cy={svgPos.y} 
                      r={svgRadius * 1.15} 
                      fill="none" 
                      stroke="#ef4444" 
                      strokeWidth="0.25" 
                      className="animate-ping" 
                      style={{ transformOrigin: `${svgPos.x}px ${svgPos.y}px` }}
                    />
                  )}
                  {/* Mini Tactical Label */}
                  <text 
                    x={svgPos.x} 
                    y={svgPos.y - svgRadius - 0.6} 
                    textAnchor="middle" 
                    fill="#fca5a5" 
                    fontSize="1.1" 
                    fontWeight="bold"
                    fontFamily="monospace"
                    className="pointer-events-none select-none drop-shadow"
                  >
                    {zone.designator.split('/')[0].trim()}
                  </text>
                </g>
              );
            }

            if (zone.type === 'jamming_zone') {
              return (
                <g 
                  key={zone.id} 
                  className="cursor-pointer transition-all duration-200"
                  onClick={(e) => { e.stopPropagation(); setSelectedZone(zone); }}
                  onMouseEnter={() => setHoveredZone(zone)}
                  onMouseLeave={() => setHoveredZone(null)}
                >
                  {/* Amber gradient radial */}
                  <circle 
                    cx={svgPos.x} 
                    cy={svgPos.y} 
                    r={svgRadius} 
                    fill="url(#jamming-glow)" 
                  />
                  {/* Jamming dot pattern */}
                  <circle 
                    cx={svgPos.x} 
                    cy={svgPos.y} 
                    r={svgRadius} 
                    fill="url(#jamming-dots)" 
                    stroke="#f59e0b" 
                    strokeWidth={isSelected || isHovered ? 0.45 : zone.isDynamic ? 0.38 : 0.22} 
                    strokeDasharray="0.9,0.6" 
                    className={zone.isDynamic || isJamming ? 'animate-pulse' : ''}
                  />
                  {/* Concentric EW Interference Ripples */}
                  <circle 
                    cx={svgPos.x} 
                    cy={svgPos.y} 
                    r={svgRadius * 0.6} 
                    fill="none" 
                    stroke="#fbbf24" 
                    strokeWidth="0.15" 
                    strokeDasharray="0.4,0.4"
                  />
                  {/* Dynamic jamming emitter ping */}
                  {(zone.isDynamic || isInside) && (
                    <circle 
                      cx={svgPos.x} 
                      cy={svgPos.y} 
                      r={svgRadius * 1.2} 
                      fill="none" 
                      stroke="#f59e0b" 
                      strokeWidth="0.25" 
                      className="animate-ping" 
                      style={{ transformOrigin: `${svgPos.x}px ${svgPos.y}px` }}
                    />
                  )}
                  {/* Center transmitter mark */}
                  <circle 
                    cx={svgPos.x} 
                    cy={svgPos.y} 
                    r="0.55" 
                    fill="#fbbf24" 
                  />
                  {/* Mini Tactical Label */}
                  <text 
                    x={svgPos.x} 
                    y={svgPos.y - svgRadius - 0.6} 
                    textAnchor="middle" 
                    fill="#fde68a" 
                    fontSize="1.1" 
                    fontWeight="bold"
                    fontFamily="monospace"
                    className="pointer-events-none select-none drop-shadow"
                  >
                    {zone.designator.split('/')[0].trim()}
                  </text>
                </g>
              );
            }

            // High-Risk Interference Areas (Scintillation / Atmospheric Fade)
            return (
              <g 
                key={zone.id} 
                className="cursor-pointer transition-all duration-200"
                onClick={(e) => { e.stopPropagation(); setSelectedZone(zone); }}
                onMouseEnter={() => setHoveredZone(zone)}
                onMouseLeave={() => setHoveredZone(null)}
              >
                <circle 
                  cx={svgPos.x} 
                  cy={svgPos.y} 
                  r={svgRadius} 
                  fill="url(#scintillation-glow)" 
                />
                <circle 
                  cx={svgPos.x} 
                  cy={svgPos.y} 
                  r={svgRadius} 
                  fill="url(#scintillation-wave)" 
                  stroke="#a855f7" 
                  strokeWidth={isSelected || isHovered ? 0.45 : 0.2} 
                  strokeDasharray="0.6,0.6" 
                />
                <circle 
                  cx={svgPos.x} 
                  cy={svgPos.y} 
                  r="0.5" 
                  fill="#c084fc" 
                />
                {/* Mini Tactical Label */}
                <text 
                  x={svgPos.x} 
                  y={svgPos.y - svgRadius - 0.6} 
                  textAnchor="middle" 
                  fill="#d8b4fe" 
                  fontSize="1.1" 
                  fontWeight="bold"
                  fontFamily="monospace"
                  className="pointer-events-none select-none drop-shadow"
                >
                  {zone.designator.split('/')[0].trim()}
                </text>
              </g>
            );
          })}

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
            {/* If operator is breached, pulse crimson danger ring */}
            {threatEval.insideZones.length > 0 ? (
              <circle 
                cx="1" 
                cy="1" 
                r="3.5" 
                fill="transparent" 
                stroke="#ef4444" 
                strokeWidth="0.22" 
                className="animate-ping" 
                style={{ transformOrigin: '1px 1px' }} 
              />
            ) : (
              <circle 
                cx="1" 
                cy="1" 
                r="2.8" 
                fill="transparent" 
                stroke={isStealthMode ? "#c084fc" : "#22d3ee"} 
                strokeWidth="0.15" 
                className="animate-ping" 
                style={{ transformOrigin: '1px 1px' }} 
              />
            )}
            <circle cx="1" cy="1" r="0.9" fill={threatEval.insideZones.length > 0 ? "#ef4444" : isStealthMode ? "#a855f7" : "#06b6d4"} />
            <line x1="1" y1="-1" x2="1" y2="3" stroke={threatEval.insideZones.length > 0 ? "#ef4444" : isStealthMode ? "#c084fc" : "#22d3ee"} strokeWidth="0.1" />
            <line x1="-1" y1="1" x2="3" y2="1" stroke={threatEval.insideZones.length > 0 ? "#ef4444" : isStealthMode ? "#c084fc" : "#22d3ee"} strokeWidth="0.1" />
          </g>

          {/* TARGET SATELLITE LONGITUDE POSITION MARK (EQUATOR) */}
          <g transform={`translate(${satSvg.x - 1.2}, ${satSvg.y - 1.2})`}>
            <circle cx="1.2" cy="1.2" r="1.4" fill="transparent" stroke={isStealthMode ? "#d8b4fe" : "#38bdf8"} strokeWidth="0.15" />
            <rect x="0.8" y="0.8" width="0.8" height="0.8" fill={isStealthMode ? "#c084fc" : "#38bdf8"} />
          </g>
        </svg>

        {/* Floating telemetry & orbital slot indicators */}
        <div className="absolute left-2.5 bottom-2.5 pointer-events-none font-mono text-[7px] text-slate-500 uppercase space-y-0.5 z-20">
          <div>SAT STRAW SLOT: {satellite.orbitalSlot}</div>
          <div>EST_RADIAL: {(Math.abs(userLoc.lng - satellite.longitude)).toFixed(1)}° Offset</div>
          {isOverlayEnabled && (
            <div className="text-cyan-400/80">
              OVERLAY_ENGAGED: {visibleZones.length} THREAT SECTORS
            </div>
          )}
        </div>

        {/* Hover coordinate label */}
        {hoverCoord && (
          <div className="absolute right-2.5 top-2.5 bg-slate-950/90 border border-slate-800/80 px-2 py-1 rounded text-[7.5px] font-mono text-cyan-400 pointer-events-none z-20 animate-in fade-in duration-100">
            LOC: {hoverCoord.lat.toFixed(2)}N, {hoverCoord.lng.toFixed(2)}E
          </div>
        )}
      </div>

      {/* STRATEGIC ZONE INSPECTOR PANEL (When a zone is selected or hovered) */}
      {isOverlayEnabled && activeInspectorZone && (
        <div className="p-3 rounded-2xl bg-slate-900/95 border border-slate-750 shadow-xl text-[8px] font-mono space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <div className="flex items-center space-x-2">
              <span className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase ${
                activeInspectorZone.type === 'restricted_airspace' 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40' 
                  : activeInspectorZone.type === 'jamming_zone'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
              }`}>
                {activeInspectorZone.type.replace('_', ' ')}
              </span>

              <span className="font-bold text-slate-200 text-[9px]">
                {activeInspectorZone.name}
              </span>

              <span className="text-slate-400">
                [{activeInspectorZone.designator}]
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className={`px-1.5 py-0.5 rounded text-[7px] font-bold ${
                activeInspectorZone.severity === 'CRITICAL'
                  ? 'bg-red-600 text-white animate-pulse'
                  : activeInspectorZone.severity === 'HIGH'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-cyan-500/20 text-cyan-300'
              }`}>
                SEVERITY: {activeInspectorZone.severity}
              </span>

              {selectedZone && (
                <button
                  onClick={() => setSelectedZone(null)}
                  className="text-slate-400 hover:text-slate-200 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
            <div className="space-y-1">
              <div className="text-slate-400">
                <span className="text-slate-500">CENTER / RADIUS: </span>
                {activeInspectorZone.center.lat.toFixed(2)}°, {activeInspectorZone.center.lng.toFixed(2)}° (R: {activeInspectorZone.radiusDeg.toFixed(1)}° / ~{Math.round(activeInspectorZone.radiusDeg * 111)} km)
              </div>
              <div>
                <span className="text-slate-500">BAND / CEILING: </span>
                {activeInspectorZone.altitudeBand || activeInspectorZone.frequencyBand || 'ALL ALTITUDES'}
              </div>
              <div className="text-slate-400">
                {activeInspectorZone.description}
              </div>
            </div>

            <div className="space-y-1 bg-slate-950/80 p-2 rounded-xl border border-slate-800">
              <div className="text-amber-300/90 font-medium">
                <span className="text-slate-500">TELEMETRY IMPACT: </span>
                {activeInspectorZone.telemetryImpact}
              </div>
              <div className="text-emerald-400/90 font-medium">
                <span className="text-slate-500">RECOMMENDED ACTION: </span>
                {activeInspectorZone.recommendedAction}
              </div>
              <div className="text-slate-400 pt-0.5 border-t border-slate-850 flex justify-between items-center">
                <span>DISTANCE TO OPERATOR: {calculateDistanceKm(userLoc, activeInspectorZone.center)} km</span>
                <button
                  onClick={() => {
                    onLocChange({ lat: activeInspectorZone.center.lat, lng: activeInspectorZone.center.lng });
                    audioController.playBeep(880, 'sine', 0.05);
                  }}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[7px] font-bold"
                >
                  REPOSITION STATION HERE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click mapping prompt */}
      <div className="flex items-center justify-between text-[7px] font-mono text-slate-500 uppercase tracking-widest px-0.5">
        <span className="flex items-center space-x-1">
          <Crosshair className="w-3 h-3 text-slate-500" />
          <span>Click Grid Array to Manual Repoint</span>
        </span>
        <span className={isStealthMode ? 'text-purple-400' : 'text-cyan-400 font-extrabold'}>
          {satellite.name.toUpperCase()} LOCK
        </span>
      </div>
    </div>
  );
};
