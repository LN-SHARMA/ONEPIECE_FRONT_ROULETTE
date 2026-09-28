import React, { useState } from 'react';
import { useFleetStore } from '../../store/fleetStore';
import { useAuthStore } from '../../store/authStore';
import { SkillSet, CSE_SKILL_META, GrandFleetSkillConfig } from '../../types';
import { SKILL_AXES } from '../../services/teamEngine';
import { 
  X, 
  Sparkles, 
  Shield, 
  Zap, 
  Sliders, 
  Users, 
  Check, 
  CheckCircle2, 
  Plus, 
  Ship, 
  Target,
  ArrowRight,
  RefreshCw,
  Award
} from 'lucide-react';

interface AddGrandFleetModalProps {
  onClose: () => void;
}

const FLEET_NAME_PRESETS = [
  'Straw Hat Grand Armada',
  'Sun God Cyber Fleet',
  'New World Vanguard Fleet',
  'Red Hair Corsairs',
  'Whitebeard Aegis Fleet',
  'Laugh Tale Navigators',
  'Cipher Pol Black Ops Fleet',
];

export const AddGrandFleetModal: React.FC<AddGrandFleetModalProps> = ({ onClose }) => {
  const { 
    participants, 
    crews, 
    stowaways, 
    eventConfig, 
    createGrandFleetWithSkills, 
    addCustomFleetDivision, 
    isGenerating 
  } = useFleetStore();

  const [activeTab, setActiveTab] = useState<'fleet' | 'division'>('fleet');

  // Tab 1: Grand Fleet by Skills State
  const [fleetName, setFleetName] = useState('Straw Hat Grand Armada');
  const [selectedSkills, setSelectedSkills] = useState<(keyof SkillSet)[]>([
    'combat',
    'navigation',
    'engineering',
    'medical',
  ]);
  const [skillWeights, setSkillWeights] = useState<Partial<Record<keyof SkillSet, number>>>({
    combat: 1.5,
    navigation: 1.2,
    engineering: 1.5,
    medical: 1.0,
    cooking: 1.0,
    wits: 1.0,
  });
  const [targetFitThreshold, setTargetFitThreshold] = useState<number>(85);
  const [autoOptimize, setAutoOptimize] = useState<boolean>(true);
  const [crewSize, setCrewSize] = useState<number>(eventConfig.crewSize || 4);

  // Tab 2: Single Division State
  const [divisionName, setDivisionName] = useState(`Division #${crews.length + 1} Vanguard`);
  const [shipName, setShipName] = useState('Polar Tang Refit');
  const [divSize, setDivSize] = useState<number>(4);
  const [divSkills, setDivSkills] = useState<(keyof SkillSet)[]>(['engineering', 'wits']);

  // Toggle skill selection
  const handleToggleSkill = (skill: keyof SkillSet) => {
    if (selectedSkills.includes(skill)) {
      if (selectedSkills.length > 1) {
        setSelectedSkills(selectedSkills.filter(s => s !== skill));
      }
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleToggleDivSkill = (skill: keyof SkillSet) => {
    if (divSkills.includes(skill)) {
      if (divSkills.length > 1) {
        setDivSkills(divSkills.filter(s => s !== skill));
      }
    } else {
      setDivSkills([...divSkills, skill]);
    }
  };

  // Submit Grand Fleet Creation
  const handleCreateGrandFleet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!useAuthStore.getState().requireAuth('create and configure a Grand Fleet')) return;
    const config: GrandFleetSkillConfig = {
      fleetName: fleetName.trim() || 'Grand Fleet',
      crewSize,
      selectedSkills,
      skillWeights,
      targetFitThreshold,
      autoOptimizeIfLowFit: autoOptimize,
    };
    await createGrandFleetWithSkills(config);
    onClose();
  };

  // Submit Single Division Creation
  const handleCreateDivision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!useAuthStore.getState().requireAuth('commission a new fleet division')) return;
    await addCustomFleetDivision(
      divisionName.trim() || `Grand Fleet Division #${crews.length + 1}`,
      shipName.trim() || 'Thousand Sunny Refit',
      divSkills,
      divSize
    );
    onClose();
  };

  // Current fleet average fit score
  const currentAvgFit = crews.length > 0
    ? Math.round(crews.reduce((acc, c) => acc + (c.fitScore || 0), 0) / crews.length)
    : null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-3xl my-8 bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-100 font-body overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-inner">
              <Shield className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Command Fleet Protocol
                </span>
                <span className="text-xs text-slate-400">Algorithmic Skill Matching</span>
              </div>
              <h3 className="font-pirate text-3xl text-parchment tracking-wide mt-0.5">
                Add & Configure Grand Fleet
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Navigation Tabs */}
        <div className="flex items-center gap-2 mt-5 p-1 rounded-2xl bg-slate-950/80 border border-slate-800 relative z-10">
          <button
            type="button"
            onClick={() => setActiveTab('fleet')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'fleet'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Form Grand Fleet by Selected Skills</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('division')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'division'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Targeted Fleet Division</span>
          </button>
        </div>

        {/* TAB 1: FORM FULL GRAND FLEET BY SKILLS */}
        {activeTab === 'fleet' && (
          <form onSubmit={handleCreateGrandFleet} className="mt-5 space-y-5 relative z-10">
            {/* Fleet Name Input & Presets */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Grand Fleet Designation Name
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const next = FLEET_NAME_PRESETS[Math.floor(Math.random() * FLEET_NAME_PRESETS.length)];
                    setFleetName(next);
                  }}
                  className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-medium"
                >
                  <RefreshCw className="w-3 h-3" /> Randomize Name
                </button>
              </div>
              <input
                type="text"
                value={fleetName}
                onChange={(e) => setFleetName(e.target.value)}
                placeholder="e.g. Straw Hat Grand Armada"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-parchment font-semibold outline-none focus:border-amber-400"
                required
              />
            </div>

            {/* Select Skills Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Target className="w-4 h-4" />
                  Select Assignment Skills ({selectedSkills.length} of 6 active)
                </label>
                <span className="text-[11px] text-slate-400">
                  Candidates are prioritized and distributed based on selected competencies
                </span>
              </div>

              {/* 6 Skill Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {SKILL_AXES.map((axis) => {
                  const meta = CSE_SKILL_META[axis];
                  const isSelected = selectedSkills.includes(axis);
                  const weight = skillWeights[axis] || 1.0;

                  return (
                    <div
                      key={axis}
                      onClick={() => handleToggleSkill(axis)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between select-none ${
                        isSelected
                          ? 'bg-amber-950/40 border-amber-500/60 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 opacity-60 hover:opacity-90'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{meta.icon}</span>
                          <div>
                            <div className="text-xs font-bold text-slate-200 leading-tight">
                              {meta.label}
                            </div>
                            <div className="text-[10px] text-amber-400 font-mono">
                              {meta.tag}
                            </div>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors ${
                          isSelected ? 'bg-amber-500 border-amber-400 text-slate-950' : 'border-slate-700'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>

                      {/* Weight Selector */}
                      {isSelected && (
                        <div 
                          className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="text-slate-400">Priority Weight:</span>
                          <select
                            value={weight}
                            onChange={(e) => setSkillWeights({ ...skillWeights, [axis]: parseFloat(e.target.value) })}
                            className="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-amber-300 font-bold outline-none"
                          >
                            <option value="1.0">Standard (x1.0)</option>
                            <option value="1.5">High (x1.5)</option>
                            <option value="2.0">Critical (x2.0)</option>
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Target Fit Criteria & Auto-Optimization */}
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-400" />
                    Target Fleet Fit Criteria Threshold:
                  </label>
                  <p className="text-[11px] text-slate-400">
                    If candidate pairings result in less fit, the system automatically creates an optimized fleet.
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-pirate text-2xl text-emerald-400 font-bold">
                    {targetFitThreshold}%
                  </span>
                  <span className="text-[10px] text-slate-400 block uppercase">Min Fit Score</span>
                </div>
              </div>

              {/* Slider for Fit Threshold */}
              <input
                type="range"
                min={65}
                max={95}
                step={5}
                value={targetFitThreshold}
                onChange={(e) => setTargetFitThreshold(parseInt(e.target.value))}
                className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />

              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>65% (Relaxed)</span>
                <span>80% (Recommended Standard)</span>
                <span>90%+ (Master Tier)</span>
              </div>

              {/* Auto-Optimization Checkbox */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoOptimize}
                    onChange={(e) => setAutoOptimize(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-slate-200">
                    Automatically create & optimize Grand Fleet if fit criteria is less than {targetFitThreshold}%
                  </span>
                </label>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                  Auto-Balance Engine
                </span>
              </div>
            </div>

            {/* Division Configuration */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="text-xs font-semibold text-slate-200">
                    Division Crew Size: <strong className="text-amber-400">{crewSize} Pirates/Ship</strong>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Forms ~{Math.floor(participants.length / crewSize)} Divisions from {participants.length} Available Candidates
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {[3, 4, 5, 6].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setCrewSize(size)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      crewSize === size
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Fleet Diagnostic */}
            {currentAvgFit !== null && (
              <div className="flex items-center justify-between text-xs px-2 text-slate-400">
                <span>Current Fleet Fit: <strong className={currentAvgFit >= 80 ? 'text-emerald-400' : 'text-amber-400'}>{currentAvgFit}%</strong></span>
                <span>Target Criteria: <strong className="text-emerald-400">{targetFitThreshold}%</strong></span>
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isGenerating}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-slate-950 font-pirate text-xl uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <Zap className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'Assembling Fleet...' : 'Create & Deploy Grand Fleet'}</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: ADD SINGLE FLEET DIVISION */}
        {activeTab === 'division' && (
          <form onSubmit={handleCreateDivision} className="mt-5 space-y-4 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Division Name
                </label>
                <input
                  type="text"
                  value={divisionName}
                  onChange={(e) => setDivisionName(e.target.value)}
                  placeholder="e.g. Division #4 Vanguard"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-parchment font-semibold outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Flagship Name
                </label>
                <input
                  type="text"
                  value={shipName}
                  onChange={(e) => setShipName(e.target.value)}
                  placeholder="e.g. Polar Tang Refit"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-parchment font-semibold outline-none focus:border-amber-400"
                  required
                />
              </div>
            </div>

            {/* Division Size */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Division Crew Size
                </label>
                <span className="text-xs text-amber-400 font-bold">{divSize} Candidates</span>
              </div>
              <div className="flex items-center gap-2">
                {[2, 3, 4, 5, 6].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setDivSize(s)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      divSize === s
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {s} Pirates
                  </button>
                ))}
              </div>
            </div>

            {/* Division Specialization Skills */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Division Skill Specialization Focus ({divSkills.length} selected):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SKILL_AXES.map((axis) => {
                  const meta = CSE_SKILL_META[axis];
                  const isSelected = divSkills.includes(axis);

                  return (
                    <button
                      key={axis}
                      type="button"
                      onClick={() => handleToggleDivSkill(axis)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-950/50 border-amber-500/60 text-amber-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-lg">{meta.icon}</span>
                      <span className="text-xs font-bold truncate">{meta.label}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-400">
                Candidates with highest proficiency in these skills will be drafted into this division.
              </p>
            </div>

            {/* Candidates Pool Notice */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
              <span>Unassigned Candidates in Pool:</span>
              <strong className="text-amber-400 font-pirate text-lg">
                {stowaways.length > 0 ? `${stowaways.length} Stowaways` : `${participants.length} Total Candidates`}
              </strong>
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-pirate text-xl uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Commission Division</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
