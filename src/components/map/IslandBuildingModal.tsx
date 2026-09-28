import React, { useState } from 'react';
import { useFleetStore } from '../../store/fleetStore';
import { ALL_ROLES, PirateRole, Participant, Challenge, Crew } from '../../types';
import { JollyRogerAvatar, DevilFruitSwirlIcon } from '../common/SvgIcons';
import { CreateTrialModal } from '../trials/CreateTrialModal';
import { ChallengeTeamDashboard } from '../dashboard/ChallengeTeamDashboard';
import { 
  X, ArrowLeft, Users, Anchor, Trophy, Scale, Plus, Search, Filter, 
  Sliders, Zap, RefreshCw, AlertTriangle, Shield, Check, Eye, Award, 
  Compass, Download, Copy, Printer, Edit3, Trash2, Cpu
} from 'lucide-react';

interface IslandBuildingModalProps {
  islandId: string;
  onClose: () => void;
}

export const IslandBuildingModal: React.FC<IslandBuildingModalProps> = ({ islandId, onClose }) => {
  const {
    participants,
    crews,
    challenges,
    stowaways,
    balanceScore,
    eventConfig,
    updateConfig,
    assembleFleet,
    gameState,
    addParticipant,
    addChallenge,
    assignChallengeToCrew,
    showToast,
    setSelectedIslandId,
  } = useFleetStore();

  // Tab state for Recruitment Isle
  const [recruitmentTab, setRecruitmentTab] = useState<'wall' | 'enlist'>('wall');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  
  // Selected crew for Harbor of Crews
  const [selectedCrewId, setSelectedCrewId] = useState<string>(crews[0]?.id || '');
  
  // Enlist Pirate form state
  const [newPirateName, setNewPirateName] = useState('');
  const [newPirateEpithet, setNewPirateEpithet] = useState('');
  const [newPrimaryRole, setNewPrimaryRole] = useState<PirateRole>('Swordsman');
  const [newSecondaryRole, setNewSecondaryRole] = useState<PirateRole>('Captain');

  // Create Challenge & Dashboard modal state
  const [showCreateTrial, setShowCreateTrial] = useState(false);
  const [showCSEDashboard, setShowCSEDashboard] = useState(false);
  const [newTrialName, setNewTrialName] = useState('');
  const [newTrialCategory, setNewTrialCategory] = useState<Challenge['category']>('Combat');

  const participantsMap = new Map(participants.map(p => [p.id, p]));
  const challengesMap = new Map(challenges.map(c => [c.id, c]));

  // Island metadata & visual mappings matching the reference photos
  const ISLAND_META: Record<string, {
    title: string;
    subtitle: string;
    badge: string;
    image: string;
    theme: string;
  }> = {
    'island-sunny-hq': {
      title: 'Thousand Sunny Dock',
      subtitle: 'Fleet HQ',
      badge: `Level ${gameState.fleetLevel} • ${participants.length} pirates`,
      image: '/assets/islands/sunny_dock.jpg',
      theme: 'amber',
    },
    'island-recruitment': {
      title: 'Recruitment Isle',
      subtitle: 'Enlistment & Wanted Posters',
      badge: `${participants.length} pirates`,
      image: '/assets/islands/recruitment.jpg',
      theme: 'pink',
    },
    'island-foxy': {
      title: "Foxy's Arena Isle",
      subtitle: 'Davy Back Fight',
      badge: `${challenges.length} trials`,
      image: '/assets/islands/foxy_arena.jpg',
      theme: 'orange',
    },
    'island-haki-forge': {
      title: 'Haki Forge Isle',
      subtitle: 'Assemble & Balance',
      badge: `${crews.length} crews ready`,
      image: '/assets/islands/haki_forge.jpg',
      theme: 'purple',
    },
    'island-harbor': {
      title: 'Harbor of Crews',
      subtitle: 'Your Crews, Your Ships',
      badge: `${crews.length} ships`,
      image: '/assets/islands/harbor_crews.jpg',
      theme: 'cyan',
    },
    'island-laughtale': {
      title: 'Laugh Tale Isle',
      subtitle: 'Final Roster',
      badge: 'Roster locked',
      image: '/assets/islands/laughtale.jpg',
      theme: 'yellow',
    },
  };

  const meta = ISLAND_META[islandId] || ISLAND_META['island-sunny-hq'];

  // Handle Enlist Pirate
  const handleEnlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPirateName.trim()) return;

    await addParticipant({
      name: newPirateName.trim(),
      epithet: newPirateEpithet.trim() || 'Grand Line Buccaneer',
      primaryRole: newPrimaryRole,
      secondaryRole: newSecondaryRole,
      skills: { combat: 4, navigation: 3, cooking: 2, medical: 2, engineering: 3, wits: 3 },
      interests: ['Sea Adventure', 'Bounty Hunter'],
      devilFruit: 'None',
      jollyRogerStyle: { baseColor: '#09090b', accentColor: '#f59e0b', hatType: 'straw', symbol: 'crossbones' },
    });

    setNewPirateName('');
    setNewPirateEpithet('');
    setRecruitmentTab('wall');
  };

  // Handle Create Trial
  const handleCreateTrialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrialName.trim()) return;

    await addChallenge({
      name: newTrialName.trim(),
      description: 'A newly sanctioned Davy Back Fight trial for pirate fleet supremacy.',
      category: newTrialCategory,
      requiredRoles: ['Captain', 'Navigator'],
      requiredSkills: [{ skill: 'combat', minLevel: 3, weight: 2 }, { skill: 'wits', minLevel: 2, weight: 1 }],
    });

    setNewTrialName('');
    setShowCreateTrial(false);
  };

  const activeSelectedCrew = crews.find(c => c.id === selectedCrewId) || crews[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 pointer-events-auto"
    >
      <div 
        onPointerDown={(e) => e.stopPropagation()}
        className="w-full max-w-6xl max-h-[92vh] bg-slate-950 border-2 border-amber-500/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
      >
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900/90 border-b border-slate-800">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold transition-all"
            aria-label="Return to world map"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Map</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="font-pirate text-2xl text-parchment tracking-wide">
              {meta.title}
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">
              — {meta.subtitle}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Split 2-Column Layout matching Reference Photo */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN (6 cols): Isometric Island Artwork & Banners */}
          {/* ======================================================== */}
          <div className="lg:col-span-6 relative p-5 sm:p-6 flex flex-col justify-between min-h-[380px] lg:min-h-full bg-slate-900/50 border-b lg:border-b-0 lg:border-r border-slate-800 overflow-hidden">
            {/* Background Image of the Island */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
              style={{ backgroundImage: `url(${meta.image})` }}
            />
            {/* Overlay Gradient for Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />

            {/* Top Floating Parchment Ribbon Banner matching Reference */}
            <div className="relative z-10 self-center max-w-sm w-full text-center">
              <div className="parchment-card px-5 py-2.5 rounded-xl shadow-2xl border-2 border-[#4a3018]">
                <h3 className="font-pirate text-2xl text-[#2c1d11] tracking-wide uppercase leading-tight">
                  {meta.title}
                </h3>
                <div className="text-[11px] font-bold text-[#6d4c2b] uppercase tracking-wider">
                  {meta.subtitle}
                </div>
              </div>

              {/* Status Badge below banner */}
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 border border-amber-500/60 text-amber-300 text-xs font-bold shadow-lg backdrop-blur-sm">
                <span>{meta.badge}</span>
              </div>
            </div>

            {/* Floating Island-Specific Badges & Meters on Image */}
            <div className="relative z-10 space-y-2 mt-auto pt-6">
              {/* HQ Level XP Progress Bar */}
              {islandId === 'island-sunny-hq' && (
                <div className="bg-slate-950/85 backdrop-blur-md border border-amber-500/40 rounded-2xl p-3 shadow-xl">
                  <div className="flex items-center justify-between text-xs text-amber-300 font-bold mb-1">
                    <span>Level {gameState.fleetLevel}</span>
                    <span>{gameState.xp} / 2,000 XP</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-amber-500/30">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-300"
                      style={{ width: `${Math.min(100, (gameState.xp / 2000) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Haki Forge Warning Alert Banner & Balance Gauge */}
              {islandId === 'island-haki-forge' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-950/90 border border-red-500 text-red-200 text-xs font-semibold shadow-xl">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>Role Gap Alert: Navigator required in Crew 3 for ocean trials!</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/90 border border-slate-700 text-xs">
                    <span className="text-slate-300 font-bold">Fleet Balance Parity:</span>
                    <span className="font-pirate text-xl text-emerald-400">{balanceScore}%</span>
                  </div>
                </div>
              )}

              {/* Harbor Docked Ships list badge */}
              {islandId === 'island-harbor' && stowaways.length > 0 && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-950/90 border border-amber-500 text-amber-200 text-xs font-semibold shadow-xl">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{stowaways.length} Unassigned Stowaways on the docks</span>
                </div>
              )}
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN (6 cols): Dedicated Thematic Feature Panel */}
          {/* ======================================================== */}
          <div className="lg:col-span-6 p-5 sm:p-6 bg-slate-950 flex flex-col justify-between">
            
            {/* 1. THOUSAND SUNNY DOCK (Fleet HQ Stats & Quick Actions) */}
            {islandId === 'island-sunny-hq' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
                    Fleet HQ Operations
                  </h4>
                  {/* Fleet Stats Card matching top-right photo */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-xs text-slate-400 flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-400" /> Total Pirates
                      </span>
                      <strong className="font-pirate text-2xl text-parchment">{participants.length}</strong>
                    </div>

                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-xs text-slate-400 flex items-center gap-2">
                        <Anchor className="w-4 h-4 text-amber-400" /> Total Crews
                      </span>
                      <strong className="font-pirate text-2xl text-amber-300">{crews.length}</strong>
                    </div>

                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-xs text-slate-400 flex items-center gap-2">
                        <span className="text-amber-400 font-bold">฿</span> Berries Treasury
                      </span>
                      <strong className="font-pirate text-2xl text-amber-400">{gameState.berries.toLocaleString()}</strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 flex items-center gap-2">
                        <Scale className="w-4 h-4 text-emerald-400" /> Avg. Balance
                      </span>
                      <strong className="font-pirate text-2xl text-emerald-400">{balanceScore}%</strong>
                    </div>
                  </div>
                </div>

                {/* Quick Actions Card matching reference photo */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Quick Actions
                  </h4>
                  <div className="space-y-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        window.location.hash = '#/map/island-recruitment';
                        setSelectedIslandId('island-recruitment');
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700/80 text-white font-semibold text-xs transition-all hover:border-pink-500/50 cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Plus className="w-4 h-4 text-pink-400" /> Enlist a Pirate
                      </span>
                      <span className="text-slate-500">→</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        window.location.hash = '#/map/island-foxy';
                        setSelectedIslandId('island-foxy');
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700/80 text-white font-semibold text-xs transition-all hover:border-orange-500/50 cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-orange-400" /> Create Trial
                      </span>
                      <span className="text-slate-500">→</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        window.location.hash = '#/map/island-haki-forge';
                        setSelectedIslandId('island-haki-forge');
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-300" /> Assemble the Fleet
                      </span>
                      <span>⚡</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. RECRUITMENT ISLE (Wanted Posters Grid & Enlist) */}
            {islandId === 'island-recruitment' && (
              <div className="space-y-4">
                {/* Header Switcher matching reference */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setRecruitmentTab('wall')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        recruitmentTab === 'wall' ? 'bg-pink-600 text-white' : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      Wanted Poster Wall
                    </button>
                    <button
                      onClick={() => setRecruitmentTab('enlist')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        recruitmentTab === 'enlist' ? 'bg-pink-600 text-white' : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      + Enlist a Pirate
                    </button>
                  </div>
                  <span className="text-xs text-pink-300 font-bold">{participants.length} Records</span>
                </div>

                {recruitmentTab === 'wall' ? (
                  <div className="space-y-3">
                    {/* Search & Role Filters */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search pirates..."
                          className="w-full pl-8 pr-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs outline-none"
                        />
                      </div>
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs outline-none"
                      >
                        <option value="ALL">All Roles</option>
                        {ALL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>

                    {/* 3x2 Grid of Wanted Posters matching reference screenshot */}
                    <div className="grid grid-cols-3 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                      {participants
                        .filter(p => selectedRole === 'ALL' || p.primaryRole === selectedRole || p.secondaryRole === selectedRole)
                        .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .slice(0, 9)
                        .map((pirate) => (
                          <div
                            key={pirate.id}
                            className="parchment-card p-2 rounded text-center flex flex-col justify-between shadow hover:scale-105 transition-transform cursor-pointer"
                          >
                            <div className="font-pirate text-[10px] text-[#2c1d11] tracking-widest border-b border-[#4a3018] uppercase">
                              WANTED
                            </div>
                            <div className="my-1 mx-auto w-14 h-14 bg-[#e2d4b7] border border-[#4a3018] rounded flex items-center justify-center">
                              <JollyRogerAvatar
                                hatType={pirate.jollyRogerStyle.hatType}
                                symbol={pirate.jollyRogerStyle.symbol}
                                size={40}
                              />
                            </div>
                            <div className="font-pirate text-xs text-[#2c1d11] truncate px-0.5">
                              {pirate.name}
                            </div>
                            <div className="font-pirate text-[10px] text-[#8b1e0f]">
                              ฿ {(pirate.bounty / 1000000).toFixed(1)}M
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  /* Enlist Form Tab */
                  <form onSubmit={handleEnlistSubmit} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1">Pirate Name</label>
                      <input
                        type="text"
                        required
                        value={newPirateName}
                        onChange={(e) => setNewPirateName(e.target.value)}
                        placeholder="e.g. Monkey D. Nova"
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Epithet / Title</label>
                      <input
                        type="text"
                        value={newPirateEpithet}
                        onChange={(e) => setNewPirateEpithet(e.target.value)}
                        placeholder="e.g. The Straw Hat Sovereign"
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-400 mb-1">Primary Role</label>
                        <select
                          value={newPrimaryRole}
                          onChange={(e) => setNewPrimaryRole(e.target.value as PirateRole)}
                          className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                        >
                          {ALL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Secondary Role</label>
                        <select
                          value={newSecondaryRole}
                          onChange={(e) => setNewSecondaryRole(e.target.value as PirateRole)}
                          className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                        >
                          {ALL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 mt-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold uppercase tracking-wider shadow"
                    >
                      Enlist into Fleet
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* 3. FOXY'S ARENA ISLE (Sea Trials Board List) */}
            {islandId === 'island-foxy' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                  <h4 className="font-pirate text-2xl text-orange-400">Sea Trials & CSE Challenges</h4>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCSEDashboard(true)}
                      className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                      title="Open CSE Challenge & Team Selection Dashboard"
                    >
                      <Cpu className="w-3.5 h-3.5" />
                      <span>Team Dashboard</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateTrial(true)}
                      className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
                    >
                      + Create Challenge
                    </button>
                  </div>
                </div>

                {showCreateTrial ? (
                  <form onSubmit={handleCreateTrialSubmit} className="space-y-3 text-xs bg-slate-900 p-3 rounded-xl border border-orange-500/40">
                    <input
                      type="text"
                      required
                      placeholder="Challenge Name (e.g. Maelstrom Sprint)"
                      value={newTrialName}
                      onChange={(e) => setNewTrialName(e.target.value)}
                      className="w-full p-2 rounded bg-slate-950 border border-slate-700 text-white"
                    />
                    <select
                      value={newTrialCategory}
                      onChange={(e) => setNewTrialCategory(e.target.value as any)}
                      className="w-full p-2 rounded bg-slate-950 border border-slate-700 text-white"
                    >
                      {['Combat', 'Navigation', 'Culinary', 'Technical', 'Intellect', 'Special'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowCreateTrial(false)}
                        className="px-3 py-1 rounded bg-slate-800 text-slate-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1 rounded bg-orange-600 text-white font-bold"
                      >
                        Sanction
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Challenge Cards List matching reference photo */
                  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                    {challenges.map((c) => (
                      <div
                        key={c.id}
                        className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-orange-500/50 flex items-center justify-between gap-3 shadow transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 font-bold text-xs">
                            ⚔
                          </div>
                          <div>
                            <div className="font-pirate text-lg text-parchment leading-tight">
                              {c.name}
                            </div>
                            <div className="text-[10px] text-slate-400 capitalize">
                              {c.category} • Required Roles: {c.requiredRoles.join(', ')}
                            </div>
                          </div>
                        </div>

                        <span className="text-[11px] font-mono text-orange-400 bg-orange-950/60 px-2 py-0.5 rounded border border-orange-500/30">
                          2–6 Crew
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. HAKI FORGE ISLE (Assemble & Balance Panel) */}
            {islandId === 'island-haki-forge' && (
              <div className="space-y-4">
                <div className="pb-2 border-b border-slate-800">
                  <h4 className="font-pirate text-2xl text-purple-300">Assemble the Fleet</h4>
                  <p className="text-xs text-slate-400">Algorithmic Crew Parity & Role Division</p>
                </div>

                {/* Team Size Slider matching reference photo */}
                <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-bold">Crew Team Size:</span>
                    <span className="font-pirate text-2xl text-amber-400">{eventConfig.crewSize} Pirates</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={9}
                    value={eventConfig.crewSize}
                    onChange={(e) => updateConfig({ crewSize: parseInt(e.target.value) })}
                    className="w-full accent-purple-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>2 (Skiff)</span>
                    <span>4 (Standard)</span>
                    <span>6 (Galleon)</span>
                    <span>9 (Armada)</span>
                  </div>
                </div>

                {/* Required Roles Row matching reference */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Required Core Archetypes:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {['Captain', 'Swordsman', 'Navigator', 'Sniper', 'Doctor'].map((r) => (
                      <span
                        key={r}
                        className="px-2 py-0.5 rounded-lg bg-purple-950/80 border border-purple-500/40 text-purple-300 text-[10px] font-bold"
                      >
                        ✓ {r}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Required Skills Checklist */}
                <div className="space-y-1 text-[11px] bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Combat Power</span>
                    <strong className="text-amber-400">Lvl 3+</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Navigation Wits</span>
                    <strong className="text-cyan-400">Lvl 2+</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Cooking Vitality</span>
                    <strong className="text-orange-400">Lvl 1+</strong>
                  </div>
                </div>

                {/* Actions: Big Generate Button matching reference */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => assembleFleet(false)}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-pirate text-2xl uppercase tracking-wider shadow-lg shadow-purple-600/30 transition-all active:scale-95"
                  >
                    Generate Teams
                  </button>

                  <button
                    onClick={() => assembleFleet(true)}
                    className="w-full py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 text-xs font-semibold"
                  >
                    <RefreshCw className="w-3.5 h-3.5 inline mr-1" /> Reshuffle the Tides
                  </button>
                </div>
              </div>
            )}

            {/* 5. HARBOR OF CREWS (Crew Details & Member Roster) */}
            {islandId === 'island-harbor' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h4 className="font-pirate text-2xl text-cyan-400">Crew Details</h4>
                  {/* Crew Selector Pill */}
                  <select
                    value={selectedCrewId}
                    onChange={(e) => setSelectedCrewId(e.target.value)}
                    className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs text-amber-300 font-bold outline-none"
                  >
                    {crews.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {activeSelectedCrew && (
                  <div className="space-y-3">
                    {/* Crew Header Card matching reference photo */}
                    <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-1 rounded-xl bg-slate-950 border border-amber-500/40">
                          <JollyRogerAvatar
                            hatType="straw"
                            symbol="crossbones"
                            size={36}
                          />
                        </div>
                        <div>
                          <div className="font-pirate text-xl text-parchment">{activeSelectedCrew.name}</div>
                          <div className="text-[10px] text-slate-400">{activeSelectedCrew.members.length} members • Flagship: {activeSelectedCrew.shipName}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400">Balance</div>
                        <div className="font-pirate text-xl text-emerald-400">92%</div>
                      </div>
                    </div>

                    {/* Member List */}
                    <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
                      {activeSelectedCrew.members.map((member) => {
                        const pirate = participantsMap.get(member.participantId);
                        return (
                          <div
                            key={member.participantId}
                            className="p-2 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between text-xs"
                          >
                            <span className="font-bold text-parchment">{pirate?.name}</span>
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold text-[10px]">
                              {member.assignedRole}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 6. LAUGH TALE ISLE (Final Scoreboard Table) */}
            {islandId === 'island-laughtale' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-amber-500/30">
                  <h4 className="font-pirate text-2xl text-amber-300">Davy Back Fight Roster</h4>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCSEDashboard(true)}
                      className="flex items-center gap-1 px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow cursor-pointer"
                      title="Open CSE Challenge & Team Selection Dashboard"
                    >
                      <Cpu className="w-3.5 h-3.5" /> Inspect Fit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const data = JSON.stringify(crews, null, 2);
                        navigator.clipboard.writeText(data);
                        showToast({ title: 'Roster Copied!', message: 'JSON format saved to clipboard.', type: 'info' });
                      }}
                      className="flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow"
                    >
                      <Copy className="w-3.5 h-3.5" /> Export
                    </button>
                  </div>
                </div>

                {/* Scoreboard Table matching reference photo */}
                <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                  {crews.map((crew) => {
                    const ch = crew.assignedChallengeId ? challengesMap.get(crew.assignedChallengeId) : null;
                    const fit = crew.fitScore || 85;

                    return (
                      <div
                        key={crew.id}
                        className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-pirate text-base text-parchment">{crew.name}</span>
                        </div>
                        <span className="text-[11px] text-amber-300 truncate max-w-[140px]">
                          {ch ? ch.name : 'Engineering Trial'}
                        </span>
                        <span className={`font-pirate text-lg font-bold ${fit >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {fit}%
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-center font-pirate text-xl text-amber-300">
                  ⚓ Grand Line Awaits... ⚓
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Embedded Create Trial Modal */}
      {showCreateTrial && (
        <CreateTrialModal onClose={() => setShowCreateTrial(false)} />
      )}

      {/* Embedded CSE Challenge & Team Dashboard Modal */}
      {showCSEDashboard && (
        <div
          role="dialog"
          aria-modal="true"
          onPointerDown={(e) => e.stopPropagation()}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
        >
          <div className="w-full max-w-7xl max-h-[92vh] overflow-y-auto">
            <ChallengeTeamDashboard onClose={() => setShowCSEDashboard(false)} />
          </div>
        </div>
      )}
    </div>
  );
};
