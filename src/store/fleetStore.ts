import { create } from 'zustand';
import { 
  Participant, 
  Challenge, 
  Crew, 
  EventConfig, 
  FleetState, 
  GameState, 
  ViewMode, 
  PirateRole 
} from '../types';
import { api } from '../services/api';
import { generateTeams, deriveHaki } from '../services/teamEngine';
import { INITIAL_PARTICIPANTS, INITIAL_CHALLENGES } from '../data/seedData';

export interface DenDenToast {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'haki' | 'foxy' | 'warning';
}

interface FleetStore extends FleetState {
  gameState: GameState;
  viewMode: ViewMode;
  selectedIslandId: string | null;
  activeToast: DenDenToast | null;
  isGenerating: boolean;
  isLoading: boolean;
  hakiVfxTrigger: 'none' | 'conqueror' | 'observation' | 'armament';

  // Actions
  init: () => Promise<void>;
  setViewMode: (mode: ViewMode) => void;
  setSelectedIslandId: (id: string | null) => void;
  showToast: (toast: Omit<DenDenToast, 'id'>) => void;
  dismissToast: () => void;
  setHakiVfx: (vfx: 'none' | 'conqueror' | 'observation' | 'armament') => void;

  // Participant CRUD
  addParticipant: (p: Omit<Participant, 'id' | 'bounty'>) => Promise<void>;
  updateParticipant: (p: Participant) => Promise<void>;
  deleteParticipant: (id: string) => Promise<void>;

  // Challenge CRUD
  addChallenge: (c: Omit<Challenge, 'id'>) => Promise<void>;
  deleteChallenge: (id: string) => Promise<void>;

  // Event Config & Generation
  updateConfig: (patch: Partial<EventConfig>) => void;
  assembleFleet: (forceReshuffle?: boolean) => Promise<void>;
  toggleCrewLock: (crewId: string) => void;
  toggleMemberPin: (crewId: string, participantId: string) => void;
  swapMembers: (crewAId: string, memberAId: string, crewBId: string, memberBId: string) => void;
  assignChallengeToCrew: (crewId: string, challengeId: string) => void;
  resetAll: () => Promise<void>;

  // Game/Gamification actions
  addBerries: (amount: number) => void;
  unlockIsland: (islandId: string) => void;
  setMapCamera: (camera: { x: number; y: number; zoom: number }) => void;
}

