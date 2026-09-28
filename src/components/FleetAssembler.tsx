import React, { useMemo } from 'react';
import { useFleetStore } from '../store/fleetStore';
import { SKILL_META, SkillSet } from '../types';
import { evaluateChallengeFit } from '../services/teamEngine';

/* ────────────────────────────────────────────────────────────
   Req 6:  Set team size
   Req 8:  Generate teams
   Req 9:  Consider skills and roles during team formation
   Req 10: Prevent duplicate participant assignment
   Req 11: Display team members, roles, and skills
   Req 12: Allow teams to be regenerated
   Req 13: Assign challenges to teams
   Req 14: Display the assigned team and challenge
   ──────────────────────────────────────────────────────────── */

export const FleetAssembler: React.FC = () => {
  const {
    crews, participants, challenges, stowaways,
    eventConfig, balanceScore,
    updateConfig, assembleFleet, assignChallengeToCrew,
  } = useFleetStore();

  const participantsMap = useMemo(() => new Map(participants.map(p => [p.id, p])), [participants]);
  const challengesMap = useMemo(() => new Map(challenges.map(c => [c.id, c])), [challenges]);

  return (
    <div className="space-y-6">
      {/* ── Config + Generate Bar (Req 6, 8, 12) ── */}
      <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-6 flex-wrap">
          {/* Req 6: Set team size */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Team Size</label>
            <div className="flex items-center gap-2">
              <button onClick={() => updateConfig({ crewSize: Math.max(2, eventConfig.crewSize - 1) })}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold text-sm transition-colors">−</button>
              <span className="font-pirate text-2xl text-amber-300 w-8 text-center">{eventConfig.crewSize}</span>
              <button onClick={() => updateConfig({ crewSize: Math.min(9, eventConfig.crewSize + 1) })}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold text-sm transition-colors">+</button>
            </div>
          </div>

          {/* Balance Score */}
          <div className="text-center">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Balance</div>
            <div className={`font-pirate text-2xl ${balanceScore >= 85 ? 'text-emerald-400' : balanceScore >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
              {balanceScore}%
            </div>
          </div>

          <div className="text-center">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Teams</div>
            <div className="font-pirate text-2xl text-cyan-300">{crews.length}</div>
          </div>

          {stowaways.length > 0 && (
            <div className="text-center">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Unassigned</div>
              <div className="font-pirate text-2xl text-orange-400">{stowaways.length}</div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Req 12: Regenerate */}
          <button onClick={() => assembleFleet(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-cyan-500/40 text-cyan-300 font-bold text-sm transition-all active:scale-95">
            🔄 Reshuffle
          </button>
          {/* Req 8: Generate */}
          <button onClick={() => assembleFleet(false)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-pirate text-lg uppercase tracking-wider shadow-xl shadow-red-600/30 active:scale-95 transition-all">
            ⚡ Assemble Fleet
          </button>
        </div>
      </div>

      {/* ── Teams Grid (Req 11, 13, 14) ── */}
      {crews.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="font-pirate text-2xl text-parchment">No crews assembled yet.</p>
          <p className="text-sm mt-1">Click "Assemble Fleet" to form balanced teams.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {crews.map(crew => {
            const assignedCh = crew.assignedChallengeId ? challengesMap.get(crew.assignedChallengeId) : null;
            const fitScore = assignedCh ? evaluateChallengeFit(crew, assignedCh, participantsMap) : 0;

            return (
              <div key={crew.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg hover:border-slate-700 transition-all space-y-4">
                {/* Crew Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="font-pirate text-2xl text-parchment">{crew.name}</h3>
                    <div className="text-xs text-slate-400 mt-0.5">{crew.members.length} members</div>
                  </div>
                  {/* Fit Score */}
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Fit Score</div>
                    <div className={`font-pirate text-2xl ${fitScore >= 80 ? 'text-emerald-400' : fitScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                      {fitScore}%
                    </div>
                  </div>
                </div>

                {/* Req 11: Display team members, roles, and skills */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Members</div>
                  <div className="space-y-1.5">
                    {crew.members.map(m => {
                      const p = participantsMap.get(m.participantId);
                      if (!p) return null;
                      return (
                        <div key={m.participantId} className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-sm">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-parchment font-bold truncate">{p.name}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                              {m.assignedRole}
                            </span>
                          </div>
                          {/* Mini skill display */}
                          <div className="flex items-center gap-1 shrink-0">
                            {(Object.keys(SKILL_META) as (keyof SkillSet)[]).map(key => (
                              <span key={key} title={SKILL_META[key].label}
                                className="text-[10px] font-mono text-slate-400">
                                {SKILL_META[key].icon.charAt(0)}{p.skills[key]}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Crew Skill Totals */}
                <div className="grid grid-cols-6 gap-1 text-[10px]">
                  {(Object.keys(SKILL_META) as (keyof SkillSet)[]).map(key => (
                    <div key={key} className="text-center px-1 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="text-slate-500">{SKILL_META[key].icon}</div>
                      <div className="font-bold text-slate-200">{crew.axisScores[key]}</div>
                    </div>
                  ))}
                </div>

                {/* Req 13 & 14: Assign challenge and display */}
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-400 uppercase">Assigned Challenge:</label>
                    {assignedCh && (
                      <span className={`text-xs font-bold ${fitScore >= 80 ? 'text-emerald-400' : fitScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                        {fitScore}% Fit
                      </span>
                    )}
                  </div>
                  <select
                    value={crew.assignedChallengeId || ''}
                    onChange={e => assignChallengeToCrew(crew.id, e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-amber-300 outline-none focus:border-amber-400"
                  >
                    <option value="" disabled>Select a challenge...</option>
                    {challenges.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {assignedCh && (
                    <div className="text-xs text-slate-400 bg-slate-950/60 rounded-lg p-2.5 border border-slate-800">
                      <div className="font-bold text-parchment mb-1">{assignedCh.name}</div>
                      <div className="text-slate-400 mb-2">{assignedCh.description}</div>
                      {assignedCh.requiredRoles.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-1.5">
                          {assignedCh.requiredRoles.map(r => {
                            const hasCoverage = crew.members.some(m => m.assignedRole === r);
                            return (
                              <span key={r} className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                hasCoverage ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                              }`}>
                                {hasCoverage ? '✓' : '✗'} {r}
                              </span>
                            );
                          })}
                        </div>
                      )}
                      {assignedCh.requiredSkills.length > 0 && (
                        <div className="space-y-1">
                          {assignedCh.requiredSkills.map(rs => {
                            const avg = crew.members.length > 0 ? (crew.axisScores[rs.skill] || 0) / crew.members.length : 0;
                            const met = avg >= rs.minLevel;
                            const pct = Math.min(100, Math.round((avg / Math.max(1, rs.minLevel)) * 100));
                            return (
                              <div key={rs.skill} className="space-y-0.5">
                                <div className="flex justify-between text-[10px]">
                                  <span>{SKILL_META[rs.skill].icon} {SKILL_META[rs.skill].label}</span>
                                  <span className={met ? 'text-emerald-400' : 'text-amber-400'}>avg {avg.toFixed(1)}/{rs.minLevel} ({pct}%)</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full transition-all ${met ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
