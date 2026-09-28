import React, { useState } from 'react';
import { Participant, PirateRole, ALL_ROLES } from '../../types';
import { useFleetStore } from '../../store/fleetStore';
import { deriveHaki, SKILL_AXES } from '../../services/teamEngine';
import { JollyRogerAvatar, DevilFruitSwirlIcon } from '../common/SvgIcons';
import { X, Trash2, Edit3, Check, Eye, Shield, Zap, Sparkles } from 'lucide-react';

interface PirateDetailModalProps {
  participant: Participant;
  onClose: () => void;
}

export const PirateDetailModal: React.FC<PirateDetailModalProps> = ({ participant, onClose }) => {
  const { updateParticipant, deleteParticipant } = useFleetStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(participant.name);
  const [editEpithet, setEditEpithet] = useState(participant.epithet);
  const [editPrimary, setEditPrimary] = useState<PirateRole>(participant.primaryRole);
  const [editSecondary, setEditSecondary] = useState<PirateRole>(participant.secondaryRole);

  const haki = deriveHaki(participant.skills, editPrimary, editSecondary);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSave = async () => {
    await updateParticipant({
      ...participant,
      name: editName,
      epithet: editEpithet,
      primaryRole: editPrimary,
      secondaryRole: editSecondary,
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm(`Release ${participant.name} from the Grand Fleet archives?`)) {
      await deleteParticipant(participant.id);
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <div className="w-full max-w-xl glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/40 text-slate-100 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Wanted Poster Mini Frame */}
          <div className="parchment-card p-3 rounded-md w-36 shrink-0 text-center shadow-lg">
            <div className="font-pirate text-xl text-[#2c1d11] uppercase tracking-wider">WANTED</div>
            <div className="my-1 mx-auto w-24 h-24 bg-[#e2d4b7] border border-[#4a3018] rounded flex items-center justify-center">
              <JollyRogerAvatar
                hatType={participant.jollyRogerStyle.hatType}
                symbol={participant.jollyRogerStyle.symbol}
                baseColor={participant.jollyRogerStyle.baseColor}
                accentColor={participant.jollyRogerStyle.accentColor}
                size={75}
              />
            </div>
            <div className="font-pirate text-lg text-[#8b1e0f] mt-1 leading-tight">
              ฿ {(participant.bounty / 1000000).toFixed(0)}M
            </div>
          </div>

          {/* Details & Edit Form */}
          <div className="flex-1 w-full min-w-0">
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold text-lg"
                  placeholder="Pirate Name"
                />
                <input
                  type="text"
                  value={editEpithet}
                  onChange={(e) => setEditEpithet(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs"
                  placeholder="Epithet"
                />
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-slate-400">Primary Role</label>
                    <select
                      value={editPrimary}
                      onChange={(e) => setEditPrimary(e.target.value as PirateRole)}
                      className="w-full mt-1 p-1.5 rounded bg-slate-900 border border-slate-700 text-white"
                    >
                      {ALL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400">Secondary Role</label>
                    <select
                      value={editSecondary}
                      onChange={(e) => setEditSecondary(e.target.value as PirateRole)}
                      className="w-full mt-1 p-1.5 rounded bg-slate-900 border border-slate-700 text-white"
                    >
                      {ALL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-pirate text-3xl text-parchment leading-tight">
                  {participant.name}
                </h3>
                <div className="text-sm font-semibold text-amber-400 mt-0.5">
                  "{participant.epithet}"
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                    Primary: {participant.primaryRole}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-semibold">
                    Secondary: {participant.secondaryRole}
                  </span>
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-semibold">
                    <DevilFruitSwirlIcon type={participant.devilFruit} className="w-3.5 h-3.5" />
                    {participant.devilFruit} Fruit
                  </span>
                </div>
              </div>
            )}

            {/* Haki Meters */}
            <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Haki Affinities & Mastery
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-center">
                  <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-cyan-400">
                    <Eye className="w-3 h-3" /> Observation
                  </div>
                  <div className="font-pirate text-xl text-cyan-300 mt-0.5">{haki.observation}%</div>
                </div>

                <div className="p-2 rounded-xl bg-slate-900 border border-slate-600/40 text-center">
                  <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-300">
                    <Shield className="w-3 h-3" /> Armament
                  </div>
                  <div className="font-pirate text-xl text-slate-200 mt-0.5">{haki.armament}%</div>
                </div>

                <div className="p-2 rounded-xl bg-red-950/40 border border-red-500/30 text-center">
                  <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-red-400">
                    <Zap className="w-3 h-3" /> Conqueror
                  </div>
                  <div className="font-pirate text-xl text-red-300 mt-0.5">{haki.conqueror}%</div>
                </div>
              </div>
            </div>

            {/* Skills Radar / Breakdown */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Combat & Voyage Attributes
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {SKILL_AXES.map((axis) => (
                  <div key={axis} className="flex items-center justify-between p-1.5 rounded bg-slate-900/60 border border-slate-800">
                    <span className="capitalize text-slate-400">{axis}</span>
                    <span className="font-pirate text-amber-400 text-sm">
                      {participant.skills[axis]}/5
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interests Chips */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {participant.interests.map((tag, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md text-[11px]">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-slate-800">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30"
                  >
                    <Check className="w-4 h-4" /> Save Bounty
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/60 border border-red-500/40 text-red-300 text-xs font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Discharge
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-semibold"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Record
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