export const useFleetStore = create<FleetStore>((set, get) => ({
  participants: INITIAL_PARTICIPANTS,
  challenges: INITIAL_CHALLENGES,
  crews: [],
  stowaways: [],
  eventConfig: {
    crewSize: 4,
    seed: 42,
    lockedCrewIds: [],
  },
  balanceScore: 0,
  gameState: {
    berries: 50000000,
    xp: 1250,
    fleetLevel: 4,
    achievements: [],
    unlockedIslands: ['island-sunny-hq', 'island-recruitment', 'island-foxy', 'island-haki-forge', 'island-harbor', 'island-laughtale'],
    mapCamera: { x: 1600, y: 1200, zoom: 0.9 },
  },
  viewMode: 'voyage',
  selectedIslandId: null,
  activeToast: null,
  isGenerating: false,
  isLoading: true,
  hakiVfxTrigger: 'none',

  init: async () => {
    try {
      const participants = await api.getParticipants();
      const challenges = await api.getChallenges();
      let fleetState = await api.getFleetState();
      const gameState = await api.getGameState();

      if (!fleetState || fleetState.crews.length === 0) {
        const generated = generateTeams(participants, challenges, {
          crewSize: 4,
          seed: 42,
          lockedCrewIds: [],
        });
        fleetState = {
          participants,
          challenges,
          crews: generated.crews,
          stowaways: generated.stowaways,
          eventConfig: {
            crewSize: 4,
            seed: 42,
            lockedCrewIds: [],
            conquerorWinnerId: generated.conquerorWinnerId,
          },
          balanceScore: generated.balanceScore,
        };
        await api.saveFleetState(fleetState);
      }

      set({
        participants,
        challenges,
        crews: fleetState.crews,
        stowaways: fleetState.stowaways,
        eventConfig: fleetState.eventConfig,
        balanceScore: fleetState.balanceScore,
        gameState,
        isLoading: false,
      });
    } catch (e) {
      console.error('Initialization error:', e);
      set({ isLoading: false });
    }
  },

  setViewMode: (mode) => set({ viewMode: mode }),
  setSelectedIslandId: (id) => set({ selectedIslandId: id }),

  showToast: (toast) => {
    const id = `toast-${Date.now()}`;
    set({ activeToast: { ...toast, id } });
    setTimeout(() => {
      if (get().activeToast?.id === id) {
        set({ activeToast: null });
      }
    }, 4500);
  },

  dismissToast: () => set({ activeToast: null }),
  setHakiVfx: (vfx) => set({ hakiVfxTrigger: vfx }),

  addParticipant: async (pData) => {
    // Bounty auto-calculation formula based on skill sum and devil fruit
    const skillSum = Object.values(pData.skills).reduce((a, b) => a + b, 0);
    const fruitMultiplier = pData.devilFruit === 'Mythical Zoan' ? 2.5 : pData.devilFruit === 'Logia' ? 2.0 : pData.devilFruit === 'Paramecia' ? 1.4 : pData.devilFruit === 'Zoan' ? 1.3 : 1.0;
    const bounty = Math.round((skillSum * 25000000 + 50000000) * fruitMultiplier);

    const newParticipant: Participant = {
      ...pData,
      id: `p-${Date.now()}`,
      bounty,
    };

    const updated = await api.addParticipant(newParticipant);
    set({ participants: updated });

    get().addBerries(1000000);
    get().showToast({
      title: 'New Bounty Issued!',
      message: `${newParticipant.name} enlisted with bounty ฿ ${bounty.toLocaleString()}!`,
      type: 'info',
    });
  },

  updateParticipant: async (participant) => {
    const updated = await api.updateParticipant(participant);
    set({ participants: updated });
    get().showToast({
      title: 'Wanted Poster Updated',
      message: `Updated records for ${participant.name}`,
      type: 'info',
    });
  },

  deleteParticipant: async (id) => {
    const updated = await api.deleteParticipant(id);
    set({ participants: updated });
    get().showToast({
      title: 'Pirate Departed',
      message: 'Participant removed from fleet archives',
      type: 'warning',
    });
  },

  addChallenge: async (cData) => {
    const newChallenge: Challenge = {
      ...cData,
      id: `c-${Date.now()}`,
    };
    const updated = await api.addChallenge(newChallenge);
    set({ challenges: updated });
    get().addBerries(2000000);
    get().showToast({
      title: 'Davy Back Trial Sanctioned!',
      message: `${newChallenge.name} added to Sea Trials Board!`,
      type: 'foxy',
    });
  },

  deleteChallenge: async (id) => {
    const updated = await api.deleteChallenge(id);
    set({ challenges: updated });
  },

  updateConfig: (patch) => {
    set((state) => {
      const newConfig = { ...state.eventConfig, ...patch };
      return { eventConfig: newConfig };
    });
  },

  assembleFleet: async (forceReshuffle = false) => {
    set({ isGenerating: true });
    
    // Trigger Haki visual effect
    const vfxType = forceReshuffle ? 'observation' : 'conqueror';
    set({ hakiVfxTrigger: vfxType });

    // Seed calculation
    const currentSeed = forceReshuffle ? Math.floor(Math.random() * 1000000) : get().eventConfig.seed;

    const newConfig: EventConfig = {
      ...get().eventConfig,
      seed: currentSeed,
      lockedCrewIds: get().crews.filter(c => c.isLocked).map(c => c.id),
    };

    return new Promise<void>((resolve) => {
      setTimeout(async () => {
        const result = generateTeams(
          get().participants, 
          get().challenges, 
          newConfig, 
          get().crews
        );

        const fleetState: FleetState = {
          participants: get().participants,
          challenges: get().challenges,
          crews: result.crews,
          stowaways: result.stowaways,
          eventConfig: {
            ...newConfig,
            conquerorWinnerId: result.conquerorWinnerId,
          },
          balanceScore: result.balanceScore,
        };

        await api.saveFleetState(fleetState);

        set({
          crews: result.crews,
          stowaways: result.stowaways,
          eventConfig: fleetState.eventConfig,
          balanceScore: result.balanceScore,
          isGenerating: false,
        });

        // Clear VFX trigger after animation
        setTimeout(() => set({ hakiVfxTrigger: 'none' }), 2000);

        get().addBerries(5000000);
        get().showToast({
          title: forceReshuffle ? 'Tides Reshuffled!' : 'Grand Fleet Assembled!',
          message: `Formed ${result.crews.length} crews with ${result.balanceScore}% Balance Score!`,
          type: 'haki',
        });

        resolve();
      }, 600);
    });
  },

  toggleCrewLock: (crewId) => {
    set((state) => {
      const crews = state.crews.map(c => c.id === crewId ? { ...c, isLocked: !c.isLocked } : c);
      const lockedCrewIds = crews.filter(c => c.isLocked).map(c => c.id);
      return {
        crews,
        eventConfig: { ...state.eventConfig, lockedCrewIds },
      };
    });
  },

  toggleMemberPin: (crewId, participantId) => {
    set((state) => {
      const crews = state.crews.map(c => {
        if (c.id !== crewId) return c;
        return {
          ...c,
          members: c.members.map(m => m.participantId === participantId ? { ...m, isPinned: !m.isPinned } : m),
        };
      });
      return { crews };
    });
  },

  swapMembers: (crewAId, memberAId, crewBId, memberBId) => {
    set((state) => {
      const crewA = state.crews.find(c => c.id === crewAId);
      const crewB = state.crews.find(c => c.id === crewBId);
      if (!crewA || !crewB) return state;

      const mA = crewA.members.find(m => m.participantId === memberAId);
      const mB = crewB.members.find(m => m.participantId === memberBId);
      if (!mA || !mB) return state;

      const updatedCrews = state.crews.map(c => {
        if (c.id === crewAId) {
          return {
            ...c,
            members: c.members.map(m => m.participantId === memberAId ? { ...m, participantId: memberBId } : m),
          };
        }
        if (c.id === crewBId) {
          return {
            ...c,
            members: c.members.map(m => m.participantId === memberBId ? { ...m, participantId: memberAId } : m),
          };
        }
        return c;
      });

      return { crews: updatedCrews };
    });
  },

  assignChallengeToCrew: (crewId, challengeId) => {
    set((state) => {
      const crews = state.crews.map(c => c.id === crewId ? { ...c, assignedChallengeId: challengeId } : c);
      return { crews };
    });
  },

  resetAll: async () => {
    const resetData = await api.resetToDemo();
    set({
      participants: resetData.participants,
      challenges: resetData.challenges,
      crews: resetData.fleet.crews,
      stowaways: resetData.fleet.stowaways,
      eventConfig: resetData.fleet.eventConfig,
      balanceScore: resetData.fleet.balanceScore,
      gameState: resetData.game,
    });
    get().showToast({
      title: 'Log Pose Reset!',
      message: 'Demo records restored to baseline coordinates.',
      type: 'info',
    });
  },

  addBerries: (amount) => {
    set((state) => {
      const newBerries = state.gameState.berries + amount;
      const newXp = state.gameState.xp + Math.floor(amount / 10000);
      const newLevel = Math.max(1, Math.floor(newXp / 1000));
      const updatedGame = {
        ...state.gameState,
        berries: newBerries,
        xp: newXp,
        fleetLevel: newLevel,
      };
      api.saveGameState(updatedGame);
      return { gameState: updatedGame };
    });
  },

  unlockIsland: (islandId) => {
    set((state) => {
      if (state.gameState.unlockedIslands.includes(islandId)) return state;
      const updatedIslands = [...state.gameState.unlockedIslands, islandId];
      const updatedGame = { ...state.gameState, unlockedIslands: updatedIslands };
      api.saveGameState(updatedGame);
      return { gameState: updatedGame };
    });
  },

  setMapCamera: (camera) => {
    set((state) => {
      const updatedGame = { ...state.gameState, mapCamera: camera };
      return { gameState: updatedGame };
    });
  },
}));
