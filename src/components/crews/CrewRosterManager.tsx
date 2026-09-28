import React, { useState } from 'react';
import { useFleetStore } from '../../store/fleetStore';
import { CrewCard } from './CrewCard';
import { StowawayList } from './StowawayList';
import { Zap, RefreshCw, Scale, ShieldAlert, Sparkles } from 'lucide-react';

export const CrewRosterManager: React.FC = () => {
  const {
    crews,
    participants,
    stowaways,
    balanceScore,
    assembleFleet,
    swapMembers,
    isGenerating,
  } = useFleetStore();

  const [draggedItem, setDraggedItem] = useState<{ crewId: string; memberId: string } | null>(null);

  const participantsMap = new Map(participants.map(p => [p.id, p]));

  const handleDragStart = (crewId: string, memberId: string) => {
    setDraggedItem({ crewId, memberId });
  };

  const handleDrop = (targetCrewId: string) => {
    if (!draggedItem) return;
    if (draggedItem.crewId === targetCrewId) {
      setDraggedItem(null);
      return;
    }

    // Find first non-pinned member in target crew to swap with
    const targetCrew = crews.find(c => c.id === targetCrewId);
    if (targetCrew && targetCrew.members.length > 0) {
      const swappableMember = targetCrew.members.find(m => !m.isPinned);
      if (swappableMember) {
        swapMembers(draggedItem.crewId, draggedItem.memberId, targetCrewId, swappableMember.participantId);
      }
    }

    setDraggedItem(null);
  };

  return (
    <div className="w-full glass-panel rounded-3xl p-6 sm:p-8 border border-red-500/30 text-slate-100 shadow-2xl relative">
      {/* Roster Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-red-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-600/20 text-red-400 border border-red-500/40">
              ⚡ Haki Clash: Fleet Division
            </span>
            <span className="text-xs text-slate-400">Algorithmic Crew Parity</span>
          </div>
          <h2 className="font-pirate text-3xl sm:text-4xl text-parchment tracking-wide mt-1">
            Assemble the Grand Fleet
          </h2>
        </div>

        {/* Balance Score & Action Trigger (R8, R9, R12) */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Balance Score Gauge */}
          <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-700/80 rounded-2xl px-4 py-2.5 shadow-inner">
            <div className="relative flex items-center justify-center">
              <Scale className={`w-6 h-6 ${balanceScore >= 85 ? 'text-emerald-400' : 'text-amber-400'}`} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Fleet Balance
              </div>
              <div className="font-pirate text-2xl text-parchment leading-tight">
                {balanceScore}% <span className="text-xs font-sans text-slate-400 font-normal">Parity</span>
              </div>
            </div>
          </div>

          {/* Reshuffle Button (R12) */}
          <button
            onClick={() => assembleFleet(true)}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 rounded-2xl text-xs sm:text-sm font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50"
            title="Reshuffle Tides (Randomized seed, respects locks & pins)"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>Reshuffle Tides</span>
          </button>

          {/* Assemble Big Button (R8) */}
          <button
            onClick={() => assembleFleet(false)}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 via-red-500 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-pirate text-2xl uppercase tracking-wider rounded-2xl shadow-xl shadow-red-600/30 active:scale-95 transition-all disabled:opacity-50"
          >
            <Zap className="w-5 h-5 text-yellow-300" />
            <span>{isGenerating ? 'Balancing...' : 'Assemble Fleet'}</span>
          </button>
        </div>
      </div>

      {/* Crews Grid (R11) */}
      {crews.length === 0 ? (
        <div className="py-20 text-center text-slate-400">
          <Sparkles className="w-10 h-10 text-red-500/40 mx-auto mb-3" />
          <p className="font-pirate text-2xl text-parchment">No crews assembled yet.</p>
          <p className="text-sm mt-1">Tap "Assemble Fleet" to balance the Grand Fleet into crews.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 my-8">
          {crews.map((crew) => (
            <CrewCard
              key={crew.id}
              crew={crew}
              participantsMap={participantsMap}
              onDragStartMember={handleDragStart}
              onDropMember={handleDrop}
            />
          ))}
        </div>
      )}

      {/* Unassigned Stowaways (R10) */}
      <div className="mt-8">
        <StowawayList
          stowawayIds={stowaways}
          participantsMap={participantsMap}
        />
      </div>
    </div>
  );
};
