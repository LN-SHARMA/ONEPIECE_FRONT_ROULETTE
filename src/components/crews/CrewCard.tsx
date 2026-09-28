import React, { useState } from 'react';
import { Crew, Participant, ALL_ROLES } from '../../types';
import { useFleetStore } from '../../store/fleetStore';
import { useAuthStore } from '../../store/authStore';
import { useAudioStore } from '../../store/audioStore';
import { deriveHaki } from '../../services/teamEngine';
import { CrewRadarChart } from './CrewRadarChart';
import { JollyRogerAvatar, DevilFruitSwirlIcon } from '../common/SvgIcons';
import { 
  Lock, 
  Unlock, 
  Pin, 
  PinOff, 
  AlertTriangle, 
  Zap, 
  Shield, 
  Eye, 
  Ship, 
  Check, 
  Award,
  Users,
  ChevronDown,
  ChevronUp,
  Trash2,
  UserPlus,
  X
} from 'lucide-react';

interface CrewCardProps {
  crew: Crew;
  participantsMap: Map<string, Participant>;
  onDragStartMember?: (crewId: string, participantId: string) => void;
  onDropMember?: (targetCrewId: string) => void;
}

export const CrewCard: React.FC<CrewCardProps> = ({
  crew,
  participantsMap,
  onDragStartMember,
  onDropMember,
}) => {
  const { 
    toggleCrewLock, 
    toggleMemberPin, 
    eventConfig, 
    challenges, 
    assignChallengeToCrew,
    addMemberToCrew,
    removeMemberFromCrew,
    participants 
  } = useFleetStore();
  const { isAuthenticated, requireAuth } = useAuthStore();
  const { playSwordClash, playWoodClick } = useAudioStore();

  const [showMembers, setShowMembers] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [selectedParticipantId, setSelectedParticipantId] = useState('');

  const currentMemberIds = new Set(crew.members.map(m => m.participantId));
  const availableCandidates = participants.filter(p => !currentMemberIds.has(p.id));

  const handleDragOver = (e: React.DragEvent) => {
    if (!isAuthenticated) return;
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!requireAuth('swap crew members between divisions')) return;
    e.preventDefault();
    playSwordClash();
    onDropMember?.(crew.id);
  };

  const handleToggleCrewLock = () => {
    playSwordClash();
    toggleCrewLock(crew.id);
  };

  const handleAssignChallenge = (challengeId: string) => {
    if (!requireAuth('assign sea trials to divisions')) return;
    playWoodClick();
    assignChallengeToCrew(crew.id, challengeId);
  };

  const handleToggleMemberPin = (memberId: string) => {
    playSwordClash();
    toggleMemberPin(crew.id, memberId);
  };

  const assignedRolesSet = new Set(crew.members.map(m => m.assignedRole));

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`glass-panel rounded-3xl p-5 sm:p-6 border transition-all duration-300 flex flex-col justify-between ${
        crew.isLocked
          ? 'border-amber-500/80 shadow-lg shadow-amber-500/10'
          : crew.hasConqueror
          ? 'border-red-500/60 shadow-haki-conq'
          : 'border-slate-700/80 hover:border-slate-500'
      }`}
    >
      <div>
        {/* Crew Header */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-1 rounded-xl bg-slate-900 border border-slate-700">
              <JollyRogerAvatar
                hatType={crew.hasConqueror ? 'crown' : 'straw'}
                symbol={crew.hasConqueror ? 'flames' : 'crossbones'}
                baseColor="#09090b"
                accentColor={crew.hasConqueror ? '#dc2626' : '#f59e0b'}
                size={44}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-pirate text-2xl text-parchment leading-tight">
                  {crew.name}
                </h3>
                {crew.hasConqueror && (
                  <span
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600/30 border border-red-500 text-red-300 text-[10px] font-bold uppercase tracking-wider animate-pulse"
                    title="Conqueror's Spirit: Led by the fleet's supreme will wielder"
                  >
                    <Zap className="w-3 h-3 text-red-400" /> Conqueror
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                <Ship className="w-3.5 h-3.5 text-amber-400" />
                <span>Flagship: <em>{crew.shipName}</em></span>
              </div>
            </div>
          </div>

          {/* Crew Lock Button */}
          <button
            type="button"
            onClick={handleToggleCrewLock}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              crew.isLocked
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title={crew.isLocked ? 'Crew Locked: Division protected from reshuffle' : 'Lock Crew: Protect division from reshuffle'}
            aria-label={crew.isLocked ? 'Unlock crew' : 'Lock crew'}
          >
            {crew.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            <span className="hidden sm:inline">{crew.isLocked ? 'Locked' : 'Lock'}</span>
          </button>
        </div>

        {/* Assigned Trial Selector (Assigning button & status) */}
        <div className="mt-3 p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800/90 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-400" /> Assigned Trial:
          </span>
          <select
            value={crew.assignedChallengeId || ''}
            onChange={(e) => handleAssignChallenge(e.target.value)}
            className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-500/50 text-amber-300 text-xs font-semibold outline-none max-w-[200px] truncate cursor-pointer transition-colors"
          >
            <option value="" className="text-slate-400 font-normal">-- Select Trial to Assign --</option>
            {challenges.map(c => (
              <option key={c.id} value={c.id} className="text-slate-100 font-medium">
                {c.isCompleted ? '✓ ' : ''}{c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Warnings Banner (Role gaps, low combat, etc.) */}
        {crew.warnings.length > 0 && (
          <div className="mt-3 space-y-1">
            {crew.warnings.map((w, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 p-2 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-[11px]"
              >
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                <span>{w.suggestion}</span>
              </div>
            ))}
          </div>
        )}

        {/* Radar Chart & Axis Power Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center my-4 py-3 bg-slate-900/60 rounded-2xl border border-slate-800">
          <CrewRadarChart scores={crew.axisScores} maxScore={18} size={150} />

          <div className="space-y-1 pr-3 text-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Power Matrix
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Combat Power:</span>
              <strong className="text-amber-400">{crew.axisScores.combat}</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Navigation:</span>
              <strong className="text-cyan-400">{crew.axisScores.navigation}</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Cooking:</span>
              <strong className="text-orange-400">{crew.axisScores.cooking}</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Medical:</span>
              <strong className="text-pink-400">{crew.axisScores.medical}</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Engineering:</span>
              <strong className="text-indigo-400">{crew.axisScores.engineering}</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Wits & Lore:</span>
              <strong className="text-emerald-400">{crew.axisScores.wits}</strong>
            </div>
          </div>
        </div>

        {/* Role Coverage Checklist */}
        <div className="mb-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
            <span>Essential Role Coverage</span>
            <span className="text-[10px] text-slate-500 font-mono">
              {['Captain', 'Navigator', 'Doctor', 'Shipwright'].filter(r => assignedRolesSet.has(r as any)).length}/4 Core
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1 text-[11px]">
            {['Captain', 'Navigator', 'Doctor', 'Shipwright'].map((role) => {
              const covered = assignedRolesSet.has(role as any);
              return (
                <div
                  key={role}
                  className={`p-1 rounded text-center font-semibold truncate ${
                    covered ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30' : 'bg-slate-900 text-slate-500 border border-slate-800'
                  }`}
                >
                  {covered ? '✓ ' : '✗ '} {role}
                </div>
              );
            })}
          </div>
        </div>

        {/* Member Roster (R11) with Display Member Info Button */}
        <div className="space-y-2 mt-4 pt-3 border-t border-slate-800/80">
          {/* Toggle Button to Display/Hide Member Info */}
          <button
            type="button"
            onClick={() => setShowMembers(!showMembers)}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-700/80 hover:border-amber-500/50 text-slate-200 transition-all cursor-pointer shadow-md group"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="font-pirate text-lg text-parchment">
                Crew Members ({crew.members.length} Pirates)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-amber-300">
                {showMembers ? 'Hide Members' : 'Display Member Info'}
              </span>
              {showMembers ? (
                <ChevronUp className="w-4 h-4 text-amber-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-amber-400" />
              )}
            </div>
          </button>

          {/* Collapsible Member Info Content */}
          {showMembers && (
            <div className="space-y-2.5 pt-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between gap-2 px-1">
                <span className="text-[10px] text-slate-400 font-mono">Drag to swap divisions</span>
                
                {/* Add Member Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIsAddingMember(!isAddingMember)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{isAddingMember ? 'Cancel' : '+ Add Member'}</span>
                </button>
              </div>

              {/* Inline Add Member Selector */}
              {isAddingMember && (
                <div className="p-3 rounded-2xl bg-slate-950/90 border border-amber-500/40 space-y-2 shadow-lg">
                  <div className="flex items-center justify-between text-xs font-semibold text-amber-300">
                    <span>Enlist Nakama to Fleet</span>
                    <button 
                      type="button" 
                      onClick={() => setIsAddingMember(false)} 
                      className="text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedParticipantId}
                      onChange={(e) => setSelectedParticipantId(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value="">-- Choose nakama to add --</option>
                      {availableCandidates.map(p => (
                        <option key={p.id} value={p.id} className="bg-slate-900 text-slate-100">
                          {p.name} ({p.primaryRole} • ฿{(p.bounty / 1000000).toFixed(0)}M)
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={!selectedParticipantId}
                      onClick={() => {
                        if (!requireAuth('add member to fleet division')) return;
                        if (selectedParticipantId) {
                          playWoodClick();
                          addMemberToCrew(crew.id, selectedParticipantId);
                          setSelectedParticipantId('');
                          setIsAddingMember(false);
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs disabled:opacity-40 cursor-pointer transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              {/* Member cards */}
              {crew.members.map((member) => {
                const pirate = participantsMap.get(member.participantId);
                if (!pirate) return null;
                const haki = deriveHaki(pirate.skills, pirate.primaryRole, pirate.secondaryRole);
                const isConquerorWielder = pirate.id === eventConfig.conquerorWinnerId;

                return (
                  <div
                    key={member.participantId}
                    draggable={isAuthenticated && !crew.isLocked && !member.isPinned}
                    onDragStart={() => isAuthenticated && onDragStartMember?.(crew.id, member.participantId)}
                    className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2.5 ${
                      isAuthenticated && !crew.isLocked && !member.isPinned
                        ? 'cursor-grab active:cursor-grabbing'
                        : 'cursor-default'
                    } ${
                      member.isPinned
                        ? 'bg-amber-950/40 border-amber-500/40'
                        : isConquerorWielder
                        ? 'bg-red-950/30 border-red-500/40'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="shrink-0">
                        <JollyRogerAvatar
                          hatType={pirate.jollyRogerStyle.hatType}
                          symbol={pirate.jollyRogerStyle.symbol}
                          baseColor={pirate.jollyRogerStyle.baseColor}
                          accentColor={pirate.jollyRogerStyle.accentColor}
                          size={32}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-pirate text-lg text-parchment truncate leading-tight">
                            {pirate.name}
                          </span>
                          {isConquerorWielder && (
                            <span title="Conqueror's Spirit">
                              <Zap className="w-3 h-3 text-red-400 shrink-0" />
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                            {member.assignedRole}
                          </span>
                          <span>• ฿{(pirate.bounty / 1000000).toFixed(0)}M</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Haki mini badge */}
                      <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold mr-1">
                        <span className="text-cyan-400" title="Observation">O:{haki.observation}</span>
                        <span className="text-slate-400" title="Armament">A:{haki.armament}</span>
                      </div>

                      {/* Pin Member Toggle (R12) */}
                      <button
                        type="button"
                        onClick={() => handleToggleMemberPin(member.participantId)}
                        className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                          member.isPinned
                            ? 'text-amber-400 bg-amber-500/20 hover:bg-amber-500/30'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                        title={
                          member.isPinned
                            ? 'Member Pinned: Stays in this crew on reshuffle'
                            : 'Pin Member: Keep in this crew on reshuffle'
                        }
                        aria-label={member.isPinned ? 'Unpin member' : 'Pin member'}
                      >
                        {member.isPinned ? <Pin className="w-3.5 h-3.5" /> : <PinOff className="w-3.5 h-3.5" />}
                      </button>

                      {/* Delete Member Button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (!requireAuth('remove member from fleet division')) return;
                          playSwordClash();
                          removeMemberFromCrew(crew.id, member.participantId);
                        }}
                        className="p-1.5 rounded-lg text-xs text-slate-500 hover:text-red-400 hover:bg-red-950/50 transition-colors cursor-pointer"
                        title="Delete / remove member from crew (updates power matrix)"
                        aria-label="Remove member from crew"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
