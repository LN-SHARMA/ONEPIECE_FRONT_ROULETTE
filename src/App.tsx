import React, { useEffect } from 'react';
import { useFleetStore } from './store/fleetStore';
import { ScrollVoyage } from './components/voyage/ScrollVoyage';
import { GrandLineMap } from './components/map/GrandLineMap';
import { DenDenToast } from './components/common/DenDenToast';
import { HakiShockwave } from './components/common/HakiShockwave';
import { EasterEggListener } from './components/common/EasterEggListener';

export const App: React.FC = () => {
  const { init, viewMode, isLoading } = useFleetStore();

  useEffect(() => {
    init();
  }, [init]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-amber-400 font-pirate text-3xl">
        <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <div>Locking Log Pose Coordinates...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* Mutual Exclusive Canvas Management (Addendum A & Section 4) */}
      {viewMode === 'voyage' ? <ScrollVoyage /> : <GrandLineMap />}

      {/* Global Overlays */}
      <DenDenToast />
      <HakiShockwave />
      <EasterEggListener />
    </div>
  );
};

export default App;
