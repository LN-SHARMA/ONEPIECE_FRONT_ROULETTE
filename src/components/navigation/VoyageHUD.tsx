import React, { useState } from 'react';
import { useFleetStore } from '../../store/fleetStore';
import { useAuthStore } from '../../store/authStore';
import { LogPoseCompassIcon, JollyRogerAvatar } from '../common/SvgIcons';
import { 
  Compass, 
  Map, 
  Ship, 
  Volume2, 
  VolumeX, 
  Shield, 
  Award, 
  User as UserIcon, 
  LogIn, 
  LogOut, 
  ChevronDown, 
  Sparkles,
  Crown,
  Lock
} from 'lucide-react';

interface VoyageHUDProps {
  currentSceneIndex: number;
  scrollProgress: number;
  onNavigateSection?: (sectionId: string) => void;
}

const SCENE_NAMES = [
  { id: 'scene-east-blue', title: 'Sky Realm', island: 'High Stratosphere Dawn' },
  { id: 'scene-storm', title: 'Cloud Break', island: 'Grand Line Ocean Reveal' },
  { id: 'scene-sabaody', title: 'Fleet Waters', island: 'Sabaody Archipelago' },
  { id: 'scene-foxy', title: "Sea Coliseum", island: "Foxy's Arena Isle" },
  { id: 'scene-haki', title: 'Whitebeard Tremor', island: 'Moby Dick & Haki Forge' },
  { id: 'scene-laughtale', title: 'Abyss Battlefield', island: 'Laugh Tale Abyss' },
];

