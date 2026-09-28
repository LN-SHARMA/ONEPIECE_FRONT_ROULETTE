import { describe, it, expect } from 'vitest';
import { 
  generateTeams, 
  deriveHaki, 
  calculateBalanceScore, 
  generateOptimizedGrandFleet, 
  createSkillBasedDivision 
} from '../services/teamEngine';
import { INITIAL_PARTICIPANTS, INITIAL_CHALLENGES } from '../data/seedData';
import { EventConfig, Participant, Challenge, Crew } from '../types';

describe('teamEngine balancing & invariants', () => {
  const baseConfig: EventConfig = {
    crewSize: 4,
    seed: 42,
    lockedCrewIds: [],
  };

  it('no duplicates', () => {
    const result = generateTeams(INITIAL_PARTICIPANTS, INITIAL_CHALLENGES, baseConfig);
    const assignedIds = new Set<string>();

    for (const crew of result.crews) {
      for (const member of crew.members) {
        expect(assignedIds.has(member.participantId)).toBe(false);
        assignedIds.add(member.participantId);
      }
    }

    for (const stowawayId of result.stowaways) {
      expect(assignedIds.has(stowawayId)).toBe(false);
      assignedIds.add(stowawayId);
    }

    // Total participants accounted for
    expect(assignedIds.size).toBe(INITIAL_PARTICIPANTS.length);
  });

  it('locks respected', () => {
    // 1. Initial run
    const initialRun = generateTeams(INITIAL_PARTICIPANTS, INITIAL_CHALLENGES, { ...baseConfig, seed: 100 });
    expect(initialRun.crews.length).toBeGreaterThan(0);

    // Lock crew 0 and pin member 0 of crew 1
    const lockedCrewId = initialRun.crews[0].id;
    const initialLockedCrewMembers = [...initialRun.crews[0].members];
    
    const pinnedCrewId = initialRun.crews[1].id;
    const pinnedMemberId = initialRun.crews[1].members[0].participantId;
    initialRun.crews[1].members[0].isPinned = true;

    const modifiedConfig: EventConfig = {
      ...baseConfig,
      seed: 99999, // completely different seed
      lockedCrewIds: [lockedCrewId],
    };

    const reRun = generateTeams(INITIAL_PARTICIPANTS, INITIAL_CHALLENGES, modifiedConfig, initialRun.crews);

    // Verify locked crew still has exact same members
    const reRunLockedCrew = reRun.crews.find(c => c.id === lockedCrewId);
    expect(reRunLockedCrew).toBeDefined();
    expect(reRunLockedCrew?.members.map(m => m.participantId)).toEqual(
      initialLockedCrewMembers.map(m => m.participantId)
    );

    // Verify pinned member is still in their crew or in crews
    const memberFoundInCrews = reRun.crews.some(c => c.members.some(m => m.participantId === pinnedMemberId));
    expect(memberFoundInCrews).toBe(true);
  });

  it('seed reproducibility', () => {
    const runA = generateTeams(INITIAL_PARTICIPANTS, INITIAL_CHALLENGES, { ...baseConfig, seed: 123456 });
    const runB = generateTeams(INITIAL_PARTICIPANTS, INITIAL_CHALLENGES, { ...baseConfig, seed: 123456 });

    expect(runA.balanceScore).toBe(runB.balanceScore);
    expect(runA.crews.length).toBe(runB.crews.length);

    for (let i = 0; i < runA.crews.length; i++) {
      const crewA = runA.crews[i];
      const crewB = runB.crews[i];
      expect(crewA.members.map(m => m.participantId)).toEqual(crewB.members.map(m => m.participantId));
      expect(crewA.assignedChallengeId).toEqual(crewB.assignedChallengeId);
    }
    expect(runA.stowaways).toEqual(runB.stowaways);
  });

  it('empty input', () => {
    const emptyResult = generateTeams([], [], baseConfig);
    expect(emptyResult.crews).toEqual([]);
    expect(emptyResult.stowaways).toEqual([]);
    expect(emptyResult.balanceScore).toBe(100);
    expect(emptyResult.conquerorWinnerId).toBeUndefined();
  });

  it('non-divisible counts', () => {
    // 24 participants, crewSize = 5 -> 4 crews of 5 = 20 members, 4 stowaways
    const configWithRemainder: EventConfig = {
      crewSize: 5,
      seed: 88,
      lockedCrewIds: [],
    };
    const result = generateTeams(INITIAL_PARTICIPANTS, INITIAL_CHALLENGES, configWithRemainder);
    expect(result.crews.length).toBe(4);
    result.crews.forEach(c => {
      expect(c.members.length).toBe(5);
    });
    expect(result.stowaways.length).toBe(4);
  });

  it('missing roles', () => {
    // Create subset without any doctor
    const noDoctorPirates = INITIAL_PARTICIPANTS.filter(p => p.primaryRole !== 'Doctor' && p.secondaryRole !== 'Doctor');
    const result = generateTeams(noDoctorPirates, INITIAL_CHALLENGES, { crewSize: 4, seed: 12, lockedCrewIds: [] });
    
    // Check for ROLE_GAP warnings
    const allWarnings = result.crews.flatMap(c => c.warnings);
    const doctorGap = allWarnings.some(w => w.type === 'ROLE_GAP' && w.role === 'Doctor');
    expect(doctorGap).toBe(true);
  });

  it('fewer pirates than crews', () => {
    const smallCohort = INITIAL_PARTICIPANTS.slice(0, 3);
    const configHighCrews: EventConfig = {
      crewSize: 4,
      crewCount: 5, // requesting 5 crews with only 3 pirates
      seed: 7,
      lockedCrewIds: [],
    };
    const result = generateTeams(smallCohort, INITIAL_CHALLENGES, configHighCrews);
    expect(result.crews.length).toBe(5);
    const totalMembers = result.crews.reduce((acc, c) => acc + c.members.length, 0);
    expect(totalMembers).toBe(3);
    expect(result.stowaways.length).toBe(0);
  });

  it('pure deriveHaki formula calculation', () => {
    const drake = INITIAL_PARTICIPANTS[0];
    const haki = deriveHaki(drake.skills, drake.primaryRole, drake.secondaryRole);
    expect(haki.observation).toBeGreaterThan(0);
    expect(haki.armament).toBeGreaterThan(0);
    expect(haki.conqueror).toBeGreaterThan(0);
    expect(haki.conqueror).toBeLessThanOrEqual(100);
  });

  it('generateOptimizedGrandFleet creates fleet with chosen skills and auto-optimizes fit', () => {
    const skillConfig = {
      fleetName: 'Custom Armada',
      selectedSkills: ['combat', 'engineering'] as const,
      targetFitThreshold: 85,
      autoOptimizeIfLowFit: true,
      crewSize: 4,
    };

    const result = generateOptimizedGrandFleet(
      INITIAL_PARTICIPANTS,
      INITIAL_CHALLENGES,
      skillConfig as any,
      baseConfig
    );

    expect(result.crews.length).toBeGreaterThan(0);
    expect(result.crews[0].name).toContain('Custom Armada');
    expect(result.finalFitScore).toBeGreaterThanOrEqual(result.initialFitScore);
    expect(result.stowaways.length).toBeDefined();

    // Verify all participants are unique
    const seen = new Set<string>();
    for (const c of result.crews) {
      for (const m of c.members) {
        expect(seen.has(m.participantId)).toBe(false);
        seen.add(m.participantId);
      }
    }
  });

  it('createSkillBasedDivision commissions division matching chosen skills', () => {
    const division = createSkillBasedDivision(
      'Special Cyber Recon',
      'Thousand Sunny Mirage',
      ['wits', 'engineering'],
      4,
      INITIAL_PARTICIPANTS,
      INITIAL_CHALLENGES
    );

    expect(division).toBeDefined();
    expect(division?.name).toBe('Special Cyber Recon');
    expect(division?.members.length).toBe(4);
    expect(division?.axisScores.wits).toBeGreaterThan(0);
    expect(division?.axisScores.engineering).toBeGreaterThan(0);
  });
});
