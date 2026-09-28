import React, { useState } from 'react';
import { useFleetStore } from '../../store/fleetStore';
import { EventConfigPanel } from './EventConfigPanel';
import { CreateTrialModal } from './CreateTrialModal';
import { PlusCircle, Trash2, Shield, Target, Award } from 'lucide-react';

export const SeaTrialsBoard: React.FC = () => {
  const { challenges, deleteChallenge } = useFleetStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="w-full glass-panel rounded-3xl p-6 sm:p-8 border border-orange-500/30 text-slate-100 shadow-2xl">
      {/* Board Header with Foxy lore */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-orange-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/20 text-orange-300 border border-orange-500/40">
              🦊 Foxy's Davy Back Coliseum
            </span>
            <span className="text-xs text-slate-400">Official Grand Fleet Contests</span>
          </div>
          <h2 className="font-pirate text-3xl sm:text-4xl text-parchment tracking-wide mt-1">
            Sea Trials Board
          </h2>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-pirate text-xl uppercase tracking-wider rounded-xl shadow-lg shadow-orange-600/20 active:scale-95 transition-all self-start md:self-auto"
        >
          <PlusCircle className="w-5 h-5 text-yellow-300" />
          <span>Sanction New Trial</span>
        </button>
      </div>

      {/* Event Config Panel (Crew Size & Crew Count) */}
      <div className="my-6">
        <EventConfigPanel />
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
        {challenges.map((c) => (
          <div
            key={c.id}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-700/80 hover:border-orange-500/50 transition-all flex flex-col justify-between group shadow-lg"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-300 border border-orange-500/20">
                  {c.category} Trial
                </span>
                <button
                  onClick={() => deleteChallenge(c.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-opacity"
                  title="Remove Challenge"
                  aria-label={`Remove challenge ${c.name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="font-pirate text-2xl text-parchment mt-2 leading-tight">
                {c.name}
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {c.description}
              </p>

              {/* Required Roles */}
              <div className="mt-3 pt-3 border-t border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Required Archetypes:
                </span>
                <div className="flex flex-wrap gap-1">
                  {c.requiredRoles.map((role) => (
                    <span key={role} className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300 text-[10px] font-bold">
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              {/* Required Skills & Weights */}
              <div className="mt-2.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Skill Weights:
                </span>
                <div className="space-y-1">
                  {c.requiredSkills.map((rs, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px] bg-slate-950/60 px-2 py-1 rounded">
                      <span className="capitalize text-slate-300">{rs.skill} (Lvl {rs.minLevel}+)</span>
                      <span className="text-orange-400 font-bold">x{rs.weight} Weight</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-orange-400" /> Davy Back Standard
              </span>
              <span className="font-semibold text-amber-300">Sanctioned</span>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <CreateTrialModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};
