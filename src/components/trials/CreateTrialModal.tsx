import React, { useState } from 'react';
import { useFleetStore } from '../../store/fleetStore';
import { Challenge, PirateRole, ALL_ROLES, CSE_ROLES, SkillSet, RequiredSkill, CSE_SKILL_META } from '../../types';
import { SKILL_AXES } from '../../services/teamEngine';
import { X, Plus, Trash2, Award, Cpu, Sparkles, Check } from 'lucide-react';

const CATEGORIES: Challenge['category'][] = [
  'Distributed Systems',
  'Fullstack Web',
  'DevOps & Cloud',
  'AI & Machine Learning',
  'Cybersecurity & Auditing',
  'Algorithms & DSA',
  'Technical',
  'Special',
];

interface CSEPreset {
  name: string;
  category: Challenge['category'];
  description: string;
  roles: PirateRole[];
  skills: RequiredSkill[];
}

const CSE_PRESETS: CSEPreset[] = [
  {
    name: 'Distributed Raft Consensus Engine',
    category: 'Distributed Systems',
    description: 'Implement a fault-tolerant leader election and log replication cluster in Go/Rust with strict partition tolerance.',
    roles: ['Tech Lead / Architect', 'Backend Systems Dev'],
    skills: [
      { skill: 'engineering', minLevel: 4, weight: 3 },
      { skill: 'combat', minLevel: 4, weight: 2 },
    ],
  },
  {
    name: 'Autonomous Multi-Agent AI Orchestrator',
    category: 'AI & Machine Learning',
    description: 'Build a decentralized agent swarm using LangChain, vector retrieval (RAG), and self-healing code evaluation pipelines.',
    roles: ['Tech Lead / Architect', 'AI / ML Engineer', 'Backend Systems Dev'],
    skills: [
      { skill: 'wits', minLevel: 4, weight: 3 },
      { skill: 'engineering', minLevel: 3, weight: 2 },
      { skill: 'combat', minLevel: 3, weight: 1 },
    ],
  },
  {
    name: 'Zero-Knowledge Cryptographic Audit',
    category: 'Cybersecurity & Auditing',
    description: 'Perform rigorous penetration testing, memory safety audits, and zk-SNARK proof verification for smart contract pipelines.',
    roles: ['Cybersecurity Analyst', 'Backend Systems Dev'],
    skills: [
      { skill: 'medical', minLevel: 4, weight: 3 },
      { skill: 'combat', minLevel: 4, weight: 2 },
    ],
  },
  {
    name: 'Kubernetes Multi-Region Cloud Migration',
    category: 'DevOps & Cloud',
    description: 'Architect auto-scaling Terraform infrastructure, zero-downtime blue-green deployments, and Prometheus/Grafana telemetry.',
    roles: ['DevOps / Cloud Architect', 'Tech Lead / Architect'],
    skills: [
      { skill: 'navigation', minLevel: 4, weight: 3 },
      { skill: 'engineering', minLevel: 3, weight: 2 },
    ],
  },
  {
    name: 'Real-Time Full-Stack Trading Gateway',
    category: 'Fullstack Web',
    description: 'Develop low-latency sub-millisecond WebSocket order book visualization with Next.js, WebGL canvases, and Redis Pub/Sub.',
    roles: ['Frontend Engineer', 'Backend Systems Dev', 'Tech Lead / Architect'],
    skills: [
      { skill: 'cooking', minLevel: 4, weight: 3 },
      { skill: 'engineering', minLevel: 4, weight: 2 },
      { skill: 'combat', minLevel: 3, weight: 1 },
    ],
  },
];

