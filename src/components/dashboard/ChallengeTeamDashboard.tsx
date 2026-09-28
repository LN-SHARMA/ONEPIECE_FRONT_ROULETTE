import React, { useState } from 'react';
import { useFleetStore } from '../../store/fleetStore';
import { useAuthStore } from '../../store/authStore';
import { Challenge, Crew, CSE_SKILL_META, SkillSet } from '../../types';
import { evaluateChallengeFit } from '../../services/teamEngine';
import { JollyRogerAvatar } from '../common/SvgIcons';
import { CreateTrialModal } from '../trials/CreateTrialModal';
import { 
  Trophy, Users, CheckCircle2, Circle, AlertTriangle, Shield, Cpu, Code, 
  Layers, Plus, RefreshCw, Copy, Check, ChevronRight, X, ExternalLink, Sparkles, Lock
} from 'lucide-react';

interface ChallengeTeamDashboardProps {
  onClose?: () => void;
  initialChallengeId?: string;
}

export const ChallengeTeamDashboard: React.FC<ChallengeTeamDashboardProps> = ({ 
  onClose, 
  initialChallengeId 
}) => {
  const { 
    challenges, 
    crews, 
    participants, 
    assignChallengeToCrew, 
    assignChallengeToTeam,
    toggleChallengeCompletion,
    assembleFleet, 
    showToast 
  } = useFleetStore();
  const { isAuthenticated, requireAuth } = useAuthStore();

  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(
    initialChallengeId || challenges[0]?.id || ''
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const participantsMap = new Map(participants.map(p => [p.id, p]));
  const activeChallenge = challenges.find(c => c.id === selectedChallengeId) || challenges[0];

  // Find currently assigned crew or best fit crew
  const assignedCrew = crews.find(c => c.assignedChallengeId === activeChallenge?.id) || crews[0];
  const [activeCrewId, setActiveCrewId] = useState<string>(assignedCrew?.id || crews[0]?.id || '');

  // Keep activeCrew synced if assigned crew changes
  const currentCrew = crews.find(c => c.id === activeCrewId) || assignedCrew || crews[0];

  if (!activeChallenge || !currentCrew) {
    return (
      <div className="p-8 text-center text-slate-400">
        No challenges or teams available. Please assemble the fleet first.
      </div>
    );
  }

  // Calculate live fit score for current crew against active challenge
  const fitScore = evaluateChallengeFit(currentCrew, activeChallenge, participantsMap);

  // Check required roles coverage
  const assignedRolesSet = new Set(currentCrew.members.map(m => m.assignedRole));

  // Handle reassigning team to this challenge
  const handleAssignTeam = async (crewId: string) => {
    if (!requireAuth('assign team to challenge')) return;
    setActiveCrewId(crewId);
    await assignChallengeToCrew(crewId, activeChallenge.id);
    showToast({
      title: 'Team Assigned to Challenge!',
      message: `${crews.find(c => c.id === crewId)?.name} is now deployed for ${activeChallenge.name}`,
      type: 'info',
    });
  };

  const handleExportRoster = () => {
    const exportData = {
      challenge: {
        name: activeChallenge.name,
        category: activeChallenge.category,
        description: activeChallenge.description,
        requiredRoles: activeChallenge.requiredRoles,
        requiredSkills: activeChallenge.requiredSkills,
      },
      team: {
        name: currentCrew.name,
        ship: currentCrew.shipName,
        fitScore: fitScore,
        members: currentCrew.members.map(m => {
          const p = participantsMap.get(m.participantId);
          return {
            name: p?.name,
            role: m.assignedRole,
            skills: p?.skills,
          };
        }),
      },
    };
    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    showToast({
      title: 'Team Deployment Sheet Copied!',
      message: 'Challenge and member specs copied to clipboard in JSON format.',
      type: 'info',
    });
  };

  return (
    <div 
      onPointerDown={(e) => e.stopPropagation()}
      className="w-full max-w-7xl mx-auto my-6 bg-slate-950/95 border-2 border-amber-500/40 rounded-3xl p-4 sm:p-7 shadow-2xl backdrop-blur-xl relative text-slate-100 font-body overflow-hidden"
    >
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-800 gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Cpu className="w-6 h-6" />
            </span>
            <div>
              <h2 className="font-pirate text-2xl sm:text-3xl text-parchment tracking-wide flex items-center gap-2">
                CSE Challenge & Team Selection Dashboard
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Inspect engineering challenges, audit assigned developer teams, verify member CSE proficiencies & fit coverage
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              if (!requireAuth('create a CSE challenge')) return;
              setShowCreateModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-lg shadow-orange-600/30 transition-all cursor-pointer"
          >
            {isAuthenticated ? <Plus className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            <span>Create CSE Challenge</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              aria-label="Close dashboard"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* CHALLENGE SELECTOR TABS & DROPDOWN */}
      {/* ======================================================== */}
      <div className="mt-5 space-y-2 relative z-10">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Trophy className="w-4 h-4" /> Select Challenge:
          </label>
          <span className="text-[11px] text-slate-400 font-mono">
            {challenges.length} Sanctioned Challenges
          </span>
        </div>

        {/* Scrollable Challenge Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {challenges.map((c) => {
            const isSelected = c.id === activeChallenge.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setSelectedChallengeId(c.id);
                  const pairedCrew = crews.find(cr => cr.assignedChallengeId === c.id);
                  if (pairedCrew) setActiveCrewId(pairedCrew.id);
                }}
                className={`flex-shrink-0 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md shadow-amber-500/20 scale-[1.02]'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {c.isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>{c.name}</span>
                </span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-black ${
                  isSelected ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {c.category}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2-COLUMN MAIN CONTENT: CHALLENGE SPEC vs SELECTED TEAM */}
      {/* ======================================================== */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-5 relative z-10">
        
        {/* LEFT COLUMN (5 cols): Challenge Specs & Requirements */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Challenge Detail Card */}
          <div className={`bg-slate-900/90 border rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xl transition-all ${
            activeChallenge.isCompleted ? 'border-emerald-500/60 ring-1 ring-emerald-500/20' : 'border-slate-800'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-950 text-orange-400 border border-orange-500/40">
                    {activeChallenge.category}
                  </span>
                  {activeChallenge.isCompleted && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-950/90 text-emerald-300 border border-emerald-500/50">
                      <Check className="w-3 h-3 text-emerald-400" /> Completed
                    </span>
                  )}
                </div>
                <h3 className="font-pirate text-2xl text-parchment leading-tight">
                  {activeChallenge.name}
                </h3>
              </div>

              {/* Tick-Check Completion Button */}
              <button
                type="button"
                onClick={() => toggleChallengeCompletion(activeChallenge.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer shrink-0 ${
                  activeChallenge.isCompleted
                    ? 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/50 text-emerald-300 shadow-emerald-500/20'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white hover:border-amber-500/50'
                }`}
                title={activeChallenge.isCompleted ? 'Mark challenge as incomplete' : 'Tick-check challenge as completed'}
              >
                {activeChallenge.isCompleted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                    <span>Completed</span>
                  </>
                ) : (
                  <>
                    <Circle className="w-4 h-4 text-slate-400" />
                    <span>Mark Complete</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              {activeChallenge.description}
            </p>

            {/* Required CSE Roles Checklist */}
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Required Engineering Archetypes:
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {activeChallenge.requiredRoles.map((role) => {
                  const isCovered = assignedRolesSet.has(role);
                  return (
                    <span
                      key={role}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                        isCovered
                          ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                          : 'bg-red-950/80 border-red-500/40 text-red-300'
                      }`}
                    >
                      {isCovered ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                      )}
                      <span>{role}</span>
                      <span className="text-[9px] opacity-75">
                        {isCovered ? '(Covered)' : '(Missing)'}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Required CSE Skills Matrix */}
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Weighted Skill Thresholds:
              </h4>
              <div className="space-y-2">
                {activeChallenge.requiredSkills.map((req) => {
                  const meta = CSE_SKILL_META[req.skill];
                  const currentTeamPoints = currentCrew.axisScores[req.skill] || 0;
                  const targetPoints = req.minLevel * Math.min(currentCrew.members.length, 2);
                  const isMet = currentTeamPoints >= targetPoints;
                  const pct = Math.min(100, Math.round((currentTeamPoints / Math.max(1, targetPoints)) * 100));

                  return (
                    <div 
                      key={req.skill}
                      className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                          <span>{meta?.icon || '⚡'}</span>
                          <span>{meta?.label || req.skill}</span>
                        </span>
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className="text-slate-400">Weight: {req.weight}x</span>
                          <span className={`font-bold ${isMet ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {currentTeamPoints} / {targetPoints} pts ({pct}%)
                          </span>
                        </div>
                      </div>

                      {/* Comparison Progress Bar */}
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                        <div
                          className={`h-full transition-all duration-500 ${
                            isMet ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-amber-500 to-orange-400'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (7 cols): Selected Team Overview & Member Roster */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Selected Team Overview Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Select & Field Fleet Team:
                </span>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <select
                    value={currentCrew.id}
                    onChange={(e) => setActiveCrewId(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 border border-amber-500/40 font-pirate text-xl text-amber-300 outline-none cursor-pointer"
                  >
                    {crews.map(cr => (
                      <option key={cr.id} value={cr.id}>
                        {cr.name} ({cr.members.length} Members)
                      </option>
                    ))}
                  </select>

                  {/* Explicit Assign Button / Status */}
                  {currentCrew.assignedChallengeId === activeChallenge.id ? (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> Assigned to this Trial
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleAssignTeam(currentCrew.id)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Assign Challenge to Team</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Fit Score Gauge */}
              <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2 rounded-2xl border border-slate-800">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    Challenge Fit Score
                  </div>
                  <div className="text-xs font-semibold text-slate-300">
                    {fitScore >= 80 ? '🌟 Optimal Field' : fitScore >= 60 ? '⚡ Competent' : '⚠️ Gaps Present'}
                  </div>
                </div>
                <div className={`font-pirate text-3xl font-black ${
                  fitScore >= 80 ? 'text-emerald-400' : fitScore >= 60 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {fitScore}%
                </div>
              </div>
            </div>

            {/* Warnings or Advisories */}
            {currentCrew.warnings && currentCrew.warnings.length > 0 && (
              <div className="space-y-1.5">
                {currentCrew.warnings.map((w, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{w.suggestion}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Team Members Roster Grid for this Challenge */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-400" />
                  Assigned Team Members ({currentCrew.members.length}):
                </h4>
                <span className="text-[10px] text-slate-400">
                  Individual CSE Skill Competencies
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                {currentCrew.members.map((member) => {
                  const pirate = participantsMap.get(member.participantId);
                  if (!pirate) return null;

                  return (
                    <div
                      key={member.participantId}
                      className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 p-3 rounded-xl flex flex-col justify-between shadow transition-all hover:bg-slate-900/60"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-800/80">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-slate-900 border border-amber-500/30 flex items-center justify-center">
                            <JollyRogerAvatar
                              hatType={pirate.jollyRogerStyle?.hatType || 'straw'}
                              symbol={pirate.jollyRogerStyle?.symbol || 'crossbones'}
                              size={22}
                            />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-parchment leading-tight truncate max-w-[130px]">
                              {pirate.name}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
                              {pirate.epithet}
                            </div>
                          </div>
                        </div>

                        {/* Assigned CSE Role Badge */}
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-blue-950 border border-blue-500/40 text-blue-300">
                          {member.assignedRole}
                        </span>
                      </div>

                      {/* CSE 6-Axis Skills Micro-Matrix */}
                      <div className="grid grid-cols-3 gap-1 text-[10px] text-slate-300 font-mono">
                        <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                          <span title="Algorithms & DSA">⚡ DSA</span>
                          <strong className="text-amber-400">{pirate.skills.combat}</strong>
                        </div>
                        <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                          <span title="Backend Systems">⚙️ Back</span>
                          <strong className="text-cyan-400">{pirate.skills.engineering}</strong>
                        </div>
                        <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                          <span title="Frontend & UI/UX">🎨 Front</span>
                          <strong className="text-pink-400">{pirate.skills.cooking}</strong>
                        </div>
                        <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                          <span title="Cloud & DevOps">☁️ Cloud</span>
                          <strong className="text-sky-400">{pirate.skills.navigation}</strong>
                        </div>
                        <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                          <span title="Cybersecurity & QA">🛡️ Sec</span>
                          <strong className="text-emerald-400">{pirate.skills.medical}</strong>
                        </div>
                        <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                          <span title="AI & System Design">🧠 AI</span>
                          <strong className="text-purple-400">{pirate.skills.wits}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions Footer Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <div className="text-xs text-slate-400">
                Assigned to: <strong className="text-amber-400 font-pirate text-lg">{currentCrew.name}</strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => assembleFleet(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reshuffle Teams</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportRoster}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Export Specs'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Embedded Create Trial Modal */}
      {showCreateModal && (
        <CreateTrialModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};
