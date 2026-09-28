import React, { useState, useMemo } from 'react';
import { useFleetStore } from '../../store/fleetStore';
import { EventConfigPanel } from './EventConfigPanel';
import { CreateTrialModal } from './CreateTrialModal';
import { evaluateChallengeFit } from '../../services/teamEngine';
import { 
  PlusCircle, 
  Trash2, 
  Shield, 
  Target, 
  CheckCircle2, 
  Circle, 
  ChevronDown, 
  Check, 
  Sparkles,
  Users
} from 'lucide-react';

export const SeaTrialsBoard: React.FC = () => {
  const { 
    challenges, 
    crews, 
    participants,
    deleteChallenge, 
    assignChallengeToTeam, 
    toggleChallengeCompletion,
    assembleFleet 
  } = useFleetStore();

  const [showCreateModal, setShowCreateModal] = useState(false);

  const participantsMap = useMemo(
    () => new Map(participants.map(p => [p.id, p])),
    [participants]
  );

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
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-pirate text-xl uppercase tracking-wider rounded-xl shadow-lg shadow-orange-600/20 active:scale-95 transition-all self-start md:self-auto cursor-pointer"
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
        {challenges.map((c) => {
          const isCompleted = !!c.isCompleted;
          const assignedCrew = crews.find(
            cr => cr.assignedChallengeId === c.id || c.assignedCrewId === cr.id
          );
          const fitScore = assignedCrew
            ? evaluateChallengeFit(assignedCrew, c, participantsMap)
            : null;

          return (
            <div
              key={c.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between group shadow-lg relative ${
                isCompleted
                  ? 'bg-slate-900/95 border-emerald-500/60 shadow-emerald-950/30 ring-1 ring-emerald-500/30'
                  : 'bg-slate-900/80 border-slate-700/80 hover:border-orange-500/50'
              }`}
            >
              <div>
                {/* Header: Category Badge + Completion Button + Delete */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-300 border border-orange-500/20">
                      {c.category} Trial
                    </span>
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-950/90 text-emerald-300 border border-emerald-500/40">
                        <Check className="w-3 h-3 text-emerald-400" /> Completed
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Tick-Check Completion Button */}
                    <button
                      type="button"
                      onClick={() => toggleChallengeCompletion(c.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer border ${
                        isCompleted
                          ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/50 shadow-emerald-500/20'
                          : 'bg-slate-800/90 hover:bg-slate-750 text-slate-300 hover:text-white border-slate-700 hover:border-amber-500/50'
                      }`}
                      title={isCompleted ? 'Click to uncheck / mark incomplete' : 'Click to tick-check challenge as completed'}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
                          <span>Done</span>
                        </>
                      ) : (
                        <>
                          <Circle className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
                          <span>Complete</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => deleteChallenge(c.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-opacity cursor-pointer"
                      title="Remove Challenge"
                      aria-label={`Remove challenge ${c.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className={`font-pirate text-2xl text-parchment mt-2.5 leading-tight ${isCompleted ? 'text-amber-200' : ''}`}>
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

              {/* Assignment Section & Team Selector */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-amber-400" /> Assigned Team:
                  </span>
                  {assignedCrew && fitScore !== null && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      fitScore >= 80 
                        ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40' 
                        : 'bg-amber-950/90 text-amber-300 border-amber-500/40'
                    }`}>
                      {fitScore}% Fit
                    </span>
                  )}
                </div>

                {/* Assigning Dropdown Selector + Unassign Button */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <select
                      value={assignedCrew?.id || ''}
                      onChange={(e) => assignChallengeToTeam(c.id, e.target.value)}
                      className={`w-full pl-3 pr-8 py-2 rounded-xl text-xs font-bold border transition-all outline-none cursor-pointer appearance-none ${
                        assignedCrew
                          ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 hover:bg-amber-500/25 shadow-sm'
                          : 'bg-slate-950/90 border-slate-700/80 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                      }`}
                    >
                      <option value="" className="bg-slate-900 text-slate-400">
                        {crews.length === 0 ? '— No Teams Formed Yet —' : '+ Assign to a Team...'}
                      </option>
                      {crews.map((cr) => (
                        <option key={cr.id} value={cr.id} className="bg-slate-900 text-slate-100 font-semibold">
                          ⚓ {cr.name} ({cr.shipName})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {assignedCrew && (
                    <button
                      type="button"
                      onClick={() => assignChallengeToTeam(c.id, '')}
                      className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-red-950/60 border border-slate-700 hover:border-red-500/40 text-slate-400 hover:text-red-300 text-xs font-bold transition-colors cursor-pointer"
                      title="Unassign team from this challenge"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {crews.length === 0 && (
                  <button
                    type="button"
                    onClick={() => assembleFleet()}
                    className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 pt-0.5 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Assemble fleet to assign teams</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showCreateModal && (
        <CreateTrialModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};
