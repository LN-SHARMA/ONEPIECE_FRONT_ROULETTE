import React, { useEffect, useState } from 'react';
import { useFleetStore } from '../../store/fleetStore';

export const HakiShockwave: React.FC = () => {
  const { hakiVfxTrigger, setHakiVfx } = useFleetStore();
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (hakiVfxTrigger !== 'none') {
      setActive(true);
      const timer = setTimeout(() => {
        setActive(false);
        setHakiVfx('none');
      }, 1600);
      return () => clearTimeout(timer);
    }
  }, [hakiVfxTrigger, setHakiVfx]);

  if (!active || hakiVfxTrigger === 'none') return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
      {/* Conqueror's Haki Shockwave */}
      {hakiVfxTrigger === 'conqueror' && (
        <>
          <div className="absolute inset-0 bg-red-950/40 mix-blend-overlay animate-pulse" />
          <div className="w-[120vw] h-[120vw] rounded-full border-[8px] border-red-600/80 animate-haki-wave shadow-[0_0_80px_rgba(220,38,38,1)]" />
          <div className="absolute font-pirate text-5xl sm:text-7xl text-red-500 drop-shadow-[0_0_25px_rgba(239,68,68,1)] uppercase tracking-widest scale-125 transition-transform duration-700">
            ⚡ HAOSHOKU HAKI ⚡
          </div>
        </>
      )}

      {/* Observation Haki Ripple */}
      {hakiVfxTrigger === 'observation' && (
        <>
          <div className="absolute inset-0 bg-cyan-950/30 mix-blend-screen" />
          <div className="w-96 h-96 rounded-full border-4 border-cyan-400/90 animate-haki-wave shadow-[0_0_60px_rgba(6,182,212,0.8)]" />
          <div className="w-[60vw] h-[60vw] rounded-full border-2 border-cyan-300/50 animate-haki-wave" style={{ animationDelay: '0.3s' }} />
          <div className="absolute font-pirate text-4xl sm:text-6xl text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,1)] uppercase tracking-wider">
            👁 KENBUNSHOKU HAKI
          </div>
        </>
      )}

      {/* Armament Haki Hardening */}
      {hakiVfxTrigger === 'armament' && (
        <>
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[4px] border-[12px] border-slate-700/60 shadow-[inset_0_0_100px_rgba(15,23,42,1)]" />
          <div className="absolute font-pirate text-4xl sm:text-6xl text-slate-300 drop-shadow-[0_0_20px_rgba(148,163,184,1)] uppercase tracking-wider">
            ⚔ BUSOSHOKU HARDENING
          </div>
        </>
      )}
    </div>
  );
};