export const CreateTrialModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addChallenge } = useFleetStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Challenge['category']>('Distributed Systems');
  const [requiredRoles, setRequiredRoles] = useState<PirateRole[]>([
    'Tech Lead / Architect',
    'Backend Systems Dev',
  ]);
  const [requiredSkills, setRequiredSkills] = useState<RequiredSkill[]>([
    { skill: 'engineering', minLevel: 4, weight: 3 },
    { skill: 'combat', minLevel: 3, weight: 2 },
  ]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const toggleRole = (role: PirateRole) => {
    if (requiredRoles.includes(role)) {
      setRequiredRoles(requiredRoles.filter(r => r !== role));
    } else {
      setRequiredRoles([...requiredRoles, role]);
    }
  };

  const applyPreset = (preset: CSEPreset) => {
    setName(preset.name);
    setCategory(preset.category);
    setDescription(preset.description);
    setRequiredRoles(preset.roles);
    setRequiredSkills(preset.skills);
  };

  const addSkillRequirement = () => {
    const available = SKILL_AXES.find(a => !requiredSkills.some(rs => rs.skill === a));
    if (available) {
      setRequiredSkills([...requiredSkills, { skill: available, minLevel: 3, weight: 2 }]);
    }
  };

  const removeSkillRequirement = (idx: number) => {
    setRequiredSkills(requiredSkills.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await addChallenge({
      name: name.trim(),
      description: description.trim() || 'A high-impact technical engineering challenge for grand fleet engineers.',
      category,
      requiredRoles,
      requiredSkills,
    });

    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onPointerDown={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      <div className="w-full max-w-2xl bg-slate-950 border-2 border-orange-500/50 rounded-3xl p-6 sm:p-8 text-slate-100 shadow-2xl relative my-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-2">
          <span className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/40">
            <Cpu className="w-6 h-6" />
          </span>
          <div>
            <h3 className="font-pirate text-3xl text-parchment">Create CSE Challenge</h3>
            <p className="text-xs text-slate-400">Define software engineering trials, required CSE roles, and weighted skill thresholds</p>
          </div>
        </div>

        {/* Quick CSE Project Presets */}
        <div className="my-4 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
          <label className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Quick CSE Presets:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {CSE_PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => applyPreset(p)}
                className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-medium transition-all hover:border-amber-400 cursor-pointer"
              >
                + {p.name}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Challenge / Project Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Distributed Key-Value Store with Raft"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm outline-none focus:border-orange-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Domain / Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-orange-400 cursor-pointer"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Engineering Brief / Spec
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Architectural spec and deliverables..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none"
              />
            </div>
          </div>

          {/* Required CSE Roles */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-amber-300 mb-1.5">
              Required CSE Engineering Roles (Team Must Field These):
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CSE_ROLES.map((r) => {
                const isSelected = requiredRoles.includes(r);
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => toggleRole(r)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-bold shadow'
                        : 'bg-slate-900 border border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {r}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Required CSE Skills & Weights */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-orange-300">
                Required Technical Skills (Thresholds & Weights):
              </label>
              {requiredSkills.length < SKILL_AXES.length && (
                <button
                  type="button"
                  onClick={addSkillRequirement}
                  className="flex items-center gap-1 text-[11px] text-orange-400 hover:text-orange-300 cursor-pointer font-bold"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Required Skill
                </button>
              )}
            </div>

            <div className="space-y-2">
              {requiredSkills.map((rs, idx) => {
                const meta = CSE_SKILL_META[rs.skill];
                return (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
                    <select
                      value={rs.skill}
                      onChange={(e) => {
                        const updated = [...requiredSkills];
                        updated[idx].skill = e.target.value as keyof SkillSet;
                        setRequiredSkills(updated);
                      }}
                      className="bg-transparent text-white font-semibold outline-none flex-1 cursor-pointer"
                    >
                      {SKILL_AXES.map(a => (
                        <option key={a} value={a} className="bg-slate-950">
                          {CSE_SKILL_META[a]?.icon} {CSE_SKILL_META[a]?.label}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 text-[11px]">Min Lvl:</span>
                        <input
                          type="number"
                          min={1}
                          max={5}
                          value={rs.minLevel}
                          onChange={(e) => {
                            const updated = [...requiredSkills];
                            updated[idx].minLevel = parseInt(e.target.value) || 1;
                            setRequiredSkills(updated);
                          }}
                          className="w-12 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-center text-amber-400 font-bold"
                        />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 text-[11px]">Weight:</span>
                        <input
                          type="number"
                          min={1}
                          max={5}
                          value={rs.weight}
                          onChange={(e) => {
                            const updated = [...requiredSkills];
                            updated[idx].weight = parseInt(e.target.value) || 1;
                            setRequiredSkills(updated);
                          }}
                          className="w-12 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-center text-orange-400 font-bold"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => removeSkillRequirement(idx)}
                        className="p-1 text-slate-500 hover:text-red-400 cursor-pointer"
                        aria-label="Remove requirement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-pirate text-xl uppercase tracking-wider shadow-lg shadow-orange-600/30 transition-all cursor-pointer"
            >
              Sanction CSE Challenge
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
