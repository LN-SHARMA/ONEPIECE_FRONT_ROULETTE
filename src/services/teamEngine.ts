import { 
  Participant, 
  Challenge, 
  EventConfig, 
  GrandFleetSkillConfig,
  Crew, 
  CrewMember, 
  StructuredWarning, 
  PirateRole, 
  SkillSet, 
  HakiStats 
} from '../types';

export const SKILL_AXES: (keyof SkillSet)[] = [
  'combat',
  'navigation',
  'cooking',
  'medical',
  'engineering',
  'wits'
];

/**
 * Pure function to derive Haki from skills and roles
 */
export function deriveHaki(
  skills: Participant['skills'],
  primaryRole: PirateRole,
  secondaryRole: PirateRole
): HakiStats {
  const obs = Math.min(100, Math.round((skills.navigation * 0.4 + skills.wits * 0.4 + skills.medical * 0.2) * 20));
  const arm = Math.min(100, Math.round((skills.combat * 0.5 + skills.engineering * 0.3 + skills.cooking * 0.2) * 20));
  const isLeader = (r: PirateRole) => r === 'Captain' || r === 'Tech Lead / Architect';
  const leadBonus = isLeader(primaryRole) ? 15 : isLeader(secondaryRole) ? 5 : 0;
  const conRaw = (skills.combat * 0.35 + skills.wits * 0.35) * 20 + leadBonus;
  const con = Math.min(100, Math.round(conRaw));
  return { observation: obs, armament: arm, conqueror: con };
}

/**
 * Pseudo-random generator (Mulberry32) for reproducible team generation
 */
