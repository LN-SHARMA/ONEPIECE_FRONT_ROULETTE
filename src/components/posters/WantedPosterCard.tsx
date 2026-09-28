import React from 'react';
import { Participant } from '../../types';
import { deriveHaki } from '../../services/teamEngine';
import { JollyRogerAvatar, DevilFruitSwirlIcon } from '../common/SvgIcons';
import { Eye, Shield, Zap } from 'lucide-react';

interface WantedPosterCardProps {
  participant: Participant;
  onClick: () => void;
}

export const WantedPosterCard: React.FC<WantedPosterCardProps> = ({ participant, onClick }) => {
  const haki = deriveHaki(participant.skills, participant.primaryRole, participant.secondaryRole);

  return (
    <div
      onClick={onClick}
      className="parchment-card p-4 rounded-md cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:rotate-1 hover:shadow-2xl flex flex-col justify-between group"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`Wanted poster for ${participant.name}`}
    >
      <div>
        {/* Header */}
        <div className="font-pirate text-3xl tracking-widest text-[#2c1d11] border-b-2 border-[#4a3018] pb-0.5 uppercase text-center">
          WANTED
        </div>

        {/* Avatar Frame */}
        <div className="my-2.5 mx-auto w-28 h-28 bg-[#e2d4b7] border-2 border-[#4a3018] rounded flex items-center justify-center relative overflow-hidden shadow-inner group-hover:scale-105 transition-transform">
          <JollyRogerAvatar
            hatType={participant.jollyRogerStyle.hatType}
            symbol={participant.jollyRogerStyle.symbol}
            baseColor={participant.jollyRogerStyle.baseColor}
            accentColor={participant.jollyRogerStyle.accentColor}
            size={90}
          />
          {participant.devilFruit !== 'None' && (
            <div className="absolute bottom-1 right-1 p-0.5 bg-black/70 rounded-full" title={`Devil Fruit: ${participant.devilFruit}`}>
              <DevilFruitSwirlIcon type={participant.devilFruit} className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        {/* Name & Epithet */}
        <div className="font-pirate text-xl text-[#2c1d11] truncate px-1 uppercase tracking-wide text-center">
          {participant.name}
        </div>
        <div className="text-[10px] font-bold text-[#6d4c2b] uppercase tracking-wider text-center truncate mb-1">
          "{participant.epithet}"
        </div>

        {/* Roles badge */}
        <div className="flex items-center justify-center gap-1 my-1">
          <span className="px-1.5 py-0.5 bg-[#4a3018] text-parchment text-[10px] font-bold rounded">
            {participant.primaryRole}
          </span>
          <span className="px-1.5 py-0.5 bg-[#8b653f]/40 text-[#38240f] text-[10px] font-semibold rounded">
            {participant.secondaryRole}
          </span>
        </div>

        {/* Bounty */}
        <div className="border-t-2 border-b-2 border-[#4a3018] py-1 my-1 text-center">
          <div className="text-[9px] uppercase font-bold tracking-widest text-[#4a3018]">
            DEAD OR ALIVE
          </div>
          <div className="font-pirate text-xl text-[#8b1e0f] tracking-wide">
            ฿ {participant.bounty.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Haki Glow Indicators */}
      <div className="mt-2 pt-1.5 border-t border-[#c5b18f] flex items-center justify-between text-[10px] font-bold px-1">
        <span className="flex items-center gap-0.5 text-cyan-800" title="Observation Haki">
          <Eye className="w-3 h-3" /> {haki.observation}%
        </span>
        <span className="flex items-center gap-0.5 text-slate-800" title="Armament Haki">
          <Shield className="w-3 h-3" /> {haki.armament}%
        </span>
        <span className="flex items-center gap-0.5 text-red-800" title="Conqueror's Haki">
          <Zap className="w-3 h-3" /> {haki.conqueror}%
        </span>
      </div>
    </div>
  );
};
