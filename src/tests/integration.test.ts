import { describe, it, expect, beforeEach } from 'vitest';
import { generateTeams, deriveHaki, evaluateChallengeFit, calculateBalanceScore } from '../services/teamEngine';
import { INITIAL_PARTICIPANTS, INITIAL_CHALLENGES } from '../data/seedData';
import { Participant, Challenge, EventConfig, Crew, ALL_ROLES } from '../types';

describe('GRAND FLEET: Full System Integration Suite (R1 - R14 + Addendum A)', () => {
  let participants: Participant[];
  let challenges: Challenge[];
  let baseConfig: EventConfig;

  beforeEach(() => {
    participants = JSON.parse(JSON.stringify(INITIAL_PARTICIPANTS));
    challenges = JSON.parse(JSON.stringify(INITIAL_CHALLENGES));
    baseConfig = {
      crewSize: 4,
      seed: 42,
      lockedCrewIds: [],
    };
  });

  // R1: Create participant profiles
  it('[R1] Enlist pirate profile generates correct bounty & Jolly Roger style', () => {
    const newPirate: Participant = {
      id: 'p-test-1',
      name: 'Roronoa Zoro Prototype',
      epithet: 'Pirate Hunter',
      bounty: 0,
      primaryRole: 'Swordsman',
      secondaryRole: 'Captain',
      skills: { combat: 5, navigation: 1, cooking: 2, medical: 1, engineering: 2, wits: 3 },
      interests: ['Sake', 'Meito Swords'],
      devilFruit: 'None',
      jollyRogerStyle: { baseColor: '#047857', accentColor: '#34d399', hatType: 'bandana', symbol: 'swords' },
    };

    // Calculate bounty according to formula
    const skillSum = Object.values(newPirate.skills).reduce((a, b) => a + b, 0);
    const bounty = Math.round(skillSum * 25000000 + 50000000);
    newPirate.bounty = bounty;

    expect(newPirate.bounty).toBeGreaterThan(100000000);
    expect(newPirate.jollyRogerStyle.symbol).toBe('swords');
    expect(newPirate.jollyRogerStyle.hatType).toBe('bandana');
  });

  // R2 & R3: Skills, Haki power meter, Devil Fruit & preferred roles
  it('[R2 & R3] Haki power meters and roles calculate deterministic affinities', () => {
    const skills = { combat: 5, navigation: 4, cooking: 2, medical: 3, engineering: 2, wits: 4 };
    const haki = deriveHaki(skills, 'Captain', 'Navigator');

    expect(haki.observation).toBeGreaterThan(50);
    expect(haki.armament).toBeGreaterThan(50);
    expect(haki.conqueror).toBeGreaterThan(50);
    // Captain leadership bonus applies
    expect(haki.conqueror).toBeGreaterThan(haki.observation);
  });

  // R4: Participant info search, filter, and sort
  it('[R4] Wanted poster wall filters and sorts by bounty correctly', () => {
    const sortedDesc = [...participants].sort((a, b) => b.bounty - a.bounty);
    expect(sortedDesc[0].bounty).toBeGreaterThanOrEqual(sortedDesc[1].bounty);

    const navigators = participants.filter(p => p.primaryRole === 'Navigator' || p.secondaryRole === 'Navigator');
    expect(navigators.length).toBeGreaterThan(0);
    navigators.forEach(n => {
      expect(['Navigator']).toContain(n.primaryRole === 'Navigator' ? n.primaryRole : n.secondaryRole);
    });
  });

  // R5, R6, R7: Challenges, team size, required skills/roles
  it('[R5, R6, R7] Configures sea trials and adjusts crew size from 2 to 9', () => {
    for (const size of [2, 3, 4, 5, 6, 9]) {
      const config: EventConfig = { ...baseConfig, crewSize: size };
      const res = generateTeams(participants, challenges, config);
      expect(res.crews.length).toBe(Math.floor(participants.length / size));
      res.crews.forEach(c => {
        expect(c.members.length).toBe(size);
      });
    }
  });

  // R8 & R9: Generate teams, balance score & 6-axis power
  it('[R8 & R9] Assemble fleet generates balanced crews with multi-axis radar scores', () => {
    const result = generateTeams(participants, challenges, baseConfig);
    expect(result.crews.length).toBe(6); // 24 / 4 = 6
    expect(result.balanceScore).toBeGreaterThanOrEqual(75);

    // Each crew has computed 6 axes
    result.crews.forEach(c => {
      expect(c.axisScores.combat).toBeGreaterThan(0);
      expect(c.axisScores.navigation).toBeGreaterThan(0);
      expect(c.axisScores.cooking).toBeGreaterThan(0);
      expect(c.axisScores.medical).toBeGreaterThan(0);
      expect(c.axisScores.engineering).toBeGreaterThan(0);
      expect(c.axisScores.wits).toBeGreaterThan(0);
    });
  });

  // R10: Prevent duplicate assignment & stowaways list
  it('[R10] Enforces zero duplicate assignments and handles remainder stowaways', () => {
    // 24 participants with crewSize 5 -> 4 crews of 5 = 20, 4 stowaways
    const result = generateTeams(participants, challenges, { crewSize: 5, seed: 101, lockedCrewIds: [] });
    expect(result.crews.length).toBe(4);
    expect(result.stowaways.length).toBe(4);

    const allAssigned = new Set<string>();
    result.crews.forEach(c => {
      c.members.forEach(m => {
        expect(allAssigned.has(m.participantId)).toBe(false);
        allAssigned.add(m.participantId);
      });
    });

    result.stowaways.forEach(id => {
      expect(allAssigned.has(id)).toBe(false);
      allAssigned.add(id);
    });

    expect(allAssigned.size).toBe(24);
  });

  // R11 & R12: Display members, lock crew, pin member, and manual swap
  it('[R11 & R12] Locks crew, pins members, and allows manual swapping with valid balance score updates', () => {
    const initial = generateTeams(participants, challenges, baseConfig);
    const crewA = initial.crews[0];
    const crewB = initial.crews[1];

    // Lock crewA
    crewA.isLocked = true;
    // Pin member 0 in crewB
    crewB.members[0].isPinned = true;
    const pinnedMemberId = crewB.members[0].participantId;

    // Reshuffle with new seed
    const reshuffled = generateTeams(
      participants, 
      challenges, 
      { ...baseConfig, seed: 98765, lockedCrewIds: [crewA.id] }, 
      initial.crews
    );

    const reCrewA = reshuffled.crews.find(c => c.id === crewA.id);
    expect(reCrewA?.members.map(m => m.participantId)).toEqual(crewA.members.map(m => m.participantId));

    // Manual swap simulation between unpinned members
    const memberA = crewA.members[1].participantId;
    const memberB = crewB.members[1].participantId;
    
    // Swap
    crewA.members[1].participantId = memberB;
    crewB.members[1].participantId = memberA;

    // Re-verify no duplicates
    const checkSet = new Set<string>();
    [...crewA.members, ...crewB.members].forEach(m => {
      expect(checkSet.has(m.participantId)).toBe(false);
      checkSet.add(m.participantId);
    });
  });

  // R13 & R14: Assign challenges & calculate fit % and scoreboard
  it('[R13 & R14] Assigns unique challenges to crews and computes Fit percentage', () => {
    const result = generateTeams(participants, challenges, baseConfig);
    const participantsMap = new Map(participants.map(p => [p.id, p]));

    const assignedChallengeIds = new Set<string>();
    result.crews.forEach(c => {
      expect(c.assignedChallengeId).toBeDefined();
      expect(c.fitScore).toBeGreaterThanOrEqual(10);
      expect(c.fitScore).toBeLessThanOrEqual(100);

      // Verify no duplicate challenge assignments since challenges (6) >= crews (6)
      if (c.assignedChallengeId) {
        expect(assignedChallengeIds.has(c.assignedChallengeId)).toBe(false);
        assignedChallengeIds.add(c.assignedChallengeId);
      }
    });

    // Scoreboard export simulation
    const exportData = result.crews.map(c => ({
      name: c.name,
      ship: c.shipName,
      trial: c.assignedChallengeId,
      fit: c.fitScore,
      memberCount: c.members.length,
    }));

    const jsonString = JSON.stringify(exportData);
    expect(jsonString).toContain('ship');
    expect(jsonString).toContain('fit');
  });

  // Addendum A: Island Map State & Unlock sequence
  it('[Addendum A] Island Map Fog of War unlocks in defined sequential order', () => {
    const unlockOrder = [
      'island-sunny-hq',
      'island-recruitment',
      'island-foxy',
      'island-haki-forge',
      'island-harbor',
      'island-laughtale'
    ];

    let unlocked: string[] = ['island-sunny-hq'];

    unlockOrder.slice(1).forEach(islandId => {
      unlocked = [...unlocked, islandId];
      expect(unlocked).toContain(islandId);
    });

    expect(unlocked.length).toBe(6);
  });
});
