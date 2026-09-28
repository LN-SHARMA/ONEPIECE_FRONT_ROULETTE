import React, { useState, useMemo } from 'react';
import { useFleetStore } from '../../store/fleetStore';
import { useAuthStore, DEMO_USERS } from '../../store/authStore';
import { useAudioStore } from '../../store/audioStore';
import { CrewCard } from './CrewCard';
import { StowawayList } from './StowawayList';
import { AddGrandFleetModal } from './AddGrandFleetModal';
import { 
  Zap, 
  RefreshCw, 
  Scale, 
  ShieldAlert, 
  Sparkles, 
  Sliders, 
  Award, 
  Plus, 
  ShieldCheck,
  Lock,
  LogIn,
  Search,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const CrewRosterManager: React.FC = () => {
  const {
    crews,
    participants,
    stowaways,
    balanceScore,
    eventConfig,
    assembleFleet,
    autoOptimizeGrandFleet,
    swapMembers,
    isGenerating,
  } = useFleetStore();
  const { isAuthenticated, requireAuth, openLoginModal } = useAuthStore();
  const { playCannon, playHakiSurge, playWoodClick } = useAudioStore();

  const [draggedItem, setDraggedItem] = useState<{ crewId: string; memberId: string } | null>(null);
  const [showGrandFleetModal, setShowGrandFleetModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllCrews, setShowAllCrews] = useState(false);

  const participantsMap = useMemo(
    () => new Map(participants.map(p => [p.id, p])),
    [participants]
  );

  const filteredCrews = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return crews;
    return crews.filter(crew => {
      const matchCrewName = crew.name.toLowerCase().includes(q);
      const matchShip = crew.shipName.toLowerCase().includes(q);
      const matchMembers = crew.members.some(m => {
        const p = participantsMap.get(m.participantId);
        if (!p) return false;
        return (
          p.name.toLowerCase().includes(q) ||
          p.epithet.toLowerCase().includes(q) ||
          m.assignedRole.toLowerCase().includes(q)
        );
      });
      return matchCrewName || matchShip || matchMembers;
    });
  }, [crews, searchQuery, participantsMap]);

  const displayedCrews = useMemo(() => {
    if (searchQuery.trim()) {
      return filteredCrews;
    }
    return showAllCrews ? filteredCrews : filteredCrews.slice(0, 3);
  }, [filteredCrews, showAllCrews, searchQuery]);

  // Calculate current fleet average fit score
  const avgFit = crews.length > 0
    ? Math.round(crews.reduce((acc, c) => acc + (c.fitScore || 0), 0) / crews.length)
    : 0;

  const targetFitCriteria = eventConfig.targetFitThreshold || 80;
  const isFitLow = crews.length > 0 && avgFit < targetFitCriteria;

  const handleDragStart = (crewId: string, memberId: string) => {
    if (!isAuthenticated) return;
    setDraggedItem({ crewId, memberId });
  };

  const handleDrop = (targetCrewId: string) => {
    if (!draggedItem) return;
    if (!requireAuth('swap members between fleet divisions')) {
      setDraggedItem(null);
      return;
    }
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

  const handleAddGrandFleet = () => {
    playWoodClick();
    setShowGrandFleetModal(true);
  };

  const handleReshuffle = () => {
    if (!isAuthenticated) {
      useAuthStore.getState().loginWithDemo(DEMO_USERS[0]);
    }
    playCannon();
    assembleFleet(true);
  };

  const handleAssemble = () => {
    if (!isAuthenticated) {
      useAuthStore.getState().loginWithDemo(DEMO_USERS[0]);
    }
    playCannon();
    playHakiSurge();
    assembleFleet(false);
  };

  const handleAutoOptimize = () => {
    if (!isAuthenticated) {
      useAuthStore.getState().loginWithDemo(DEMO_USERS[0]);
    }
    playHakiSurge();
    autoOptimizeGrandFleet(targetFitCriteria);
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

        {/* Balance Score, Fit Score & Action Triggers */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Balance Score Gauge */}
          <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-700/80 rounded-2xl px-3.5 py-2.5 shadow-inner">
            <div className="relative flex items-center justify-center">
              <Scale className={`w-5 h-5 ${balanceScore >= 85 ? 'text-emerald-400' : 'text-amber-400'}`} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Parity
              </div>
              <div className="font-pirate text-xl text-parchment leading-tight">
                {balanceScore}%
              </div>
            </div>
          </div>

          {/* Fleet Fit Criteria Gauge */}
          {crews.length > 0 && (
            <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-700/80 rounded-2xl px-3.5 py-2.5 shadow-inner">
              <div className="relative flex items-center justify-center">
                <Award className={`w-5 h-5 ${avgFit >= 80 ? 'text-emerald-400' : 'text-amber-400'}`} />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Trial Fit
                </div>
                <div className={`font-pirate text-xl leading-tight ${avgFit >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {avgFit}%
                </div>
              </div>
            </div>
          )}

          {/* Option to Add Grand Fleet by Skills */}
          <button
            type="button"
            onClick={handleAddGrandFleet}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
            title="Add or configure Grand Fleet based on custom selected skills"
          >
            <Sliders className="w-4 h-4" />
            <span>+ Add Grand Fleet by Skills</span>
          </button>

          {/* Reshuffle Button */}
          <button
            type="button"
            onClick={handleReshuffle}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 rounded-2xl text-xs font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Reshuffle Tides (Randomized seed, respects locks & pins)"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Reshuffle</span>
          </button>

          {/* Assemble Quick Button */}
          <button
            type="button"
            onClick={handleAssemble}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 via-red-500 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-pirate text-xl uppercase tracking-wider rounded-2xl shadow-xl shadow-red-600/30 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-yellow-300" />
            <span>{isGenerating ? 'Balancing...' : 'Assemble'}</span>
          </button>
        </div>
      </div>

      {/* Read-Only Notice for Guest Fleet Review */}
      {!isAuthenticated && (
        <div className="mt-4 p-4 rounded-2xl bg-amber-950/70 border border-amber-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-amber-200">
            <Lock className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <strong className="text-amber-300 block">Grand Fleet Roster: Read-Only (Observation Mode)</strong>
              <span>Fleet radars, crew balances, and ship specs are open for viewing. Sign in to assemble, reshuffle, swap, or customize divisions.</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openLoginModal('assemble and command fleets')}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shrink-0 self-start sm:self-auto cursor-pointer shadow-md transition-all active:scale-95 flex items-center gap-1.5"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In (Demo)</span>
          </button>
        </div>
      )}

      {/* Low Fit Criteria Alert Banner & Automatic Fleet Creator */}
      {isFitLow && (
        <div className="my-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/80 border-2 border-amber-500/60 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/50 shrink-0">
              <ShieldAlert className="w-6 h-6 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Fit Criteria Warning
                </span>
                <span className="text-xs text-amber-200/80 font-mono">
                  Current: {avgFit}% vs Target: {targetFitCriteria}%
                </span>
              </div>
              <h4 className="font-pirate text-2xl text-amber-300 mt-0.5">
                Current Grand Fleet Fit Criteria is Low
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Current division assignments do not satisfy optimal skill criteria for active sea trials.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
            <button
              type="button"
              onClick={handleAutoOptimize}
              disabled={isGenerating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/30 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <Zap className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Optimizing Fleet...' : 'Auto-Create High-Fit Grand Fleet'}</span>
            </button>
            <button
              type="button"
              onClick={handleAddGrandFleet}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
              title="Configure skills manually"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Fleet Controls: Section Counter & Live Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-6 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-red-400">
            Grand Fleet Divisions
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 shadow-inner">
            {searchQuery.trim()
              ? `${filteredCrews.length} of ${crews.length} matches`
              : `${displayedCrews.length} of ${crews.length} shown`}
          </span>
        </div>

        {/* Search Bar Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search fleets by name, ship, or member..."
            className="w-full pl-9 pr-8 py-2 bg-slate-900/90 border border-slate-700/80 focus:border-red-400 focus:ring-1 focus:ring-red-400/20 text-slate-100 placeholder-slate-500 text-xs rounded-xl outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 rounded-md cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Crews Grid (R11) */}
      {crews.length === 0 ? (
        <div className="py-20 text-center text-slate-400">
          <Sparkles className="w-10 h-10 text-red-500/40 mx-auto mb-3" />
          <p className="font-pirate text-2xl text-parchment">No crews assembled yet.</p>
          <p className="text-sm mt-1">Tap "+ Add Grand Fleet by Skills" or "Assemble" to form the fleet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 my-6">
          {displayedCrews.map((crew) => (
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

      {/* Empty Search Result State */}
      {crews.length > 0 && filteredCrews.length === 0 && (
        <div className="py-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800 my-6">
          <p className="font-pirate text-2xl text-red-300">No Fleets Found</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            No fleets matched "{searchQuery}". Try searching for another fleet, ship, or nakama name.
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="mt-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-red-300 border border-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* See More Fleets / Show Less Toggle Button */}
      {!searchQuery.trim() && crews.length > 3 && (
        <div className="my-6 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAllCrews(!showAllCrews)}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 hover:from-slate-800 hover:to-slate-750 border border-red-500/40 hover:border-red-400 text-red-300 font-bold rounded-2xl text-xs sm:text-sm shadow-xl hover:shadow-red-500/10 active:scale-95 transition-all cursor-pointer"
          >
            {showAllCrews ? (
              <>
                <ChevronUp className="w-4 h-4 text-red-400" />
                <span>Show Less (Top 3 Fleets)</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 text-red-400" />
                <span>See More Fleets ({crews.length})</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Unassigned Stowaways (R10) */}
      <div className="mt-8">
        <StowawayList
          stowawayIds={stowaways}
          participantsMap={participantsMap}
        />
      </div>

      {/* Modal for Adding Grand Fleet by Skills & Auto-Optimization */}
      {showGrandFleetModal && (
        <AddGrandFleetModal onClose={() => setShowGrandFleetModal(false)} />
      )}
    </div>
  );
};
