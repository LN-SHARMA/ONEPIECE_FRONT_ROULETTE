import React, { useState } from 'react';
import { useFleetStore } from '../store/fleetStore';
import { ALL_ROLES, SKILL_META, SkillSet, PirateRole, RequiredSkill, Challenge } from '../types';

/* ────────────────────────────────────────────────────────────
   Req 5: Create activities or challenges
   Req 7: Define required skills or roles
   ──────────────────────────────────────────────────────────── */

export const ChallengeManager: React.FC = () => {
  const { challenges, addChallenge, deleteChallenge } = useFleetStore();
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<PirateRole[]>([]);
  const [requiredSkills, setRequiredSkills] = useState<RequiredSkill[]>([]);

  // Skill adder state
  const [addSkillKey, setAddSkillKey] = useState<keyof SkillSet>('combat');
  const [addSkillMin, setAddSkillMin] = useState(3);
  const [addSkillWeight, setAddSkillWeight] = useState(2);

  const handleToggleRole = (role: PirateRole) => {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const handleAddSkill = () => {
    if (requiredSkills.some(s => s.skill === addSkillKey)) return;
    setRequiredSkills(prev => [...prev, { skill: addSkillKey, minLevel: addSkillMin, weight: addSkillWeight }]);
  };

  const handleRemoveSkill = (skill: keyof SkillSet) => {
    setRequiredSkills(prev => prev.filter(s => s.skill !== skill));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await addChallenge({
      name: name.trim(),
      description: description.trim() || 'A new challenge',
      category: 'Combat',
      requiredRoles: selectedRoles,
      requiredSkills,
    });
    setName(''); setDescription(''); setSelectedRoles([]); setRequiredSkills([]);
    setShowForm(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-pirate text-3xl text-amber-300">Challenges</h2>
          <p className="text-sm text-slate-400 mt-0.5">{challenges.length} challenges sanctioned</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold text-sm shadow-lg shadow-orange-600/30 transition-all active:scale-95"
        >
          {showForm ? '✕ Close Form' : '+ Create Challenge'}
        </button>
      </div>

      {/* ── Create Challenge Form (Req 5, 7) ── */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-900/90 border border-orange-500/30 rounded-2xl p-5 space-y-4 shadow-xl animate-fadeIn">
          <h3 className="font-pirate text-xl text-parchment">New Challenge</h3>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Challenge Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} required
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:border-orange-400 outline-none" placeholder="e.g. Ship Repair Blitz" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:border-orange-400 outline-none resize-none" placeholder="Describe the challenge..." />
          </div>

          {/* Req 7: Required Roles */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Required Roles (click to toggle)</label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_ROLES.map(role => {
                const isActive = selectedRoles.includes(role);
                return (
                  <button key={role} type="button" onClick={() => handleToggleRole(role)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                      isActive
                        ? 'bg-orange-500/20 border-orange-500/50 text-orange-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {isActive ? '✓ ' : ''}{role}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Req 7: Required Skills */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Required Skills</label>

            {requiredSkills.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {requiredSkills.map(rs => (
                  <div key={rs.skill} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                    <span className="text-slate-200">{SKILL_META[rs.skill].icon} {SKILL_META[rs.skill].label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-amber-300">Min: {rs.minLevel}</span>
                      <span className="text-cyan-300">Weight: {rs.weight}x</span>
                      <button type="button" onClick={() => handleRemoveSkill(rs.skill)} className="text-red-400 hover:text-red-300 text-xs">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-end gap-2 flex-wrap">
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">Skill</label>
                <select value={addSkillKey} onChange={e => setAddSkillKey(e.target.value as keyof SkillSet)}
                  className="px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white outline-none">
                  {(Object.keys(SKILL_META) as (keyof SkillSet)[]).map(k => (
                    <option key={k} value={k}>{SKILL_META[k].label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">Min Level (1-5)</label>
                <input type="number" min={1} max={5} value={addSkillMin} onChange={e => setAddSkillMin(Number(e.target.value))}
                  className="w-16 px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white outline-none" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">Weight (1-5)</label>
                <input type="number" min={1} max={5} value={addSkillWeight} onChange={e => setAddSkillWeight(Number(e.target.value))}
                  className="w-16 px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white outline-none" />
              </div>
              <button type="button" onClick={handleAddSkill}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all">+ Add</button>
            </div>
          </div>

          <button type="submit" className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold text-sm shadow-lg transition-all">
            🏴‍☠️ Sanction This Challenge
          </button>
        </form>
      )}

      {/* ── Challenge List ── */}
      <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
        {challenges.map(c => (
          <div key={c.id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-2.5 hover:border-slate-700 transition-all">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-parchment text-sm">{c.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{c.description}</p>
              </div>
              <button onClick={() => deleteChallenge(c.id)} className="text-xs text-red-400 hover:text-red-300 shrink-0">✕</button>
            </div>

            {c.requiredRoles.length > 0 && (
              <div className="flex flex-wrap gap-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold mr-1 self-center">Roles:</span>
                {c.requiredRoles.map(r => (
                  <span key={r} className="px-2 py-0.5 rounded-full text-[10px] bg-orange-500/15 text-orange-300 border border-orange-500/30 font-bold">{r}</span>
                ))}
              </div>
            )}

            {c.requiredSkills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] text-slate-500 uppercase font-bold mr-1 self-center">Skills:</span>
                {c.requiredSkills.map(rs => (
                  <span key={rs.skill} className="px-2 py-0.5 rounded-full text-[10px] bg-blue-500/15 text-blue-300 border border-blue-500/30">
                    {SKILL_META[rs.skill].icon} {SKILL_META[rs.skill].label} ≥{rs.minLevel} ({rs.weight}x)
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        {challenges.length === 0 && <div className="text-center text-slate-500 py-8 text-sm">No challenges created yet.</div>}
      </div>
    </div>
  );
};
