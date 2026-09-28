import React from 'react';
import { useFleetStore } from '../../store/fleetStore';
import { ArrowLeftRight, Ship, Map } from 'lucide-react';

export const DualModeShowcaseCard: React.FC = () => {
  const { viewMode, setViewMode } = useFleetStore();

  return (
    <div className="w-full max-w-4xl mx-auto my-12 bg-slate-950/90 backdrop-blur-md border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative">
        {/* Left Card: Scroll Voyage */}
        <div
          onClick={() => setViewMode('voyage')}
          className={`relative h-64 sm:h-72 rounded-2xl border-2 overflow-hidden cursor-pointer group transition-all duration-300 shadow-xl ${
            viewMode === 'voyage'
              ? 'border-sky-400 shadow-sky-500/30 scale-[1.02]'
              : 'border-slate-700/80 hover:border-sky-400/70 hover:scale-[1.01]'
          }`}
        >
          {/* Card Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
            style={{ backgroundImage: `url('/assets/scenes/scene3_sunny.jpg')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Active Badge */}
          {viewMode === 'voyage' && (
            <div className="absolute top-3 right-3 z-10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500 text-slate-950 shadow-lg">
              Active Voyage
            </div>
          )}

          {/* Card Content at bottom */}
          <div className="absolute inset-x-0 bottom-0 p-5 z-10 text-center">
            <h4 className="font-pirate text-3xl text-white tracking-wide drop-shadow-md">
              Scroll Voyage
            </h4>
            <p className="text-xs text-sky-200 mt-1 font-medium drop-shadow">
              A cinematic journey through the Grand Line
            </p>
          </div>
        </div>

        {/* Central Switcher Pill */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-950 border-2 border-amber-400 items-center justify-center text-amber-400 shadow-2xl">
          <ArrowLeftRight className="w-5 h-5 animate-pulse" />
        </div>

        {/* Right Card: Grand Line Map */}
        <div
          onClick={() => setViewMode('map')}
          className={`relative h-64 sm:h-72 rounded-2xl border-2 overflow-hidden cursor-pointer group transition-all duration-300 shadow-xl ${
            viewMode === 'map'
              ? 'border-amber-400 shadow-amber-500/30 scale-[1.02]'
              : 'border-slate-700/80 hover:border-amber-400/70 hover:scale-[1.01]'
          }`}
        >
          {/* Card Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
            style={{ backgroundImage: `url('/assets/map/world_map_bg.jpg')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Active Badge */}
          {viewMode === 'map' && (
            <div className="absolute top-3 right-3 z-10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-slate-950 shadow-lg">
              Active Map
            </div>
          )}

          {/* Card Content at bottom */}
          <div className="absolute inset-x-0 bottom-0 p-5 z-10 text-center">
            <h4 className="font-pirate text-3xl text-white tracking-wide drop-shadow-md">
              Grand Line Map
            </h4>
            <p className="text-xs text-amber-200 mt-1 font-medium drop-shadow">
              Explore. Manage. Build. Your Fleet.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 text-center">
        <span className="text-xs text-slate-400 font-medium">
          Same data. Same world. Two ways to explore.
        </span>
      </div>
    </div>
  );
};
