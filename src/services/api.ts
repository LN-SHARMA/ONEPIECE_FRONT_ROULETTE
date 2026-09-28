import { Participant, Challenge, FleetState, GameState } from '../types';
import { INITIAL_PARTICIPANTS, INITIAL_CHALLENGES } from '../data/seedData';
import { generateTeams } from './teamEngine';

const STORAGE_KEYS = {
  PARTICIPANTS: 'grand_fleet_participants_v1',
  CHALLENGES: 'grand_fleet_challenges_v1',
  FLEET_STATE: 'grand_fleet_state_v1',
  GAME_STATE: 'grand_fleet_gamestate_v1',
};

// Safe memory storage fallback for non-browser/test environments
const memoryStore: Record<string, string> = {};
const getStorageItem = (key: string): string | null => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch (e) {}
  return memoryStore[key] || null;
};

const setStorageItem = (key: string, val: string): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, val);
      return;
    }
  } catch (e) {}
  memoryStore[key] = val;
};

const DEFAULT_GAME_STATE: GameState = {
  berries: 50000000,
  xp: 1250,
  fleetLevel: 4,
  achievements: [
    { id: 'first-nakama', title: 'First Nakama', description: 'Enlist your first pirate', icon: '🏴‍☠️', unlockedAt: new Date().toISOString() },
    { id: 'fleet-ready', title: 'Grand Fleet Assembled', description: 'Form crews with balance score > 85%', icon: '⚓', unlockedAt: new Date().toISOString() },
    { id: 'conqueror-surge', title: "Conqueror's Surge", description: "Identify a Conqueror's Haki wielder in the fleet", icon: '⚡', unlockedAt: new Date().toISOString() },
  ],
  unlockedIslands: ['island-sunny-hq', 'island-recruitment', 'island-foxy', 'island-haki-forge', 'island-harbor', 'island-laughtale'],
  mapCamera: { x: 1600, y: 1200, zoom: 0.9 },
};

/**
 * Storage API Layer - Abstraction for all persistent data operations
 * Can be swapped with REST / GraphQL / Firebase backend seamlessly.
 */
export const api = {
  async getParticipants(): Promise<Participant[]> {
    try {
      const data = getStorageItem(STORAGE_KEYS.PARTICIPANTS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to load participants', e);
    }
    return INITIAL_PARTICIPANTS;
  },

  async saveParticipants(participants: Participant[]): Promise<void> {
    setStorageItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(participants));
  },

  async addParticipant(participant: Participant): Promise<Participant[]> {
    const list = await this.getParticipants();
    const updated = [participant, ...list];
    await this.saveParticipants(updated);
    return updated;
  },

  async updateParticipant(participant: Participant): Promise<Participant[]> {
    const list = await this.getParticipants();
    const updated = list.map(p => p.id === participant.id ? participant : p);
    await this.saveParticipants(updated);
    return updated;
  },

  async deleteParticipant(id: string): Promise<Participant[]> {
    const list = await this.getParticipants();
    const updated = list.filter(p => p.id !== id);
    await this.saveParticipants(updated);
    return updated;
  },

  async getChallenges(): Promise<Challenge[]> {
    try {
      const data = getStorageItem(STORAGE_KEYS.CHALLENGES);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to load challenges', e);
    }
    return INITIAL_CHALLENGES;
  },

  async saveChallenges(challenges: Challenge[]): Promise<void> {
    setStorageItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(challenges));
  },

  async addChallenge(challenge: Challenge): Promise<Challenge[]> {
    const list = await this.getChallenges();
    const updated = [challenge, ...list];
    await this.saveChallenges(updated);
    return updated;
  },

  async deleteChallenge(id: string): Promise<Challenge[]> {
    const list = await this.getChallenges();
    const updated = list.filter(c => c.id !== id);
    await this.saveChallenges(updated);
    return updated;
  },

  async getFleetState(): Promise<FleetState | null> {
    try {
      const data = getStorageItem(STORAGE_KEYS.FLEET_STATE);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to load fleet state', e);
    }
    return null;
  },

  async saveFleetState(state: FleetState): Promise<void> {
    setStorageItem(STORAGE_KEYS.FLEET_STATE, JSON.stringify(state));
  },

  async getGameState(): Promise<GameState> {
    try {
      const data = getStorageItem(STORAGE_KEYS.GAME_STATE);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to load game state', e);
    }
    return DEFAULT_GAME_STATE;
  },

  async saveGameState(state: GameState): Promise<void> {
    setStorageItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(state));
  },

  async resetToDemo(): Promise<{ participants: Participant[]; challenges: Challenge[]; fleet: FleetState; game: GameState }> {
    localStorage.removeItem(STORAGE_KEYS.PARTICIPANTS);
    localStorage.removeItem(STORAGE_KEYS.CHALLENGES);
    localStorage.removeItem(STORAGE_KEYS.FLEET_STATE);
    localStorage.removeItem(STORAGE_KEYS.GAME_STATE);

    const initialFleetResult = generateTeams(INITIAL_PARTICIPANTS, INITIAL_CHALLENGES, {
      crewSize: 4,
      seed: 42,
      lockedCrewIds: [],
    });

    const fleetState: FleetState = {
      participants: INITIAL_PARTICIPANTS,
      challenges: INITIAL_CHALLENGES,
      crews: initialFleetResult.crews,
      stowaways: initialFleetResult.stowaways,
      eventConfig: {
        crewSize: 4,
        seed: 42,
        lockedCrewIds: [],
        conquerorWinnerId: initialFleetResult.conquerorWinnerId,
      },
      balanceScore: initialFleetResult.balanceScore,
    };

    await this.saveParticipants(INITIAL_PARTICIPANTS);
    await this.saveChallenges(INITIAL_CHALLENGES);
    await this.saveFleetState(fleetState);
    await this.saveGameState(DEFAULT_GAME_STATE);

    return {
      participants: INITIAL_PARTICIPANTS,
      challenges: INITIAL_CHALLENGES,
      fleet: fleetState,
      game: DEFAULT_GAME_STATE,
    };
  },
};
