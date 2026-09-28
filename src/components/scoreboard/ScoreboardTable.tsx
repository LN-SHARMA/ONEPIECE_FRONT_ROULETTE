import React from 'react';
import { useFleetStore } from '../../store/fleetStore';
import { Challenge, Participant } from '../../types';
import { evaluateChallengeFit } from '../../services/teamEngine';
import { JollyRogerAvatar } from '../common/SvgIcons';
import { Trophy, Ship, Award, Printer, Copy, Download, Check, Sparkles } from 'lucide-react';

export const ScoreboardTable: React.FC = () => {
  const { crews, challenges, participants, assignChallengeToCrew, showToast } = useFleetStore();
  const [copied, setCopied] = React.useState(false);

  const participantsMap = new Map<string, Participant>(participants.map(p => [p.id, p]));
  const challengesMap = new Map<string, Challenge>(challenges.map(c => [c.id, c]));

  // Clipboard export formatter
  const handleCopyText = () => {
    let report = `=== GRAND FLEET: DAVY BACK FIGHT ROSTER ===\n\n`;
    crews.forEach((c, idx) => {
      const ch = c.assignedChallengeId ? challengesMap.get(c.assignedChallengeId) : null;
      report += `Crew #${idx + 1}: ${c.name} (Ship: ${c.shipName})\n`;
      report += `Assigned Trial: ${ch ? ch.name : 'Unassigned'} (Fit: ${c.fitScore || 0}%)\n`;
      report += `Members:\n`;
      c.members.forEach(m => {
        const p = participantsMap.get(m.participantId);
        report += `  - [${m.assignedRole}] ${p?.name || 'Unknown'} (Bounty: ฿${p?.bounty.toLocaleString()})\n`;
      });
      report += `\n`;
    });

    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    showToast({
      title: 'Roster Copied to Clipboard!',
      message: 'Grand Line official tournament ledger ready for sharing.',
      type: 'info',
    });
  };

  // JSON export
  const handleDownloadJson = () => {
    const data = {
      event: 'Grand Fleet Davy Back Fight',
      timestamp: new Date().toISOString(),
      crews: crews.map(c => ({
        id: c.id,
        name: c.name,
        shipName: c.shipName,
        assignedChallenge: c.assignedChallengeId ? challengesMap.get(c.assignedChallengeId)?.name : null,
        fitScore: c.fitScore,
        members: c.members.map(m => {
          const p = participantsMap.get(m.participantId);
          return {
            name: p?.name,
            role: m.assignedRole,
            bounty: p?.bounty,
            skills: p?.skills,
          };
        }),
      })),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grand-fleet-roster-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full glass-panel-gold rounded-3xl p-6 sm:p-8 border text-slate-100 shadow-2xl relative">
      {/* Header & Export Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-amber-500/30">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
              👑 Laugh Tale Gold: Championship
            </span>
            <span className="text-xs text-amber-200/70">Official Event Tournament Ledger</span>
          </div>
          <h2 className="font-pirate text-3xl sm:text-4xl text-amber-300 tracking-wide mt-1">
            Davy Back Fight Roster
          </h2>
        </div>

        {/* Export Buttons (R14) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 text-xs font-bold hover:bg-slate-800 transition-colors shadow-md"
            title="Copy text report to clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={handleDownloadJson}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 text-xs font-bold hover:bg-slate-800 transition-colors shadow-md"
            title="Export JSON schema"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors shadow-lg shadow-amber-500/20"
            title="Print printable match sheet"
          >
            <Printer className="w-4 h-4" />
            <span>Print Sheet</span>
          </button>
        </div>
      </div>

      {/* Roster Matchup Table */}
      {crews.length === 0 ? (
        <div className="py-20 text-center text-slate-400">
          <Sparkles className="w-10 h-10 text-amber-500/40 mx-auto mb-3" />
          <p className="font-pirate text-2xl text-amber-300">Roster not yet generated.</p>
          <p className="text-sm mt-1">Assemble the fleet in the Haki Clash section to view assignments.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {crews.map((crew, idx) => {
            const assignedChallenge = crew.assignedChallengeId
              ? challengesMap.get(crew.assignedChallengeId)
              : null;
            const fitScore = crew.fitScore || 0;

            return (
              <div
                key={crew.id}
                className="p-5 rounded-2xl bg-slate-950/70 border border-amber-500/30 shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
              >
                {/* Left: Crew & Ship */}
                <div className="flex items-center gap-4 min-w-[260px]">
                  <div className="p-1 rounded-xl bg-slate-900 border border-amber-500/40">
                    <JollyRogerAvatar
                      hatType={crew.hasConqueror ? 'crown' : 'straw'}
                      symbol={crew.hasConqueror ? 'flames' : 'crossbones'}
                      baseColor="#0f172a"
                      accentColor="#f59e0b"
                      size={48}
                    />
                  </div>
                  <div>
                    <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                      Fleet Division #{idx + 1}
                    </div>
                    <h3 className="font-pirate text-2xl text-parchment leading-tight">
                      {crew.name}
                    </h3>
                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Ship className="w-3.5 h-3.5 text-amber-400" />
                      <span>{crew.shipName}</span>
                    </div>
                  </div>
                </div>

                {/* Center: Crew Members with Roles */}
                <div className="flex-1 w-full min-w-0">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
                    Commissioned Members ({crew.members.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {crew.members.map((m) => {
                      const p = participantsMap.get(m.participantId);
                      return (
                        <div
                          key={m.participantId}
                          className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-xs flex items-center gap-1.5"
                        >
                          <span className="font-bold text-parchment truncate max-w-[120px]">
                            {p?.name}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300 font-bold uppercase">
                            {m.assignedRole}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Assigned Sea Trial & Fit % (R13) */}
                <div className="w-full lg:w-72 bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1.5 text-xs">
                    <span className="text-slate-400 font-medium">Assigned Trial:</span>
                    <span className={`font-bold font-pirate text-base ${fitScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {fitScore}% Fit
                    </span>
                  </div>

                  {/* Manual Challenge Override Dropdown */}
                  <select
                    value={crew.assignedChallengeId || ''}
                    onChange={(e) => assignChallengeToCrew(crew.id, e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-amber-300 font-semibold outline-none focus:border-amber-400"
                    aria-label={`Assign challenge for ${crew.name}`}
                  >
                    <option value="" disabled>Select Davy Back Trial</option>
                    {challenges.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.category})
                      </option>
                    ))}
                  </select>

                  {assignedChallenge && (
                    <div className="text-[10px] text-slate-400 mt-2 line-clamp-1">
                      {assignedChallenge.description}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