export const VoyageHUD: React.FC<VoyageHUDProps> = ({
  currentSceneIndex,
  scrollProgress,
  onNavigateSection,
}) => {
  const { viewMode, setViewMode, gameState } = useFleetStore();
  const { user, isAuthenticated, openLoginModal, logout } = useAuthStore();
  const [isMuted, setIsMuted] = useState(true);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const currentScene = SCENE_NAMES[Math.min(currentSceneIndex, SCENE_NAMES.length - 1)];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-auto px-3 sm:px-6 py-3 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 bg-slate-950/85 backdrop-blur-md border border-amber-500/30 rounded-2xl px-3 sm:px-5 py-2.5 shadow-2xl shadow-black/80">
        
        {/* Left: Log Pose & Island Indicator */}
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer" title="Log Pose Navigation Core">
            <LogPoseCompassIcon progress={scrollProgress} className="w-10 h-10 sm:w-11 sm:h-11 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
          </div>
          <div className="hidden sm:flex flex-col">
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '10s' }} />
              <span>Log Pose Locked</span>
            </div>
            <span className="font-pirate text-lg sm:text-xl text-parchment tracking-wide drop-shadow">
              {currentScene.island}
            </span>
          </div>
        </div>

        {/* Center: Quick Anchor Nav (Scroll Voyage mode) */}
        {viewMode === 'voyage' && (
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/90 border border-slate-700/60 rounded-xl px-2 py-1" aria-label="Grand Line Navigation">
            {SCENE_NAMES.map((s, idx) => {
              const isActive = idx === currentSceneIndex;
              return (
                <button
                  key={s.id}
                  onClick={() => onNavigateSection?.(s.id)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30 scale-105'
                      : 'text-slate-300 hover:text-amber-300 hover:bg-slate-800/80'
                  }`}
                >
                  {s.title.split(' ')[0]}
                </button>
              );
            })}
          </nav>
        )}

        {/* Right: Gamification Badges, Mode Switcher, & Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Berries Treasury */}
          <div className="flex items-center gap-1.5 bg-amber-950/70 border border-amber-600/40 rounded-xl px-2.5 py-1 text-xs font-bold text-amber-300 shadow-inner">
            <span className="text-amber-400 font-serif">฿</span>
            <span>{gameState.berries.toLocaleString()}</span>
          </div>

          {/* Fleet Level */}
          <div className="hidden md:flex items-center gap-1 bg-slate-800/80 border border-slate-700 rounded-xl px-2 py-1 text-xs font-semibold text-slate-200">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>Lv. {gameState.fleetLevel}</span>
          </div>

          {/* Dual Mode Switcher (Voyage <-> Map) */}
          <button
            onClick={() => setViewMode(viewMode === 'voyage' ? 'map' : 'voyage')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
            title="Toggle between Cinematic Voyage and Grand Line World Map"
            aria-label="Toggle Voyage or Island Map mode"
          >
            {viewMode === 'voyage' ? (
              <>
                <Map className="w-4 h-4" />
                <span className="hidden sm:inline">Grand Line Map</span>
              </>
            ) : (
              <>
                <Ship className="w-4 h-4" />
                <span className="hidden sm:inline">Scroll Voyage</span>
              </>
            )}
          </button>

          {/* User Auth: Login Button / User Profile Dropdown */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 py-1 px-2 rounded-xl bg-slate-900 border border-amber-500/50 hover:border-amber-400 text-slate-100 text-xs font-bold transition-all shadow-md cursor-pointer select-none"
                title={`${user.name} (${user.role}) - Click for profile`}
              >
                <div className="w-6 h-6 rounded-lg bg-slate-950 flex items-center justify-center overflow-hidden border border-slate-700">
                  <JollyRogerAvatar
                    hatType={user.avatar}
                    symbol={user.hakiType === 'Conqueror' ? 'flames' : 'crossbones'}
                    baseColor="#09090b"
                    accentColor="#f59e0b"
                    size={22}
                  />
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-[11px] font-pirate text-amber-300 leading-tight truncate max-w-[85px]">
                    {user.name.split(' ')[0]}
                  </span>
                  <span className="text-[9px] text-slate-400 -mt-0.5 leading-tight truncate max-w-[85px]">
                    {user.role.split(' ')[0]}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* User Dropdown Profile Menu */}
              {showUserDropdown && (
                <div 
                  className="absolute right-0 mt-2 w-64 p-3.5 bg-slate-950/95 border-2 border-amber-500/50 rounded-2xl shadow-2xl backdrop-blur-xl z-50 text-xs space-y-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-800">
                    <div className="p-1 rounded-xl bg-slate-900 border border-slate-700 shrink-0">
                      <JollyRogerAvatar
                        hatType={user.avatar}
                        symbol={user.hakiType === 'Conqueror' ? 'flames' : 'crossbones'}
                        baseColor="#09090b"
                        accentColor="#f59e0b"
                        size={36}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="font-pirate text-base text-parchment leading-tight truncate">
                        {user.name}
                      </div>
                      <div className="text-[10px] text-amber-400 font-semibold truncate">
                        {user.title}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Bounty: <strong className="text-amber-300">฿ {(user.bounty / 1000000).toLocaleString()}M</strong>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Command Rank:</span>
                      <span className="text-slate-200 font-bold">{user.role}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Haki Discipline:</span>
                      <span className="text-cyan-400 font-bold">{user.hakiType}</span>
                    </div>
                    {user.fleetDivision && (
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Assigned Fleet:</span>
                        <span className="text-amber-300 font-bold truncate max-w-[120px]">{user.fleetDivision}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserDropdown(false);
                        openLoginModal();
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 text-[11px] font-bold text-center cursor-pointer transition-colors"
                    >
                      Switch Demo User
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserDropdown(false);
                        logout();
                      }}
                      className="py-1.5 px-3 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/40 text-[11px] font-bold text-center cursor-pointer transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => openLoginModal('unlock fleet command and editing')}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-semibold hover:bg-amber-900/60 transition-colors cursor-pointer"
                title="Website is in Read-Only Mode. Sign in to edit rosters, trials, and bounties."
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Read-Only Mode</span>
              </button>
              <button
                type="button"
                onClick={() => openLoginModal()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer"
                title="Sign in with demo data or custom credentials"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>⚓ Login</span>
              </button>
            </div>
          )}

          {/* Audio toggle button (Muted by default) */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
            title={isMuted ? 'Ambient Ocean Audio: Off (Click to activate)' : 'Ambient Ocean Audio: On'}
            aria-label="Toggle ambient sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </div>

      {/* Read-Only Top Alert Notice */}
      {!isAuthenticated && (
        <div className="max-w-7xl mx-auto mt-2 px-3.5 py-1.5 rounded-xl bg-slate-950/90 border border-amber-500/40 shadow-xl backdrop-blur-md flex items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 text-slate-300">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-[11px] sm:text-xs">
              <strong className="text-amber-300">Fleet Observation Mode:</strong> The website is currently <strong>Read-Only</strong> until login. Browse rosters and trials freely, or sign in to enlist recruits and assemble the Grand Fleet!
            </span>
          </div>
          <button
            type="button"
            onClick={() => openLoginModal('unlock full fleet command')}
            className="shrink-0 px-2.5 py-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-lg text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1"
          >
            <LogIn className="w-3 h-3" />
            <span>Sign In (Demo)</span>
          </button>
        </div>
      )}
    </header>
  );
};

