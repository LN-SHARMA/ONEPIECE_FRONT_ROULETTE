import { describe, it, expect, beforeEach } from 'vitest';
import { useFleetStore } from '../store/fleetStore';
import { INITIAL_PARTICIPANTS, INITIAL_CHALLENGES } from '../data/seedData';
import { generateTeams } from '../services/teamEngine';

describe('IslandBuildingModal & World Map Logic Integration', () => {
  beforeEach(() => {
    useFleetStore.setState({
      participants: [...INITIAL_PARTICIPANTS],
      challenges: [...INITIAL_CHALLENGES],
      crews: generateTeams(INITIAL_PARTICIPANTS, INITIAL_CHALLENGES, { crewSize: 4, seed: 42, lockedCrewIds: [] }).crews,
      eventConfig: { crewSize: 4, seed: 42, lockedCrewIds: [] },
      balanceScore: 85,
      viewMode: 'map',
      selectedIslandId: null,
    });
  });

  it('allows selecting an island and setting hash', () => {
    useFleetStore.getState().setSelectedIslandId('island-sunny-hq');
    expect(useFleetStore.getState().selectedIslandId).toBe('island-sunny-hq');
  });

  it('updates team size slider and triggers crew generation', async () => {
    useFleetStore.getState().updateConfig({ crewSize: 6 });
    expect(useFleetStore.getState().eventConfig.crewSize).toBe(6);

    await useFleetStore.getState().assembleFleet(false);
    expect(useFleetStore.getState().crews.length).toBe(4); // 24 / 6 = 4 crews
  });

  it('adds a new challenge to Foxy Arena and awards berries', async () => {
    const prevChallengesCount = useFleetStore.getState().challenges.length;
    const prevBerries = useFleetStore.getState().gameState.berries;

    await useFleetStore.getState().addChallenge({
      name: 'Maelstrom Speed Sprint',
      description: 'Race through stormy whirlpools.',
      category: 'Navigation',
      requiredRoles: ['Navigator', 'Shipwright'],
      requiredSkills: [{ skill: 'navigation', minLevel: 4, weight: 3 }],
    });

    expect(useFleetStore.getState().challenges.length).toBe(prevChallengesCount + 1);
    expect(useFleetStore.getState().gameState.berries).toBeGreaterThan(prevBerries);
  });

  it('enlists a new pirate with auto-calculated bounty and updates wall', async () => {
    const prevCount = useFleetStore.getState().participants.length;

    await useFleetStore.getState().addParticipant({
      name: 'Monkey D. Nova',
      epithet: 'The Dawn Sovereign',
      primaryRole: 'Captain',
      secondaryRole: 'Swordsman',
      skills: { combat: 5, navigation: 3, cooking: 2, medical: 2, engineering: 3, wits: 4 },
      interests: ['Sea King Hunting'],
      devilFruit: 'Mythical Zoan',
      jollyRogerStyle: { baseColor: '#000000', accentColor: '#f59e0b', hatType: 'straw', symbol: 'crossbones' },
    });

    expect(useFleetStore.getState().participants.length).toBe(prevCount + 1);
    const added = useFleetStore.getState().participants[0];
    expect(added.name).toBe('Monkey D. Nova');
    expect(added.bounty).toBeGreaterThan(100000000);
  });

  it('allows seamless toggling between map and voyage modes', () => {
    expect(useFleetStore.getState().viewMode).toBe('map');
    useFleetStore.getState().setViewMode('voyage');
    expect(useFleetStore.getState().viewMode).toBe('voyage');
    useFleetStore.getState().setViewMode('map');
    expect(useFleetStore.getState().viewMode).toBe('map');
  });
});
