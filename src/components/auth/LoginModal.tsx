import React, { useState } from 'react';
import { useAuthStore, DEMO_USERS, DemoUser } from '../../store/authStore';
import { useFleetStore } from '../../store/fleetStore';
import { JollyRogerAvatar } from '../common/SvgIcons';
import { 
  X, 
  KeyRound, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  Crown, 
  ArrowRight,
  CheckCircle2,
  Users
} from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, closeLoginModal, loginWithDemo, loginWithCredentials, readOnlyNotice } = useAuthStore();
  const { showToast, setHakiVfx } = useFleetStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleDemoSelect = (demo: DemoUser) => {
    loginWithDemo(demo);
    setHakiVfx(demo.hakiType === 'Conqueror' ? 'conqueror' : 'observation');
    showToast({
      title: `Welcome Aboard, ${demo.name}!`,
      message: `Logged in as ${demo.role} • Bounty ฿ ${(demo.bounty / 1000000).toLocaleString()}M`,
      type: 'haki',
    });
  };

  const handleQuickFill = (demo: DemoUser) => {
    setEmail(demo.email);
    setPassword(demo.password);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await loginWithCredentials(email, password);
      if (res.success) {
        setHakiVfx('conqueror');
        showToast({
          title: 'Authentication Successful!',
          message: res.message,
          type: 'haki',
        });
      } else {
        setError(res.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 sm:pt-14 pb-12 bg-slate-950/45 backdrop-blur-sm overflow-y-auto animate-fade-in"
      onClick={closeLoginModal}
    >
      <div 
        className="w-full max-w-xl my-6 bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-100 font-body overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient effects */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-inner">
              <Crown className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Grand Fleet Auth
                </span>
                <span className="text-xs text-slate-400">Security Clearance</span>
              </div>
              <h3 className="font-pirate text-3xl text-parchment tracking-wide mt-0.5">
                Pirate Command Login
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={closeLoginModal}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close login dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Read-Only Notice Banner */}
        {readOnlyNotice && (
          <div className="mt-4 p-3.5 rounded-2xl bg-amber-950/80 border-2 border-amber-500/60 shadow-lg flex items-center gap-3 text-xs text-amber-200 animate-pulse">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="leading-snug">
              <span className="font-bold text-amber-300 uppercase tracking-wide block text-[10px]">
                🔒 Read-Only Observation Mode Active
              </span>
              <span>{readOnlyNotice}</span>
            </div>
          </div>
        )}

        {/* 1-CLICK DEMO ACCOUNTS SHOWCASE */}
        <div className="mt-5 space-y-2.5 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              1-Click Demo Logins:
            </span>
            <span className="text-[11px] text-slate-400">
              Click any character to sign in instantly
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {DEMO_USERS.map((demo) => (
              <div
                key={demo.id}
                className="group relative p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-950 transition-all flex items-center justify-between gap-3 shadow-md"
              >
                <div 
                  onClick={() => handleDemoSelect(demo)}
                  className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                  title={`Sign in as ${demo.name}`}
                >
                  <div className="p-1 rounded-xl bg-slate-900 border border-slate-750 shrink-0">
                    <JollyRogerAvatar
                      hatType={demo.avatar}
                      symbol={demo.hakiType === 'Conqueror' ? 'flames' : 'crossbones'}
                      baseColor="#09090b"
                      accentColor={demo.avatarColor}
                      size={32}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-pirate text-base text-parchment group-hover:text-amber-300 truncate leading-tight">
                      {demo.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                      <span className="font-semibold text-amber-400">{demo.role}</span>
                      <span>• ฿{(demo.bounty / 1000000).toLocaleString()}M</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleQuickFill(demo)}
                    className="p-1 text-[10px] text-slate-500 hover:text-slate-300 font-mono"
                    title="Fill credentials into form"
                  >
                    Fill
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoSelect(demo)}
                    className="px-2 py-1 rounded-lg bg-amber-500/20 group-hover:bg-amber-500 text-amber-300 group-hover:text-slate-950 text-xs font-bold transition-all shrink-0 cursor-pointer"
                    title="Log in now"
                  >
                    Enter →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* OR Divider */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <span className="relative px-3 bg-slate-900 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
            Or Sign In with Credentials
          </span>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 relative z-10">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <span className="text-sm">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>Pirate Email / Log Pose Address</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. luffy@strawhat.fleet"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-parchment outline-none focus:border-amber-400 transition-colors"
              required
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Password / Cipher Key</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                (Demo passwords shown on hover)
              </span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-parchment outline-none focus:border-amber-400 transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <div className="text-[11px] text-slate-400">
              New pirate? Any email + 4 char pass creates an account.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-pirate text-xl uppercase tracking-wider shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
