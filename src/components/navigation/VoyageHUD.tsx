import React, { useState } from 'react';
import { useFleetStore } from '../../store/fleetStore';
import { LogPoseCompassIcon } from '../common/SvgIcons';
import { Compass, Map, Ship, Volume2, VolumeX, Shield, Award } from 'lucide-react';

interface VoyageHUDProps {
  currentSceneIndex: number;
  scrollProgress: number;
  onNavigateSection?: (sectionId: string) => void;
}

const SCENE_NAMES = [
  { id: 'scene-east-blue', title: 'Sky Realm', island: 'High Stratosphere Dawn' },
  { id: 'scene-storm', title: 'Cloud Break', island: 'Grand Line Ocean Reveal' },
  { id: 'scene-sabaody', title: 'Fleet Waters', island: 'Sabaody Archipelago' },
  { id: 'scene-foxy', title: "Sea Coliseum", island: "Foxy's Arena Isle" },
  { id: 'scene-haki', title: 'Whitebeard Tremor', island: 'Moby Dick & Haki Forge' },
  { id: 'scene-laughtale', title: 'Abyss Battlefield', island: 'Laugh Tale Abyss' },
];

export const VoyageHUD: React.FC<VoyageHUDProps> = ({
  currentSceneIndex,
  scrollProgress,
  onNavigateSection,
}) => {
  const { viewMode, setViewMode, gameState } = useFleetStore();
  const [isMuted, setIsMuted] = useState(true);

  const currentScene = SCENE_NAMES[Math.min(currentSceneIndex, SCENE_NAMES.length - 1)];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-auto px-3 sm:px-6 py-3 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 bg-slate-950/85 backdrop-blur-md border border-amber-500/30 rounded-2xl px-3 sm:px-5 py-2.5 shadow-2xl shadow-black/80">
        
        {/* Left: Log Pose & Island Indicator */}
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer" title="Log Pose Navigation Core">
            <LogPoseCompassIcon progress={scrollProgress} className="w-10 h-10 sm:w-11 sm:h-11 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
          </div>
          <div className="hidden sm:flex flex-col">
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '10s' }} />
              <span>Log Pose Locked</span>
            </div>
            <span className="font-pirate text-lg sm:text-xl text-parchment tracking-wide drop-shadow">
              {currentScene.island}
            </span>
          </div>
        </div>

        {/* Center: Quick Anchor Nav (Scroll Voyage mode) */}
        {viewMode === 'voyage' && (
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/90 border border-slate-700/60 rounded-xl px-2 py-1" aria-label="Grand Line Navigation">
            {SCENE_NAMES.map((s, idx) => {
              const isActive = idx === currentSceneIndex;
              return (
                <button
                  key={s.id}
                  onClick={() => onNavigateSection?.(s.id)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30 scale-105'
                      : 'text-slate-300 hover:text-amber-300 hover:bg-slate-800/80'
                  }`}
                >
                  {s.title.split(' ')[0]}
                </button>
              );
            })}
          </nav>
        )}

        {/* Right: Gamification Badges & Mode Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Berries Treasury */}
          <div className="flex items-center gap-1.5 bg-amber-950/70 border border-amber-600/40 rounded-xl px-2.5 py-1 text-xs font-bold text-amber-300 shadow-inner">
            <span className="text-amber-400 font-serif">฿</span>
            <span>{gameState.berries.toLocaleString()}</span>
          </div>

          {/* Fleet Level */}
          <div className="hidden md:flex items-center gap-1 bg-slate-800/80 border border-slate-700 rounded-xl px-2 py-1 text-xs font-semibold text-slate-200">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>Lv. {gameState.fleetLevel}</span>
          </div>

          {/* Dual Mode Switcher (Voyage <-> Map) */}
          <button
            onClick={() => setViewMode(viewMode === 'voyage' ? 'map' : 'voyage')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            title="Toggle between Cinematic Voyage and Grand Line World Map"
            aria-label="Toggle Voyage or Island Map mode"
          >
            {viewMode === 'voyage' ? (
              <>
                <Map className="w-4 h-4" />
                <span>🗺 Grand Line Map</span>
              </>
            ) : (
              <>
                <Ship className="w-4 h-4" />
                <span>⚓ Scroll Voyage</span>
              </>
            )}
          </button>

          {/* Audio toggle button (Muted by default) */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
            title={isMuted ? 'Ambient Ocean Audio: Off (Click to activate)' : 'Ambient Ocean Audio: On'}
            aria-label="Toggle ambient sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
