import React, { useState } from 'react';
import { useFleetStore } from '../../store/fleetStore';
import { useAuthStore } from '../../store/authStore';
import { ALL_ROLES, PirateRole, DevilFruitType, SkillSet, JollyRogerStyle, CSE_SKILL_META } from '../../types';
import { SKILL_AXES, deriveHaki } from '../../services/teamEngine';
import { JollyRogerAvatar, DevilFruitSwirlIcon } from '../common/SvgIcons';
import { PlusCircle, Sparkles, HelpCircle, ShieldAlert, Check, Lock } from 'lucide-react';

const DEVIL_FRUITS: DevilFruitType[] = ['None', 'Paramecia', 'Zoan', 'Logia', 'Mythical Zoan'];

const HAT_TYPES: JollyRogerStyle['hatType'][] = ['straw', 'tricorn', 'bandana', 'tophat', 'crown'];
const SYMBOLS: JollyRogerStyle['symbol'][] = ['crossbones', 'swords', 'flames', 'heart', 'anchor'];

export const EnlistPirateForm: React.FC = () => {
  const { addParticipant } = useFleetStore();
  const { isAuthenticated, requireAuth, openLoginModal } = useAuthStore();

  const [name, setName] = useState('');
  const [epithet, setEpithet] = useState('');
  const [primaryRole, setPrimaryRole] = useState<PirateRole>('Swordsman');
  const [secondaryRole, setSecondaryRole] = useState<PirateRole>('Captain');
  const [skills, setSkills] = useState<SkillSet>({
    combat: 4,
    navigation: 2,
    cooking: 2,
    medical: 2,
    engineering: 2,
    wits: 3,
  });
  const [devilFruit, setDevilFruit] = useState<DevilFruitType>('Paramecia');
  const [interestsInput, setInterestsInput] = useState('Ancient Lore, Duelist');
  const [jollyRoger, setJollyRoger] = useState<JollyRogerStyle>({
    baseColor: '#18181b',
    accentColor: '#f59e0b',
    hatType: 'straw',
    symbol: 'swords',
  });
  const [showWeaknessTooltip, setShowWeaknessTooltip] = useState(false);

  // Live Bounty Calculation
  const skillSum = Object.values(skills).reduce((a, b) => a + b, 0);
  const fruitMultiplier = devilFruit === 'Mythical Zoan' ? 2.5 : devilFruit === 'Logia' ? 2.0 : devilFruit === 'Paramecia' ? 1.4 : devilFruit === 'Zoan' ? 1.3 : 1.0;
  const estimatedBounty = Math.round((skillSum * 25000000 + 50000000) * fruitMultiplier);

  // Live Derived Haki stats
  const derivedHaki = deriveHaki(skills, primaryRole, secondaryRole);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth('enlist a new pirate into the fleet')) {
      return;
    }
    if (!name.trim()) return;

    const interests = interestsInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    await addParticipant({
      name: name.trim(),
      epithet: epithet.trim() || 'The Grand Adventurer',
      primaryRole,
      secondaryRole,
      skills,
      interests,
      devilFruit,
      jollyRogerStyle: jollyRoger,
    });

    // Reset form
    setName('');
    setEpithet('');
  };

  return (
    <div className="w-full glass-panel rounded-3xl p-6 sm:p-8 border border-teal-500/30 text-slate-100 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 border-b border-teal-500/20">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/40">
            Grand Line Recruitment
          </span>
          <h2 className="font-pirate text-3xl sm:text-4xl text-parchment tracking-wide mt-1">
            Enlist a Pirate
          </h2>
        </div>
        <p className="text-xs text-slate-400 max-w-sm">
          Issue a new bounty poster. Skills directly balance Davy Back Fight crew formation.
        </p>
      </div>

      {/* Read-Only Notice for Guests */}
      {!isAuthenticated && (
        <div className="mt-4 p-4 rounded-2xl bg-amber-950/70 border border-amber-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-amber-200">
            <Lock className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <strong className="text-amber-300 block">Recruitment Desk Locked (Read-Only Mode)</strong>
              <span>Viewing and previewing bounties is open. Sign in with a demo officer or pirate pass to submit official records.</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openLoginModal('enlist new recruits')}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shrink-0 self-start sm:self-auto cursor-pointer shadow-md transition-all active:scale-95"
          >
            ⚓ Sign In (Demo Available)
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Columns: Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Identity: Name & Epithet */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pirate-name" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Pirate Name *
              </label>
              <input
                id="pirate-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jack 'Seven Storms'"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-white placeholder-slate-500 text-sm outline-none transition-all"
              />
            </div>
            <div>
              <label htmlFor="pirate-epithet" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Epithet / Alias
              </label>
              <input
                id="pirate-epithet"
                type="text"
                value={epithet}
                onChange={(e) => setEpithet(e.target.value)}
                placeholder="e.g. The Iron Tempest"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-white placeholder-slate-500 text-sm outline-none transition-all"
              />
            </div>
          </div>

          {/* Role Pickers: Primary & Secondary (R3) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="primary-role" className="block text-xs font-semibold uppercase tracking-wider text-amber-300 mb-1.5">
                Primary Role (Core Specialization)
              </label>
              <select
                id="primary-role"
                value={primaryRole}
                onChange={(e) => setPrimaryRole(e.target.value as PirateRole)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 text-sm outline-none focus:border-amber-400"
              >
                {ALL_ROLES.map((r) => (
                  <option key={`prim-${r}`} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="secondary-role" className="block text-xs font-semibold uppercase tracking-wider text-cyan-300 mb-1.5">
                Secondary Role (Auxiliary Duty)
              </label>
              <select
                id="secondary-role"
                value={secondaryRole}
                onChange={(e) => setSecondaryRole(e.target.value as PirateRole)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 text-sm outline-none focus:border-cyan-400"
              >
                {ALL_ROLES.map((r) => (
                  <option key={`sec-${r}`} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Skills 1-5 Haki Power Meters (R2) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Skills & Haki Potential (1 - 5 Scale)
              </span>
              <span className="text-[11px] text-amber-400 font-medium">
                Auto-Scales Bounty & Balance Score
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SKILL_AXES.map((axis) => {
                const meta = CSE_SKILL_META[axis];
                const val = skills[axis];
                return (
                  <div key={axis} className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                        <span>{meta?.icon}</span>
                        <span>{meta?.tag}</span>
                      </span>
                      <span className="font-mono text-amber-400 text-sm font-bold">{val}/5</span>
                    </div>
                    {/* 5-step Haki bar */}
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setSkills({ ...skills, [axis]: lvl })}
                          className={`h-2.5 flex-1 rounded-sm transition-all ${
                            lvl <= val
                              ? 'bg-gradient-to-r from-amber-500 to-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.5)]'
                              : 'bg-slate-800 hover:bg-slate-700'
                          }`}
                          aria-label={`Set ${axis} level to ${lvl}`}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Devil Fruit & Sea-Stone Weakness Tooltip (R2 + Lore) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                Devil Fruit Affinity
                <button
                  type="button"
                  onMouseEnter={() => setShowWeaknessTooltip(true)}
                  onMouseLeave={() => setShowWeaknessTooltip(false)}
                  onClick={() => setShowWeaknessTooltip(!showWeaknessTooltip)}
                  className="text-amber-400 hover:text-amber-300 focus:outline-none"
                  aria-label="Toggle Sea-Stone weakness explanation"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </span>
              {devilFruit !== 'None' && (
                <span className="text-[11px] text-red-400 flex items-center gap-1 font-semibold">
                  <ShieldAlert className="w-3.5 h-3.5" /> Sea-Stone Weakness Active
                </span>
              )}
            </div>

            {/* Sea Stone Weakness tooltip panel */}
            {showWeaknessTooltip && (
              <div className="p-3 mb-2 rounded-xl bg-red-950/80 border border-red-500/50 text-xs text-red-200 shadow-lg">
                <strong>Sea-Stone Weakness:</strong> Devil fruit eaters gain massive offensive multipliers, but lose strength in submerged trials (e.g. Donut Race). Ensure non-fruit hammer nakama are in the crew to prevent penalties!
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {DEVIL_FRUITS.map((fruit) => (
                <button
                  key={fruit}
                  type="button"
                  onClick={() => setDevilFruit(fruit)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    devilFruit === fruit
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 scale-105'
                      : 'bg-slate-900 border border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <DevilFruitSwirlIcon type={fruit} className="w-4 h-4" />
                  <span>{fruit}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Jolly Roger Customizer */}
          <div className="pt-2 border-t border-slate-800">
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Jolly Roger Insignia (Hat & Symbol)
            </span>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-slate-400 mr-1">Hat:</span>
                {HAT_TYPES.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setJollyRoger({ ...jollyRoger, hatType: h })}
                    className={`px-2 py-0.5 rounded text-[11px] capitalize ${
                      jollyRoger.hatType === h ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-slate-400 mr-1">Symbol:</span>
                {SYMBOLS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setJollyRoger({ ...jollyRoger, symbol: s })}
                    className={`px-2 py-0.5 rounded text-[11px] capitalize ${
                      jollyRoger.symbol === s ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Free-Tag Interests */}
          <div>
            <label htmlFor="pirate-interests" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Interests & Passions (Comma Separated)
            </label>
            <input
              id="pirate-interests"
              type="text"
              value={interestsInput}
              onChange={(e) => setInterestsInput(e.target.value)}
              placeholder="e.g. Ancient Maps, Solo Duels, Meat Feasts"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 text-sm outline-none focus:border-amber-400"
            />
          </div>

          <button
            type="submit"
            className={`w-full py-3.5 font-pirate text-2xl tracking-wider uppercase rounded-2xl shadow-xl active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isAuthenticated
                ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20'
                : 'bg-gradient-to-r from-amber-600/90 via-amber-500/90 to-amber-700/90 hover:from-amber-500 hover:to-amber-600 text-slate-950 border border-amber-400/60'
            }`}
          >
            {isAuthenticated ? (
              <>
                <PlusCircle className="w-6 h-6" />
                <span>Enlist Pirate into Roster</span>
              </>
            ) : (
              <>
                <Lock className="w-6 h-6 text-slate-950" />
                <span>Sign In to Enlist Pirate (Demo Available)</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Live Wanted Poster Preview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Marine Bounty Preview
          </span>

          {/* Wanted Poster Card */}
          <div className="parchment-card w-full max-w-[280px] p-5 rounded-md text-center shadow-poster relative transform hover:rotate-1 transition-transform">
            {/* Poster Header */}
            <div className="font-pirate text-4xl tracking-widest text-[#2c1d11] border-b-2 border-[#4a3018] pb-1 uppercase">
              WANTED
            </div>

            {/* Poster Image / Avatar Frame */}
            <div className="my-3 mx-auto w-36 h-36 bg-[#e2d4b7] border-2 border-[#4a3018] rounded flex items-center justify-center relative overflow-hidden shadow-inner">
              <JollyRogerAvatar
                hatType={jollyRoger.hatType}
                symbol={jollyRoger.symbol}
                baseColor={jollyRoger.baseColor}
                accentColor={jollyRoger.accentColor}
                size={110}
              />
              {devilFruit !== 'None' && (
                <div className="absolute bottom-1 right-1 p-1 bg-black/70 rounded-full">
                  <DevilFruitSwirlIcon type={devilFruit} className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Name & Epithet */}
            <div className="font-pirate text-2xl text-[#2c1d11] truncate px-1 uppercase tracking-wide">
              {name.trim() || 'ANONYMOUS PIRATE'}
            </div>
            <div className="text-[11px] font-bold text-[#6d4c2b] uppercase tracking-wider mb-2">
              "{epithet.trim() || 'Rookie Buccaneer'}"
            </div>

            {/* Bounty in Berries */}
            <div className="border-t-2 border-b-2 border-[#4a3018] py-1 my-1">
              <div className="text-[10px] uppercase font-bold tracking-widest text-[#4a3018]">
                DEAD OR ALIVE
              </div>
              <div className="font-pirate text-2xl text-[#8b1e0f] tracking-wide">
                ฿ {estimatedBounty.toLocaleString()}
              </div>
            </div>

            {/* Haki Glow Indicators */}
            <div className="mt-2 pt-2 border-t border-[#c5b18f] grid grid-cols-3 gap-1 text-[10px] font-bold">
              <div className="text-cyan-800">
                OBS: {derivedHaki.observation}%
              </div>
              <div className="text-slate-800">
                ARM: {derivedHaki.armament}%
              </div>
              <div className="text-red-800">
                CONQ: {derivedHaki.conqueror}%
              </div>
            </div>

            <div className="mt-2 text-[9px] text-[#78593a] uppercase font-serif tracking-tighter">
              Marine Headquarters • Grand Line Administration
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
