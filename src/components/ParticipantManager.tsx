import React, { useState } from 'react';
import { useFleetStore } from '../store/fleetStore';
import { ALL_ROLES, SKILL_META, SkillSet, PirateRole, Participant } from '../types';

/* ────────────────────────────────────────────────────────────
   Req 1: Create participant profiles
   Req 2: Add skills and interests
   Req 3: Add preferred roles
   Req 4: Display participant information
   ──────────────────────────────────────────────────────────── */

export const ParticipantManager: React.FC = () => {
  const { participants, addParticipant, deleteParticipant } = useFleetStore();
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [epithet, setEpithet] = useState('');
  const [primaryRole, setPrimaryRole] = useState<PirateRole>('Swordsman');
  const [secondaryRole, setSecondaryRole] = useState<PirateRole>('Navigator');
  const [skills, setSkills] = useState<SkillSet>({ combat: 3, navigation: 3, cooking: 3, medical: 3, engineering: 3, wits: 3 });
  const [interests, setInterests] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await addParticipant({
      name: name.trim(),
      epithet: epithet.trim() || 'New Recruit',
      primaryRole,
      secondaryRole,
      skills,
      interests: interests.split(',').map(s => s.trim()).filter(Boolean),
    });
    setName(''); setEpithet(''); setInterests('');
    setSkills({ combat: 3, navigation: 3, cooking: 3, medical: 3, engineering: 3, wits: 3 });
    setShowForm(false);
  };

  const setSkill = (key: keyof SkillSet, val: number) => {
    setSkills(prev => ({ ...prev, [key]: Math.max(1, Math.min(5, val)) }));
  };

  const filtered = participants.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.primaryRole.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-pirate text-3xl text-amber-300">Pirate Roster</h2>
          <p className="text-sm text-slate-400 mt-0.5">{participants.length} participants enlisted</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-sm shadow-lg shadow-amber-600/30 transition-all active:scale-95"
        >
          {showForm ? '✕ Close Form' : '+ Enlist New Pirate'}
        </button>
      </div>

      {/* ── Create Participant Form (Req 1, 2, 3) ── */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-5 space-y-4 shadow-xl animate-fadeIn">
          <h3 className="font-pirate text-xl text-parchment">Enlistment Form</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Name *</label>
              <input value={name} onChange={e => setName(e.target.value)} required
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:border-amber-400 outline-none" placeholder="e.g. Zoro" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Epithet</label>
              <input value={epithet} onChange={e => setEpithet(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:border-amber-400 outline-none" placeholder="e.g. Pirate Hunter" />
            </div>
          </div>

          {/* Req 3: Preferred Roles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Primary Role</label>
              <select value={primaryRole} onChange={e => setPrimaryRole(e.target.value as PirateRole)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-amber-300 outline-none">
                {ALL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Secondary Role</label>
              <select value={secondaryRole} onChange={e => setSecondaryRole(e.target.value as PirateRole)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-amber-300 outline-none">
                {ALL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {/* Req 2: Skills */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Skills (1-5)</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {(Object.keys(SKILL_META) as (keyof SkillSet)[]).map(key => (
                <div key={key} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm">
                  <span className="text-slate-300">{SKILL_META[key].icon} {SKILL_META[key].label}</span>
                  <div className="flex items-center gap-1.5">
                    <button type="button" onClick={() => setSkill(key, skills[key] - 1)} className="w-6 h-6 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold">−</button>
                    <span className="w-5 text-center font-bold text-amber-400">{skills[key]}</span>
                    <button type="button" onClick={() => setSkill(key, skills[key] + 1)} className="w-6 h-6 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold">+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Req 2: Interests */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Interests (comma-separated)</label>
            <input value={interests} onChange={e => setInterests(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:border-amber-400 outline-none" placeholder="e.g. Swords, Sake, Training" />
          </div>

          <button type="submit" className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg transition-all">
            ⚓ Enlist This Pirate
          </button>
        </form>
      )}

      {/* Search */}
      <input
        value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Search by name or role..."
        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:border-amber-400 outline-none"
      />

      {/* ── Participant List (Req 4: Display participant information) ── */}
      <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
        {filtered.map(p => {
          const isExpanded = expandedId === p.id;
          const skillSum = Object.values(p.skills).reduce((a, b) => a + b, 0);
          return (
            <div key={p.id}
              className={`rounded-xl border transition-all ${isExpanded ? 'bg-slate-900/95 border-amber-500/50 shadow-lg' : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'}`}>
              {/* Summary row */}
              <div className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : p.id)}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-lg shrink-0">
                    🏴‍☠️
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-parchment text-sm truncate">{p.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{p.epithet}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">{p.primaryRole}</span>
                  <span className="text-xs text-slate-500 font-mono">Σ{skillSum}</span>
                  <span className="text-slate-500 text-xs">{isExpanded ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Expanded details (Req 4) */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-slate-800 pt-3 animate-fadeIn">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-slate-400">Primary:</span> <span className="text-amber-300 font-bold">{p.primaryRole}</span></div>
                    <div><span className="text-slate-400">Secondary:</span> <span className="text-cyan-300 font-bold">{p.secondaryRole}</span></div>
                  </div>

                  {/* Skills display */}
                  <div className="grid grid-cols-3 gap-1.5">
                    {(Object.keys(SKILL_META) as (keyof SkillSet)[]).map(key => (
                      <div key={key} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                        <span className="text-slate-300">{SKILL_META[key].icon} {SKILL_META[key].label}</span>
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map(v => (
                            <div key={v} className={`w-2 h-2 rounded-full ${v <= p.skills[key] ? 'bg-amber-400' : 'bg-slate-700'}`} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Interests */}
                  {p.interests.length > 0 && (
                    <div>
                      <span className="text-[11px] text-slate-400 uppercase font-bold">Interests: </span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {p.interests.map((int, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 border border-slate-700 text-slate-300">{int}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <button onClick={() => deleteParticipant(p.id)}
                    className="text-xs text-red-400 hover:text-red-300 underline transition-colors">Remove from roster</button>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && <div className="text-center text-slate-500 py-8 text-sm">No participants found.</div>}
      </div>
    </div>
  );
};
