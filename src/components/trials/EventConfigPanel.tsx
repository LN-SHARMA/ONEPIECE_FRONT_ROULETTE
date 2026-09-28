import React from 'react';
import { useFleetStore } from '../../store/fleetStore';
import { Users, Sliders, Shield } from 'lucide-react';

export const EventConfigPanel: React.FC = () => {
  const { eventConfig, updateConfig, participants, assembleFleet } = useFleetStore();

  const handleCrewSizeChange = (val: number) => {
    updateConfig({ crewSize: val });
  };

  const handleCrewCountChange = (val: number | undefined) => {
    updateConfig({ crewCount: val });
  };

  const estimatedCrews = eventConfig.crewCount || Math.floor(participants.length / eventConfig.crewSize);
  const remainderStowaways = participants.length - (estimatedCrews * eventConfig.crewSize);

  return (
    <div className="bg-slate-900/90 border border-orange-500/30 rounded-2xl p-5 shadow-xl text-slate-100">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-orange-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-orange-300">
            Davy Back Fight Event Rules
          </span>
        </div>
        <span className="text-xs text-slate-400">
          Target Crew Formation: <strong className="text-amber-400">{estimatedCrews} Crews</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {/* Crew Size Slider (2 - 9) (R6) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="crew-size-slider" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              Target Crew Size (Members per Ship)
            </label>
            <span className="font-pirate text-2xl text-amber-400">
              {eventConfig.crewSize} Pirates
            </span>
          </div>

          <input
            id="crew-size-slider"
            type="range"
            min={2}
            max={9}
            step={1}
            value={eventConfig.crewSize}
            onChange={(e) => handleCrewSizeChange(parseInt(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            aria-label="Crew size slider"
          />

          <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
            <span>2 (Duo Skiff)</span>
            <span>4 (Standard)</span>
            <span>6 (Galleon)</span>
            <span>9 (Grand Armada)</span>
          </div>
        </div>

        {/* Optional Crew Count Override (R6) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="crew-count-override" className="text-xs font-semibold text-slate-300">
              Total Crews Override (Optional)
            </label>
            <span className="text-xs text-slate-400 font-mono">
              {eventConfig.crewCount ? `${eventConfig.crewCount} Fixed` : 'Auto-Balanced'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <select
              id="crew-count-override"
              value={eventConfig.crewCount || 'auto'}
              onChange={(e) => handleCrewCountChange(e.target.value === 'auto' ? undefined : parseInt(e.target.value))}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white outline-none focus:border-orange-400"
            >
              <option value="auto">Auto (Derived from Participants / Crew Size)</option>
              <option value="2">2 Crews (Head-to-head Clash)</option>
              <option value="3">3 Crews (Triple Threat Maelstrom)</option>
              <option value="4">4 Crews (Grand Tournament)</option>
              <option value="6">6 Crews (All-Out Pirate War)</option>
            </select>

            <button
              onClick={() => assembleFleet(true)}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
            >
              Apply
            </button>
          </div>

          <div className="text-[11px] text-slate-400 mt-2">
            {remainderStowaways > 0 ? (
              <span className="text-amber-400">
                ⚠ {remainderStowaways} pirates will be designated as unassigned stowaways.
              </span>
            ) : (
              <span className="text-emerald-400">
                ✓ All enlisted pirates fit into active crews without remainders!
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
