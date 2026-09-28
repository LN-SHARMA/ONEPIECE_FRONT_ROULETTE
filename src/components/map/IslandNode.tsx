import React from 'react';
import { JollyRogerAvatar, SunnyShipSilhouette, LogPoseCompassIcon } from '../common/SvgIcons';
import { Shield, AlertCircle, Lock, Sparkles, Trophy, Anchor, Zap } from 'lucide-react';

export interface IslandData {
  id: string;
  name: string;
  subtitle: string;
  x: number;
  y: number;
  themeColor: string;
  statusBadge: string;
  warningCount?: number;
  warningMessage?: string;
  unlocked: boolean;
  unlockStep: number;
}

interface IslandNodeProps {
  island: IslandData;
  zoom: number;
  isFocused: boolean;
  onClick: () => void;
}

export const IslandNode: React.FC<IslandNodeProps> = ({ island, zoom, isFocused, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        left: `${island.x}px`,
        top: `${island.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
      className={`absolute cursor-pointer transition-all duration-300 select-none group ${
        isFocused ? 'scale-110 z-30' : 'hover:scale-105 z-20'
      }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onClick();
      }}
      aria-label={`Open ${island.name} building panel`}
    >
      {/* Fog of War shroud if not yet unlocked */}
      {!island.unlocked ? (
        <div className="relative w-48 h-48 flex items-center justify-center">
          {/* Animated Fog Shroud */}
          <div className="absolute inset-0 bg-slate-900/90 rounded-full blur-xl animate-pulse" />
          <div className="relative z-10 p-5 rounded-full bg-slate-950/80 border-2 border-slate-700 text-center flex flex-col items-center">
            <Lock className="w-8 h-8 text-amber-500/60 mb-1" />
            <span className="font-pirate text-3xl text-amber-400">?</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
              Uncharted Waters
            </span>
          </div>
        </div>
      ) : (
        <div className="relative flex flex-col items-center">
          {/* Notification Bubble (Clash of Clans style alert) */}
          {(island.warningCount || 0) > 0 && (
            <div
              className="absolute -top-12 z-40 bg-red-600 border-2 border-white text-white px-2.5 py-1 rounded-full text-xs font-extrabold shadow-xl animate-bounce flex items-center gap-1"
              title={island.warningMessage}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{island.warningMessage || `${island.warningCount} Alerts`}</span>
            </div>
          )}

          {/* Island Floating Name Banner & Status Badge */}
          <div className="mb-2 flex flex-col items-center text-center">
            <div className="bg-slate-950/90 border border-amber-500/60 rounded-xl px-3 py-1 shadow-xl flex items-center gap-1.5">
              <span className="font-pirate text-xl text-parchment tracking-wide drop-shadow">
                {island.name}
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                {island.statusBadge}
              </span>
            </div>
            <span className="text-[10px] text-slate-300 font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] mt-0.5">
              {island.subtitle}
            </span>
          </div>

          {/* Island SVG Visual Body (Thematic per Island) */}
          <div
            className="w-44 h-44 rounded-3xl p-3 flex items-center justify-center relative overflow-hidden transition-all duration-300 group-hover:shadow-[0_0_40px_rgba(245,158,11,0.4)]"
            style={{
              background: `radial-gradient(circle at 50% 40%, ${island.themeColor} 0%, #030d1a 100%)`,
              border: `3px solid ${island.themeColor}`,
            }}
          >
            {/* Thematic Island Centers */}
            {island.id === 'island-sunny-hq' && (
              <div className="relative flex flex-col items-center">
                <SunnyShipSilhouette className="w-28 h-28 drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-amber-300 mt-1">
                  Fleet Flagship Dock
                </span>
              </div>
            )}

            {island.id === 'island-recruitment' && (
              <div className="relative flex flex-col items-center text-pink-300">
                <div className="w-20 h-20 rounded-full border-2 border-pink-400/60 bg-pink-500/20 flex items-center justify-center animate-pulse">
                  <JollyRogerAvatar hatType="straw" symbol="crossbones" baseColor="#701a75" accentColor="#f472b6" size={60} />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-pink-200 mt-1">
                  Bounty Registry
                </span>
              </div>
            )}

            {island.id === 'island-foxy' && (
              <div className="relative flex flex-col items-center text-orange-300">
                <div className="font-pirate text-5xl text-orange-400 drop-shadow-[0_0_12px_rgba(249,115,22,0.8)]">
                  🦊
                </div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-orange-200 mt-1">
                  Coliseum Ring
                </div>
              </div>
            )}

            {island.id === 'island-haki-forge' && (
              <div className="relative flex flex-col items-center">
                <div className="w-20 h-20 rounded-2xl bg-black border-2 border-red-500/80 flex items-center justify-center shadow-haki-conq animate-pulse">
                  <Zap className="w-10 h-10 text-red-500" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-red-300 mt-1">
                  Haki Division
                </span>
              </div>
            )}

            {island.id === 'island-harbor' && (
              <div className="relative flex flex-col items-center text-cyan-300">
                <div className="w-20 h-20 rounded-2xl bg-slate-900 border-2 border-cyan-400/80 flex items-center justify-center">
                  <Anchor className="w-10 h-10 text-cyan-400" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-200 mt-1">
                  Commissioned Piers
                </span>
              </div>
            )}

            {island.id === 'island-laughtale' && (
              <div className="relative flex flex-col items-center text-amber-300">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-300 border-2 border-amber-200 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.8)]">
                  <Trophy className="w-10 h-10 text-slate-950" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-amber-200 mt-1">
                  Grand Podium
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
