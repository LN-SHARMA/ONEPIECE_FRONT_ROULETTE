import React from 'react';
import { Participant } from '../../types';
import { JollyRogerAvatar } from '../common/SvgIcons';
import { Anchor, AlertCircle } from 'lucide-react';

interface StowawayListProps {
  stowawayIds: string[];
  participantsMap: Map<string, Participant>;
}

export const StowawayList: React.FC<StowawayListProps> = ({ stowawayIds, participantsMap }) => {
  if (stowawayIds.length === 0) {
    return (
      <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
        <Anchor className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>All enlisted pirates have been commissioned into active Davy Back Fight crews! No stowaways left ashore.</span>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-slate-100 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <h4 className="font-pirate text-2xl text-parchment">
            Unassigned Stowaways: Left Ashore ({stowawayIds.length})
          </h4>
        </div>
        <span className="text-xs text-amber-300 font-medium">
          Docks of Mock Town • Awaiting Next Fleet Call
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        {stowawayIds.map((id) => {
          const pirate = participantsMap.get(id);
          if (!pirate) return null;

          return (
            <div
              key={id}
              className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700 flex items-center gap-2.5"
            >
              <JollyRogerAvatar
                hatType={pirate.jollyRogerStyle.hatType}
                symbol={pirate.jollyRogerStyle.symbol}
                baseColor={pirate.jollyRogerStyle.baseColor}
                accentColor={pirate.jollyRogerStyle.accentColor}
                size={34}
              />
              <div className="min-w-0">
                <div className="font-pirate text-base text-parchment truncate">
                  {pirate.name}
                </div>
                <div className="text-[10px] text-slate-400">
                  {pirate.primaryRole} • ฿{(pirate.bounty / 1000000).toFixed(0)}M
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
