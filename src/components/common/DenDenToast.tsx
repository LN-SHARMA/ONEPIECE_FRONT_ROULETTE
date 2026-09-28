import React from 'react';
import { useFleetStore } from '../../store/fleetStore';
import { DenDenMushiIcon } from './SvgIcons';
import { X } from 'lucide-react';

export const DenDenToast: React.FC = () => {
  const { activeToast, dismissToast } = useFleetStore();

  if (!activeToast) return null;

  const typeStyles = {
    info: 'border-amber-500/60 bg-slate-900/95 text-amber-300',
    haki: 'border-red-500/80 bg-slate-950/95 text-red-200 shadow-haki-conq',
    foxy: 'border-orange-500/80 bg-amber-950/95 text-orange-200',
    warning: 'border-yellow-500/80 bg-slate-900/95 text-yellow-300',
  };

  return (
    <div
      role="alert"
      className={`fixed bottom-6 right-6 z-50 max-w-sm w-full p-4 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-start gap-3.5 animate-bounce-once transition-all duration-300 ${
        typeStyles[activeToast.type] || typeStyles.info
      }`}
    >
      <div className="shrink-0 p-1 bg-amber-500/10 rounded-xl border border-amber-500/30">
        <DenDenMushiIcon className="w-9 h-9" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className="font-pirate text-lg tracking-wide text-amber-400">
            Purupuru... Gacha!
          </span>
          <button
            onClick={dismissToast}
            className="p-1 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-white/10"
            aria-label="Dismiss transmission"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <h4 className="text-sm font-bold text-white leading-tight mt-0.5">
          {activeToast.title}
        </h4>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
          {activeToast.message}
        </p>
      </div>
    </div>
  );
};
