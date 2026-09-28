import React, { useState } from 'react';
import { useFleetStore } from '../../store/fleetStore';
import { Participant, PirateRole, ALL_ROLES } from '../../types';
import { WantedPosterCard } from './WantedPosterCard';
import { PirateDetailModal } from './PirateDetailModal';
import { Search, Filter, ArrowUpDown, Sparkles } from 'lucide-react';

export const WantedPosterWall: React.FC = () => {
  const { participants } = useFleetStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'bounty-desc' | 'bounty-asc' | 'name'>('bounty-desc');
  const [selectedPirate, setSelectedPirate] = useState<Participant | null>(null);

  // Filtering & Sorting
  const filteredParticipants = participants.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.epithet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.interests.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole =
      selectedRole === 'ALL' ||
      p.primaryRole === selectedRole ||
      p.secondaryRole === selectedRole;

    return matchesSearch && matchesRole;
  }).sort((a, b) => {
    if (sortOrder === 'bounty-desc') return b.bounty - a.bounty;
    if (sortOrder === 'bounty-asc') return a.bounty - b.bounty;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="w-full glass-panel rounded-3xl p-6 sm:p-8 border border-purple-500/30 text-slate-100 shadow-2xl">
      {/* Wall Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-purple-500/20">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40">
            Sabaody Archipelago Archives
          </span>
          <h2 className="font-pirate text-3xl sm:text-4xl text-parchment tracking-wide mt-1">
            Wanted Poster Wall
          </h2>
        </div>
        <div className="text-xs text-slate-400">
          Showing <span className="text-amber-400 font-bold">{filteredParticipants.length}</span> of {participants.length} bounty notices
        </div>
      </div>

      {/* Filter / Search / Sort Controls */}
      <div className="flex flex-wrap items-center gap-3 my-6">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pirate name, epithet, or interest..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-sm text-white placeholder-slate-500 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
          />
        </div>

        {/* Role Filter */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs">
          <Filter className="w-3.5 h-3.5 text-purple-400" />
          <label htmlFor="role-filter-select" className="text-slate-400">Role:</label>
          <select
            id="role-filter-select"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-transparent text-white font-semibold outline-none cursor-pointer"
          >
            <option value="ALL" className="bg-slate-900">All Roles</option>
            {ALL_ROLES.map((r) => (
              <option key={r} value={r} className="bg-slate-900">{r}</option>
            ))}
          </select>
        </div>

        {/* Sort Order */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs">
          <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
          <label htmlFor="sort-order-select" className="text-slate-400">Sort:</label>
          <select
            id="sort-order-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="bg-transparent text-white font-semibold outline-none cursor-pointer"
          >
            <option value="bounty-desc" className="bg-slate-900">Bounty: High → Low</option>
            <option value="bounty-asc" className="bg-slate-900">Bounty: Low → High</option>
            <option value="name" className="bg-slate-900">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Poster Grid */}
      {filteredParticipants.length === 0 ? (
        <div className="py-16 text-center text-slate-400">
          <Sparkles className="w-8 h-8 text-amber-500/40 mx-auto mb-2" />
          <p className="font-pirate text-xl text-parchment">No bounties match your search query.</p>
          <p className="text-xs mt-1">Try clearing filters or enlist a new pirate above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredParticipants.map((p) => (
            <WantedPosterCard
              key={p.id}
              participant={p}
              onClick={() => setSelectedPirate(p)}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedPirate && (
        <PirateDetailModal
          participant={selectedPirate}
          onClose={() => setSelectedPirate(null)}
        />
      )}
    </div>
  );
};