export function createRNG(seed: number) {
  let s = seed >>> 0;
  return function() {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CREW_NAME_PREFIXES = [
  'Straw Hat', 'Crimson Tempest', 'Iron Anchor', 'Siren Tide', 
  'Golden Lion', 'Dreadnought', 'Phantom Blade', 'Grand Sun', 
  'Silver Fox', 'Abyssal Current', 'Kraken Roar', 'North Star'
];

const CREW_NAME_SUFFIXES = [
  'Vanguard', 'Corsairs', 'Armada', 'Raiders', 
  'Battalion', 'Remnants', 'Squadron', 'Pioneers', 
  'Navigators', 'Alliance', 'Order', 'Brigade'
];

const SHIP_NAMES = [
  'Thousand Sunny II', 'Going Merry Restored', 'Red Force Mirage', 
  'Queen Mama Chanterette', 'Polar Tang Refit', 'Oro Jackson Legacy', 
  'Victoria Punk', 'Numancia Flamingo', 'Baratie Galleon', 'Moby Dick Spirit'
];

/**
 * Calculate Axis power for a crew
 */
export function computeCrewAxisScores(members: CrewMember[], participantsMap: Map<string, Participant>): SkillSet {
  const totals: SkillSet = { combat: 0, navigation: 0, cooking: 0, medical: 0, engineering: 0, wits: 0 };
  if (members.length === 0) return totals;

  for (const member of members) {
    const p = participantsMap.get(member.participantId);
    if (p) {
      for (const axis of SKILL_AXES) {
        totals[axis] += p.skills[axis];
      }
    }
  }
  return totals;
}

/**
 * Calculate Balance Score across crews
 */
export function calculateBalanceScore(crews: Crew[]): number {
  if (crews.length <= 1) return 100;

  let totalImbalance = 0;

  for (const axis of SKILL_AXES) {
    const values = crews.map(c => c.axisScores[axis]);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    if (mean === 0) continue;

    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = stdDev / (mean + 0.0001);
    totalImbalance += coefficientOfVariation;
  }

  const avgImbalance = totalImbalance / SKILL_AXES.length;
  // Map imbalance (e.g. 0 to 1) into score 0 to 100
  const score = Math.max(0, Math.min(100, Math.round(100 * (1 - avgImbalance * 0.8))));
  return score;
}

/**
 * Match a challenge to a crew and return Fit %
 */
export function evaluateChallengeFit(crew: Crew, challenge: Challenge, participantsMap: Map<string, Participant>): number {
  if (crew.members.length === 0) return 0;

  let totalScore = 0;
  let maxPossible = 0;

  // 1. Role coverage bonus
  const assignedRoles = new Set(crew.members.map(m => m.assignedRole));
  for (const reqRole of challenge.requiredRoles) {
    maxPossible += 10;
    if (assignedRoles.has(reqRole)) {
      totalScore += 10;
    }
  }

  // 2. Skill requirements coverage
  for (const req of challenge.requiredSkills) {
    const weight = req.weight;
    const maxSkillVal = 5 * crew.members.length;
    maxPossible += weight * 10;

    const crewTotal = crew.axisScores[req.skill];
    const targetMin = req.minLevel * Math.min(crew.members.length, 2);
    
    if (crewTotal >= targetMin) {
      totalScore += weight * 10;
    } else {
      const partial = (crewTotal / Math.max(1, targetMin)) * (weight * 10);
      totalScore += partial;
    }
  }

  if (maxPossible === 0) return 100;
  return Math.max(10, Math.min(100, Math.round((totalScore / maxPossible) * 100)));
}

export interface EngineResult {
  crews: Crew[];
  stowaways: string[];
  balanceScore: number;
  conquerorWinnerId?: string;
}

/**
 * Main Team Balancing Engine
 */
export function generateTeams(
  participants: Participant[],
  challenges: Challenge[],
  config: EventConfig,
  existingCrews: Crew[] = []
): EngineResult {
  // Edge Case: Empty input
  if (!participants || participants.length === 0) {
    return {
      crews: [],
      stowaways: [],
      balanceScore: 100,
      conquerorWinnerId: undefined,
    };
  }

  const rng = createRNG(config.seed);
  const participantsMap = new Map<string, Participant>(participants.map(p => [p.id, p]));

  // 1. Conqueror Spirit Detection
  let highestConqueror = -1;
  let conquerorWinnerId: string | undefined = undefined;
  for (const p of participants) {
    const haki = deriveHaki(p.skills, p.primaryRole, p.secondaryRole);
    if (haki.conqueror > highestConqueror) {
      highestConqueror = haki.conqueror;
      conquerorWinnerId = p.id;
    }
  }

  // 2. Calculate target crew count
  const crewSize = Math.max(2, Math.min(9, config.crewSize || 4));
  let numCrews = config.crewCount 
    ? Math.max(1, config.crewCount)
    : Math.floor(participants.length / crewSize);

  // If fewer participants than crewSize, we can only form at most 1 crew
  if (numCrews === 0 && participants.length > 0) {
    numCrews = 1;
  }

  // 3. Preserve locked crews and pinned members
  const lockedCrewIdsSet = new Set(config.lockedCrewIds || []);
  const preservedCrews: Crew[] = [];
  const assignedParticipantIds = new Set<string>();

  for (const existing of existingCrews) {
    if (lockedCrewIdsSet.has(existing.id) || existing.isLocked) {
      // Validate all members exist
      const validMembers = existing.members.filter(m => participantsMap.has(m.participantId));
      for (const m of validMembers) {
        assignedParticipantIds.add(m.participantId);
      }
      preservedCrews.push({
        ...existing,
        isLocked: true,
        members: validMembers,
        axisScores: computeCrewAxisScores(validMembers, participantsMap),
      });
    }
  }

  // Preserve pinned members from non-locked crews
  const pinnedMemberPlacements: { crewIndex: number; member: CrewMember }[] = [];
  existingCrews.forEach((c, cIdx) => {
    if (!lockedCrewIdsSet.has(c.id) && !c.isLocked) {
      c.members.forEach(m => {
        if (m.isPinned && participantsMap.has(m.participantId)) {
          pinnedMemberPlacements.push({ crewIndex: cIdx, member: m });
          assignedParticipantIds.add(m.participantId);
        }
      });
    }
  });

  // 4. Determine pool of unassigned participants
  const availableParticipants = participants.filter(p => !assignedParticipantIds.has(p.id));

  // Determine needed new crews count
  const newCrewsNeeded = Math.max(0, numCrews - preservedCrews.length);
  const activeCrews: Crew[] = [...preservedCrews];

  for (let i = 0; i < newCrewsNeeded; i++) {
    const pIdx = (activeCrews.length + i) % CREW_NAME_PREFIXES.length;
    const sIdx = (activeCrews.length + i * 3) % CREW_NAME_SUFFIXES.length;
    const shipIdx = (activeCrews.length + i) % SHIP_NAMES.length;

    activeCrews.push({
      id: `crew-${Date.now()}-${activeCrews.length + 1}-${Math.floor(rng() * 1000)}`,
      name: `${CREW_NAME_PREFIXES[pIdx]} ${CREW_NAME_SUFFIXES[sIdx]}`,
      shipName: SHIP_NAMES[shipIdx],
      jollyRogerSvgSeed: `jr-seed-${i}-${Math.floor(rng() * 10000)}`,
      members: [],
      isLocked: false,
      axisScores: { combat: 0, navigation: 0, cooking: 0, medical: 0, engineering: 0, wits: 0 },
      hasConqueror: false,
      warnings: [],
    });
  }

  // Restore pinned members to their respective active crews if available
  for (const pin of pinnedMemberPlacements) {
    const targetCrew = activeCrews[pin.crewIndex % activeCrews.length];
    if (targetCrew && !targetCrew.isLocked) {
      targetCrew.members.push(pin.member);
    }
  }

  // 5. Partition Captains / Tech Leads and role matching for remaining available participants
  const isLeaderRole = (r: PirateRole) => r === 'Captain' || r === 'Tech Lead / Architect';

  // Sort available candidates by leadership + core technical problem solving
  const candidatePool = [...availableParticipants].sort((a, b) => {
    const scoreA = (isLeaderRole(a.primaryRole) ? 20 : isLeaderRole(a.secondaryRole) ? 10 : 0) + a.skills.combat + a.skills.wits;
    const scoreB = (isLeaderRole(b.primaryRole) ? 20 : isLeaderRole(b.secondaryRole) ? 10 : 0) + b.skills.combat + b.skills.wits;
    return scoreB - scoreA;
  });

  // Leadership Seeding: For each non-locked crew lacking a Leader, assign the best available candidate
  for (const crew of activeCrews) {
    if (crew.isLocked) continue;
    const hasLeader = crew.members.some(m => isLeaderRole(m.assignedRole));
    if (!hasLeader && candidatePool.length > 0) {
      const leaderIdx = candidatePool.findIndex(p => isLeaderRole(p.primaryRole) || isLeaderRole(p.secondaryRole));
      const selectedIdx = leaderIdx >= 0 ? leaderIdx : 0;
      const leaderParticipant = candidatePool.splice(selectedIdx, 1)[0];
      const preferredLeaderRole = isLeaderRole(leaderParticipant.primaryRole) ? leaderParticipant.primaryRole : 'Tech Lead / Architect';
      crew.members.push({
        participantId: leaderParticipant.id,
        assignedRole: preferredLeaderRole,
        isPinned: false,
      });
      assignedParticipantIds.add(leaderParticipant.id);
    }
  }

  // 6. Fill remaining slots per crew up to target crewSize using weighted greedy role coverage
  const nonLockedCrews = activeCrews.filter(c => !c.isLocked);

  // Essential roles queue to check (CSE Roles + Legacy Pirate Roles)
  const essentialRoles: PirateRole[] = [
    'Tech Lead / Architect', 'Backend Systems Dev', 'Frontend Engineer', 'DevOps / Cloud Architect', 
    'AI / ML Engineer', 'Cybersecurity Analyst', 'Full-Stack Developer',
    'Navigator', 'Doctor', 'Shipwright', 'Sniper', 'Chef', 'Swordsman'
  ];

  for (const role of essentialRoles) {
    for (const crew of nonLockedCrews) {
      if (crew.members.length >= crewSize) continue;
      if (candidatePool.length === 0) break;

      const hasRole = crew.members.some(m => m.assignedRole === role);
      if (!hasRole) {
        // Look for someone matching this primary or secondary role
        const matchIdx = candidatePool.findIndex(p => p.primaryRole === role || p.secondaryRole === role);
        if (matchIdx >= 0) {
          const matched = candidatePool.splice(matchIdx, 1)[0];
          crew.members.push({
            participantId: matched.id,
            assignedRole: role,
            isPinned: false,
          });
          assignedParticipantIds.add(matched.id);
        }
      }
    }
  }

  // Fill remainder of slots evenly
  let crewPointer = 0;
  while (candidatePool.length > 0 && nonLockedCrews.some(c => c.members.length < crewSize)) {
    const targetCrew = nonLockedCrews[crewPointer % nonLockedCrews.length];
    crewPointer++;

    if (targetCrew.members.length < crewSize) {
      const candidate = candidatePool.shift()!;
      // Assign best role among their primary/secondary or first available
      const existingRoles = new Set(targetCrew.members.map(m => m.assignedRole));
      let assignedRole: PirateRole = candidate.primaryRole;
      if (existingRoles.has(candidate.primaryRole) && !existingRoles.has(candidate.secondaryRole)) {
        assignedRole = candidate.secondaryRole;
      }
      targetCrew.members.push({
        participantId: candidate.id,
        assignedRole,
        isPinned: false,
      });
      assignedParticipantIds.add(candidate.id);
    }
  }

  // Remaining unassigned candidates become Stowaways
  const stowaways: string[] = candidatePool.map(p => p.id);

  // 7. Hill-climbing variance minimization across non-locked, non-pinned members
  for (const crew of activeCrews) {
    crew.axisScores = computeCrewAxisScores(crew.members, participantsMap);
  }

  if (nonLockedCrews.length > 1) {
    let currentScore = calculateBalanceScore(activeCrews);
    const MAX_HILL_CLIMB_ITERATIONS = 60;

    for (let iter = 0; iter < MAX_HILL_CLIMB_ITERATIONS; iter++) {
      // Pick two distinct non-locked crews
      const c1Idx = Math.floor(rng() * nonLockedCrews.length);
      let c2Idx = Math.floor(rng() * nonLockedCrews.length);
      if (c1Idx === c2Idx) c2Idx = (c1Idx + 1) % nonLockedCrews.length;

      const crewA = nonLockedCrews[c1Idx];
      const crewB = nonLockedCrews[c2Idx];

      // Pick unpinned members (excluding Captains to preserve structure)
      const swappableA = crewA.members
        .map((m, idx) => ({ m, idx }))
        .filter(x => !x.m.isPinned && x.m.assignedRole !== 'Captain');
      const swappableB = crewB.members
        .map((m, idx) => ({ m, idx }))
        .filter(x => !x.m.isPinned && x.m.assignedRole !== 'Captain');

      if (swappableA.length > 0 && swappableB.length > 0) {
        const itemA = swappableA[Math.floor(rng() * swappableA.length)];
        const itemB = swappableB[Math.floor(rng() * swappableB.length)];

        // Trial swap
        const tempMemberA = crewA.members[itemA.idx];
        crewA.members[itemA.idx] = crewB.members[itemB.idx];
        crewB.members[itemB.idx] = tempMemberA;

        crewA.axisScores = computeCrewAxisScores(crewA.members, participantsMap);
        crewB.axisScores = computeCrewAxisScores(crewB.members, participantsMap);

        const newScore = calculateBalanceScore(activeCrews);
        if (newScore >= currentScore) {
          currentScore = newScore;
        } else {
          // Revert swap
          const revertMemberA = crewA.members[itemA.idx];
          crewA.members[itemA.idx] = crewB.members[itemB.idx];
          crewB.members[itemB.idx] = revertMemberA;

          crewA.axisScores = computeCrewAxisScores(crewA.members, participantsMap);
          crewB.axisScores = computeCrewAxisScores(crewB.members, participantsMap);
        }
      }
    }
  }

  // 8. Assign challenges & evaluate warnings
  const availableChallenges = [...challenges];
  for (let i = 0; i < activeCrews.length; i++) {
    const crew = activeCrews[i];
    crew.hasConqueror = crew.members.some(m => m.participantId === conquerorWinnerId);
    crew.warnings = [];

    // Check Role Gaps
    const assignedRoles = new Set(crew.members.map(m => m.assignedRole));
    const hasLeader = assignedRoles.has('Captain') || assignedRoles.has('Tech Lead / Architect');
    if (!hasLeader) {
      crew.warnings.push({
        type: 'NO_CAPTAIN',
        crewId: crew.id,
        suggestion: 'No Tech Lead / Captain assigned! Architectural direction inactive.',
      });
    }
    const hasDevOps = assignedRoles.has('Navigator') || assignedRoles.has('DevOps / Cloud Architect');
    if (!hasDevOps) {
      crew.warnings.push({
        type: 'ROLE_GAP',
        crewId: crew.id,
        role: 'Navigator',
        suggestion: 'Missing DevOps / Cloud Navigator: deployment pipelines & Grand Line navigation risk elevated!',
      });
    }
    const hasSecurity = assignedRoles.has('Doctor') || assignedRoles.has('Cybersecurity Analyst') || assignedRoles.has('QA & Test Engineer');
    if (!hasSecurity) {
      crew.warnings.push({
        type: 'ROLE_GAP',
        crewId: crew.id,
        role: 'Doctor',
        suggestion: 'Missing Cybersecurity / Doctor: vulnerability testing & crash recovery impaired in trials.',
      });
    }
    if (crew.axisScores.combat < 8) {
      crew.warnings.push({
        type: 'LOW_SKILL',
        crewId: crew.id,
        suggestion: 'Algorithmic problem-solving power is low for high-tier engineering clashes.',
      });
    }

    // Auto-match challenge if not manually locked
    if (!crew.assignedChallengeId && availableChallenges.length > 0) {
      let bestFit = -1;
      let bestIdx = 0;
      for (let cIdx = 0; cIdx < availableChallenges.length; cIdx++) {
        const fit = evaluateChallengeFit(crew, availableChallenges[cIdx], participantsMap);
        if (fit > bestFit) {
          bestFit = fit;
          bestIdx = cIdx;
        }
      }
      const matched = availableChallenges.splice(bestIdx, 1)[0];
      crew.assignedChallengeId = matched.id;
      crew.fitScore = bestFit;
    } else if (crew.assignedChallengeId) {
      const existingCh = challenges.find(c => c.id === crew.assignedChallengeId);
      if (existingCh) {
        crew.fitScore = evaluateChallengeFit(crew, existingCh, participantsMap);
      }
    }
  }

  // 9. Runtime Invariant Assertion: No Duplicate Participant Assignment
  const seenParticipantIds = new Set<string>();
  for (const crew of activeCrews) {
    for (const member of crew.members) {
      if (seenParticipantIds.has(member.participantId)) {
        throw new Error(`Engine Invariant Violation: Participant ${member.participantId} assigned to multiple crews!`);
      }
      seenParticipantIds.add(member.participantId);
    }
  }
  for (const stowawayId of stowaways) {
    if (seenParticipantIds.has(stowawayId)) {
      throw new Error(`Engine Invariant Violation: Stowaway ${stowawayId} also appears inside a crew!`);
    }
  }

  const finalBalanceScore = calculateBalanceScore(activeCrews);

  return {
    crews: activeCrews,
    stowaways,
    balanceScore: finalBalanceScore,
    conquerorWinnerId,
  };
}

export interface OptimizedFleetResult extends EngineResult {
  initialFitScore: number;
  finalFitScore: number;
  optimizationApplied: boolean;
  optimizedSeed: number;
}

/**
 * Advanced Grand Fleet Generation & Optimization
 * Matches candidates on user-selected priority skills and automatically optimizes
 * fleet divisions if the current fit criteria is less than the target threshold.
 */
export function generateOptimizedGrandFleet(
  participants: Participant[],
  challenges: Challenge[],
  skillConfig: GrandFleetSkillConfig,
  baseConfig: EventConfig,
  existingCrews: Crew[] = []
): OptimizedFleetResult {
  const targetThreshold = skillConfig.targetFitThreshold || 80;
  const participantsMap = new Map<string, Participant>(participants.map(p => [p.id, p]));

  // Calculate fleet average fit score
  const getFleetAverageFit = (crewsList: Crew[]): number => {
    if (!crewsList || crewsList.length === 0) return 0;
    const total = crewsList.reduce((sum, c) => sum + (c.fitScore || 0), 0);
    return Math.round(total / crewsList.length);
  };

  // Helper to re-match challenges to maximize fit
  const optimizeChallengeAssignments = (crewsList: Crew[]): Crew[] => {
    const unassignedChallenges = [...challenges];
    return crewsList.map(crew => {
      if (crew.assignedChallengeId) {
        const existingCh = challenges.find(c => c.id === crew.assignedChallengeId);
        return {
          ...crew,
          fitScore: existingCh ? evaluateChallengeFit(crew, existingCh, participantsMap) : crew.fitScore || 0,
        };
      }
      if (unassignedChallenges.length === 0) return crew;
      let bestFit = -1;
      let bestIdx = 0;
      for (let i = 0; i < unassignedChallenges.length; i++) {
        const fit = evaluateChallengeFit(crew, unassignedChallenges[i], participantsMap);
        if (fit > bestFit) {
          bestFit = fit;
          bestIdx = i;
        }
      }
      const matched = unassignedChallenges.splice(bestIdx, 1)[0];
      return {
        ...crew,
        assignedChallengeId: matched.id,
        fitScore: bestFit,
      };
    });
  };

  // 1. Initial Generation using primary seed with skill priorities
  const initialConfig: EventConfig = {
    ...baseConfig,
    crewSize: skillConfig.crewSize || baseConfig.crewSize || 4,
    crewCount: skillConfig.crewCount || baseConfig.crewCount,
    seed: baseConfig.seed || 42,
    selectedSkills: skillConfig.selectedSkills,
  };

  // Rank candidate pool by chosen skills if specified
  const prioritizedParticipants = [...participants];
  if (skillConfig.selectedSkills && skillConfig.selectedSkills.length > 0) {
    const weights = skillConfig.skillWeights || {};
    prioritizedParticipants.sort((a, b) => {
      const scoreA = skillConfig.selectedSkills.reduce((sum, s) => sum + (a.skills[s] || 0) * (weights[s] || 1), 0);
      const scoreB = skillConfig.selectedSkills.reduce((sum, s) => sum + (b.skills[s] || 0) * (weights[s] || 1), 0);
      return scoreB - scoreA;
    });
  }

  let bestResult = generateTeams(prioritizedParticipants, challenges, initialConfig, existingCrews);
  bestResult.crews = optimizeChallengeAssignments(bestResult.crews);

  const initialFit = getFleetAverageFit(bestResult.crews);
  let bestFit = initialFit;
  let bestSeed = initialConfig.seed;
  let optimizationApplied = false;

  // 2. If fit is less than target threshold, run automatic iterative optimization
  if (initialFit < targetThreshold && skillConfig.autoOptimizeIfLowFit !== false) {
    optimizationApplied = true;

    // Phase A: Seed Exploration across candidate distributions
    const testSeeds = [
      initialConfig.seed + 13,
      initialConfig.seed + 37,
      initialConfig.seed + 99,
      initialConfig.seed + 149,
      initialConfig.seed + 257,
      initialConfig.seed + 389,
      initialConfig.seed + 521,
      initialConfig.seed + 733,
      initialConfig.seed + 997,
      initialConfig.seed + 1234,
      initialConfig.seed + 2048,
    ];

    for (const testSeed of testSeeds) {
      const candidateResult = generateTeams(
        prioritizedParticipants,
        challenges,
        { ...initialConfig, seed: testSeed },
        existingCrews
      );
      candidateResult.crews = optimizeChallengeAssignments(candidateResult.crews);
      const candFit = getFleetAverageFit(candidateResult.crews);

      if (candFit > bestFit) {
        bestFit = candFit;
        bestResult = candidateResult;
        bestSeed = testSeed;
        if (bestFit >= targetThreshold) break;
      }
    }

    // Phase B: Local 2-opt pairwise hill-climbing member swaps between divisions
    let improved = true;
    let passes = 0;
    while (improved && passes < 3 && bestFit < targetThreshold) {
      improved = false;
      passes++;

      const currentCrews = bestResult.crews.map(c => ({
        ...c,
        members: [...c.members],
      }));

      for (let i = 0; i < currentCrews.length; i++) {
        for (let j = i + 1; j < currentCrews.length; j++) {
          const crewA = currentCrews[i];
          const crewB = currentCrews[j];
          if (crewA.isLocked || crewB.isLocked) continue;

          for (let ma = 0; ma < crewA.members.length; ma++) {
            for (let mb = 0; mb < crewB.members.length; mb++) {
              if (crewA.members[ma].isPinned || crewB.members[mb].isPinned) continue;

              // Test swap
              const tempA = crewA.members[ma];
              const tempB = crewB.members[mb];
              crewA.members[ma] = { ...tempA, participantId: tempB.participantId };
              crewB.members[mb] = { ...tempB, participantId: tempA.participantId };

              // Recompute axis scores and fits
              crewA.axisScores = computeCrewAxisScores(crewA.members, participantsMap);
              crewB.axisScores = computeCrewAxisScores(crewB.members, participantsMap);

              const chA = challenges.find(c => c.id === crewA.assignedChallengeId);
              const chB = challenges.find(c => c.id === crewB.assignedChallengeId);

              const fitA = chA ? evaluateChallengeFit(crewA, chA, participantsMap) : 80;
              const fitB = chB ? evaluateChallengeFit(crewB, chB, participantsMap) : 80;

              crewA.fitScore = fitA;
              crewB.fitScore = fitB;

              const testAvgFit = getFleetAverageFit(currentCrews);
              if (testAvgFit > bestFit) {
                bestFit = testAvgFit;
                bestResult = {
                  ...bestResult,
                  crews: currentCrews,
                  balanceScore: calculateBalanceScore(currentCrews),
                };
                improved = true;
                break;
              } else {
                // Revert swap
                crewA.members[ma] = tempA;
                crewB.members[mb] = tempB;
                crewA.axisScores = computeCrewAxisScores(crewA.members, participantsMap);
                crewB.axisScores = computeCrewAxisScores(crewB.members, participantsMap);
              }
            }
            if (improved) break;
          }
          if (improved) break;
        }
      }
    }
  }

  // Update fleetName on crews if provided
  if (skillConfig.fleetName && skillConfig.fleetName.trim()) {
    const customPrefix = skillConfig.fleetName.trim();
    bestResult.crews = bestResult.crews.map((c, idx) => ({
      ...c,
      name: `${customPrefix} Division #${idx + 1}`,
    }));
  }

  return {
    ...bestResult,
    initialFitScore: initialFit,
    finalFitScore: bestFit,
    optimizationApplied,
    optimizedSeed: bestSeed,
  };
}

/**
 * Creates a single targeted Fleet Division using available candidates and prioritized skills.
 */
export function createSkillBasedDivision(
  divisionName: string,
  shipName: string,
  selectedSkills: (keyof SkillSet)[],
  size: number,
  availableParticipants: Participant[],
  challenges: Challenge[]
): Crew | null {
  if (!availableParticipants || availableParticipants.length === 0) return null;

  const participantsMap = new Map(availableParticipants.map(p => [p.id, p]));

  // Sort candidates by combined proficiency in selected skills
  const sortedCandidates = [...availableParticipants].sort((a, b) => {
    const scoreA = selectedSkills.reduce((sum, s) => sum + (a.skills[s] || 0), 0);
    const scoreB = selectedSkills.reduce((sum, s) => sum + (b.skills[s] || 0), 0);
    return scoreB - scoreA;
  });

  const chosenCandidates = sortedCandidates.slice(0, size);
  const members: CrewMember[] = chosenCandidates.map((p, idx) => ({
    participantId: p.id,
    assignedRole: idx === 0 ? (p.primaryRole || 'Tech Lead / Architect') : p.primaryRole,
    isPinned: false,
  }));

  const axisScores = computeCrewAxisScores(members, participantsMap);

  const newCrew: Crew = {
    id: `crew-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: divisionName || `Grand Fleet Division #${Date.now().toString().slice(-4)}`,
    shipName: shipName || 'Thousand Sunny Refit',
    jollyRogerSvgSeed: `jr-custom-${Date.now()}`,
    members,
    isLocked: false,
    axisScores,
    hasConqueror: members.some(m => {
      const p = participantsMap.get(m.participantId);
      if (!p) return false;
      const haki = deriveHaki(p.skills, p.primaryRole, p.secondaryRole);
      return haki.conqueror >= 80;
    }),
    warnings: [],
  };

  // Match best challenge
  if (challenges.length > 0) {
    let bestFit = -1;
    let bestChId = challenges[0].id;
    for (const ch of challenges) {
      const fit = evaluateChallengeFit(newCrew, ch, participantsMap);
      if (fit > bestFit) {
        bestFit = fit;
        bestChId = ch.id;
      }
    }
    newCrew.assignedChallengeId = bestChId;
    newCrew.fitScore = bestFit;
  }

  return newCrew;
}
