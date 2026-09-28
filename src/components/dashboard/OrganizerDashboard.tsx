import React from 'react';
import { useFleetStore } from '../../store/fleetStore';
import { useAuthStore } from '../../store/authStore';
import { ALL_ROLES, PirateRole } from '../../types';
import { Shield, Users, Trophy, Scale, Anchor, RefreshCw, Zap, Lock } from 'lucide-react';

export const OrganizerDashboard: React.FC<{ onJumpToSection?: (id: string) => void }> = ({ onJumpToSection }) => {
  const { participants, crews, challenges, balanceScore, assembleFleet, resetAll, isGenerating } = useFleetStore();
  const { isAuthenticated, requireAuth } = useAuthStore();

  const handleAssemble = () => {
    if (!requireAuth('assemble the fleet')) return;
    assembleFleet(false);
  };

  const handleReshuffle = () => {
    if (!requireAuth('reshuffle the fleet tides')) return;
    assembleFleet(true);
  };

  const handleReset = () => {
    if (!requireAuth('reset demo data')) return;
    resetAll();
  };

  // Role Coverage Heatmap calculation
  const roleCounts: Record<PirateRole, number> = ALL_ROLES.reduce((acc, role) => {
    acc[role] = 0;
    return acc;
  }, {} as Record<PirateRole, number>);

  participants.forEach(p => {
    roleCounts[p.primaryRole] = (roleCounts[p.primaryRole] || 0) + 1;
  });

  return (
    <div className="w-full glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/30 text-slate-100 shadow-2xl relative overflow-hidden">
      {/* Background watermark */}
      <div className="absolute -right-12 -bottom-12 opacity-5 pointer-events-none">
        <Scale className="w-80 h-80 text-amber-400" />
      </div>

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-700/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Fleet Commander Console
            </span>
            <span className="text-xs text-slate-400">Grand Line Event Coordination</span>
            {!isAuthenticated && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <Lock className="w-3 h-3 text-amber-400" /> Read-Only
              </span>
            )}
          </div>
          <h2 className="font-pirate text-3xl sm:text-4xl text-parchment tracking-wide mt-1">
            Organizer Fleet Operations
          </h2>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleAssemble}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-red-600/30 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-yellow-300" />
            <span>Assemble Fleet</span>
          </button>

          <button
            onClick={handleReshuffle}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 font-semibold rounded-xl text-sm transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>Reshuffle Tides</span>
          </button>

          <button
            onClick={handleReset}
            className="px-3.5 py-2 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 rounded-xl text-xs transition-colors cursor-pointer"
          >
            Reset Demo Data
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Total Pirates</div>
            <div className="font-pirate text-3xl text-parchment leading-tight">
              {participants.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Enlisted Nakama</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Anchor className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Active Crews</div>
            <div className="font-pirate text-3xl text-amber-300 leading-tight">
              {crews.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Ships Commissioned</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Davy Back Trials</div>
            <div className="font-pirate text-3xl text-orange-300 leading-tight">
              {challenges.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Sanctioned Events</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Balance Score</div>
            <div className={`font-pirate text-3xl leading-tight ${balanceScore >= 80 ? 'text-emerald-300' : 'text-yellow-400'}`}>
              {balanceScore}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Combat & Skill Parity</div>
          </div>
        </div>
      </div>

      {/* Role Coverage Heatmap */}
      <div className="mt-6 pt-5 border-t border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            Fleet Role Coverage Heatmap
          </span>
          <span className="text-xs text-slate-400">
            Primary role allocation across entire roster
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
          {ALL_ROLES.map((role) => {
            const count = roleCounts[role] || 0;
            const isLow = count === 0;
            const isGood = count >= 2;

            return (
              <div
                key={role}
                className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all ${
                  isLow
                    ? 'bg-red-950/40 border-red-500/40 text-red-300'
                    : isGood
                    ? 'bg-slate-900/80 border-cyan-500/40 text-cyan-200'
                    : 'bg-slate-900/60 border-slate-700 text-slate-300'
                }`}
              >
                <span className="text-[11px] font-semibold truncate w-full">{role}</span>
                <span className="font-pirate text-2xl mt-0.5 leading-none">
                  {count}
                </span>
                <span className="text-[9px] uppercase tracking-wider opacity-75 mt-1">
                  {isLow ? 'Critical Gap' : `${count} Ready`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
