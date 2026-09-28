import { create } from 'zustand';
import { 
  Participant, 
  Challenge, 
  Crew, 
  EventConfig, 
  GrandFleetSkillConfig,
  SkillSet,
  FleetState, 
  GameState, 
  ViewMode, 
  PirateRole 
} from '../types';
import { api } from '../services/api';
import { generateTeams, deriveHaki, generateOptimizedGrandFleet, createSkillBasedDivision } from '../services/teamEngine';
import { INITIAL_PARTICIPANTS, INITIAL_CHALLENGES } from '../data/seedData';
import { useAuthStore } from './authStore';

const ensureAuthenticated = (actionName: string): boolean => {
  const auth = useAuthStore.getState();
  if (!auth.isAuthenticated) {
    auth.requireAuth(actionName);
    return false;
  }
  return true;
};

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

  // Challenge CRUD & Management
  addChallenge: (c: Omit<Challenge, 'id'>) => Promise<void>;
  deleteChallenge: (id: string) => Promise<void>;
  toggleChallengeCompletion: (challengeId: string) => Promise<void>;
  assignChallengeToTeam: (challengeId: string, crewId: string) => Promise<void>;

  // Event Config & Generation
  updateConfig: (patch: Partial<EventConfig>) => void;
  assembleFleet: (forceReshuffle?: boolean) => Promise<void>;
  toggleCrewLock: (crewId: string) => void;
  toggleMemberPin: (crewId: string, participantId: string) => void;
  swapMembers: (crewAId: string, memberAId: string, crewBId: string, memberBId: string) => void;
  assignChallengeToCrew: (crewId: string, challengeId: string) => void;
  resetAll: () => Promise<void>;

  // Grand Fleet Skill-Based Creation & Auto-Optimization
  createGrandFleetWithSkills: (config: GrandFleetSkillConfig) => Promise<{ initialFit: number; finalFit: number; optimizationApplied: boolean }>;
  autoOptimizeGrandFleet: (targetThreshold?: number) => Promise<{ initialFit: number; finalFit: number; improvement: number }>;
  addCustomFleetDivision: (name: string, shipName: string, skills: (keyof SkillSet)[], size: number) => Promise<void>;

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
    if (!ensureAuthenticated('enlist new recruits into the fleet')) return;

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
    if (!ensureAuthenticated('update pirate records')) return;
    const updated = await api.updateParticipant(participant);
    set({ participants: updated });
    get().showToast({
      title: 'Wanted Poster Updated',
      message: `Updated records for ${participant.name}`,
      type: 'info',
    });
  },

  deleteParticipant: async (id) => {
    if (!ensureAuthenticated('discharge pirates from fleet')) return;
    const updated = await api.deleteParticipant(id);
    set({ participants: updated });
    get().showToast({
      title: 'Pirate Departed',
      message: 'Participant removed from fleet archives',
      type: 'warning',
    });
  },

  addChallenge: async (cData) => {
    if (!ensureAuthenticated('sanction new sea trials')) return;
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
    if (!ensureAuthenticated('delete sea trials')) return;
    const updated = await api.deleteChallenge(id);
    set({ challenges: updated });
  },

  updateConfig: (patch) => {
    if (!ensureAuthenticated('modify event configuration')) return;
    set((state) => {
      const newConfig = { ...state.eventConfig, ...patch };
      return { eventConfig: newConfig };
    });
  },

  assembleFleet: async (forceReshuffle = false) => {
    if (!ensureAuthenticated('assemble or reshuffle the fleet')) return;
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
    if (!ensureAuthenticated('lock or unlock fleet divisions')) return;
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
    if (!ensureAuthenticated('pin or unpin crew members')) return;
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
    if (!ensureAuthenticated('swap crew members between divisions')) return;
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

  toggleChallengeCompletion: async (challengeId: string) => {
    if (!ensureAuthenticated('update sea trial completion status')) return;
    const currentChallenges = get().challenges;
    const target = currentChallenges.find(c => c.id === challengeId);
    if (!target) return;

    const willBeCompleted = !target.isCompleted;
    const updatedChallenges = currentChallenges.map(c => 
      c.id === challengeId ? { ...c, isCompleted: willBeCompleted } : c
    );

    set({ challenges: updatedChallenges });
    await api.saveChallenges(updatedChallenges);

    if (willBeCompleted) {
      get().addBerries(3000000);
      get().setHakiVfx('conqueror');
      get().showToast({
        title: '🏆 Trial Conquered!',
        message: `${target.name} marked as COMPLETED! Earned ฿ 3,000,000!`,
        type: 'haki',
      });
    } else {
      get().showToast({
        title: 'Trial Reopened',
        message: `${target.name} status reset to in-progress.`,
        type: 'info',
      });
    }
  },

  assignChallengeToTeam: async (challengeId: string, crewId: string) => {
    if (!ensureAuthenticated('assign sea trials to teams')) return;
    const currentChallenges = get().challenges;
    const currentCrews = get().crews;
    const targetChallenge = currentChallenges.find(c => c.id === challengeId);
    const targetCrew = currentCrews.find(cr => cr.id === crewId);

    // Update crews: target crew gets assignedChallengeId, any other crew that had this challenge loses it
    const updatedCrews = currentCrews.map((c) => {
      if (crewId && c.id === crewId) {
        return { ...c, assignedChallengeId: challengeId };
      }
      if (c.assignedChallengeId === challengeId && c.id !== crewId) {
        return { ...c, assignedChallengeId: undefined };
      }
      return c;
    });

    // Update challenges: set assignedCrewId
    const updatedChallenges = currentChallenges.map((c) => {
      if (c.id === challengeId) {
        return { ...c, assignedCrewId: crewId || undefined };
      }
      if (crewId && c.assignedCrewId === crewId && c.id !== challengeId) {
        return { ...c, assignedCrewId: undefined };
      }
      return c;
    });

    set({ crews: updatedCrews, challenges: updatedChallenges });
    await api.saveChallenges(updatedChallenges);
    await api.saveFleetState({
      participants: get().participants,
      challenges: updatedChallenges,
      crews: updatedCrews,
      stowaways: get().stowaways,
      eventConfig: get().eventConfig,
      balanceScore: get().balanceScore,
    });

    if (targetCrew && targetChallenge) {
      get().showToast({
        title: 'Team Deployed to Challenge!',
        message: `${targetCrew.name} is now tasked with ${targetChallenge.name}!`,
        type: 'info',
      });
    } else if (!crewId && targetChallenge) {
      get().showToast({
        title: 'Challenge Unassigned',
        message: `${targetChallenge.name} is now open for assignments.`,
        type: 'info',
      });
    }
  },

  assignChallengeToCrew: (crewId, challengeId) => {
    get().assignChallengeToTeam(challengeId, crewId);
  },

  createGrandFleetWithSkills: async (skillConfig) => {
    if (!ensureAuthenticated('create custom Grand Fleet')) {
      return { initialFit: 0, finalFit: 0, optimizationApplied: false };
    }
    set({ isGenerating: true });
    return new Promise((resolve) => {
      setTimeout(async () => {
        const participants = get().participants;
        const challenges = get().challenges;
        const existingCrews = get().crews;
        const baseConfig = get().eventConfig;

        const result = generateOptimizedGrandFleet(
          participants,
          challenges,
          skillConfig,
          baseConfig,
          existingCrews
        );

        set({
          crews: result.crews,
          stowaways: result.stowaways,
          balanceScore: result.balanceScore,
          eventConfig: {
            ...baseConfig,
            crewSize: skillConfig.crewSize || baseConfig.crewSize,
            crewCount: skillConfig.crewCount || baseConfig.crewCount,
            seed: result.optimizedSeed,
            selectedSkills: skillConfig.selectedSkills,
            targetFitThreshold: skillConfig.targetFitThreshold,
          },
          isGenerating: false,
        });

        await api.saveFleetState({
          participants: get().participants,
          challenges: get().challenges,
          crews: result.crews,
          stowaways: result.stowaways,
          eventConfig: get().eventConfig,
          balanceScore: result.balanceScore,
        });

        get().addBerries(6000000);
        get().setHakiVfx('conqueror');

        if (result.optimizationApplied) {
          get().showToast({
            title: '⚡ Grand Fleet Auto-Optimized!',
            message: `Created Grand Fleet with ${result.finalFitScore}% Fit criteria (optimized from ${result.initialFitScore}%) based on selected skills!`,
            type: 'haki',
          });
        } else {
          get().showToast({
            title: '⚓ Grand Fleet Assembled!',
            message: `Formed ${result.crews.length} divisions with ${result.finalFitScore}% Fit score based on selected skills!`,
            type: 'haki',
          });
        }

        resolve({
          initialFit: result.initialFitScore,
          finalFit: result.finalFitScore,
          optimizationApplied: result.optimizationApplied,
        });
      }, 500);
    });
  },

  autoOptimizeGrandFleet: async (targetThreshold = 85) => {
    if (!ensureAuthenticated('auto-optimize Grand Fleet for trials')) {
      return { initialFit: 0, finalFit: 0, improvement: 0 };
    }
    set({ isGenerating: true });
    return new Promise((resolve) => {
      setTimeout(async () => {
        const participants = get().participants;
        const challenges = get().challenges;
        const existingCrews = get().crews;
        const baseConfig = get().eventConfig;

        const skillConfig: GrandFleetSkillConfig = {
          selectedSkills: baseConfig.selectedSkills || ['combat', 'navigation', 'engineering', 'wits', 'cooking', 'medical'],
          targetFitThreshold: targetThreshold,
          autoOptimizeIfLowFit: true,
          crewSize: baseConfig.crewSize,
          crewCount: baseConfig.crewCount,
        };

        const result = generateOptimizedGrandFleet(
          participants,
          challenges,
          skillConfig,
          baseConfig,
          existingCrews
        );

        const improvement = Math.max(0, result.finalFitScore - result.initialFitScore);

        set({
          crews: result.crews,
          stowaways: result.stowaways,
          balanceScore: result.balanceScore,
          eventConfig: {
            ...baseConfig,
            seed: result.optimizedSeed,
            targetFitThreshold: targetThreshold,
          },
          isGenerating: false,
        });

        await api.saveFleetState({
          participants: get().participants,
          challenges: get().challenges,
          crews: result.crews,
          stowaways: result.stowaways,
          eventConfig: get().eventConfig,
          balanceScore: result.balanceScore,
        });

        get().addBerries(5000000);
        get().setHakiVfx('conqueror');
        get().showToast({
          title: '🔥 Grand Fleet Auto-Created!',
          message: `Fleet fit upgraded to ${result.finalFitScore}% (+${improvement}% improvement) across all candidate divisions!`,
          type: 'haki',
        });

        resolve({
          initialFit: result.initialFitScore,
          finalFit: result.finalFitScore,
          improvement,
        });
      }, 500);
    });
  },

  addCustomFleetDivision: async (name, shipName, skills, size) => {
    if (!ensureAuthenticated('add custom division')) return;
    const participants = get().participants;
    const challenges = get().challenges;
    const crews = get().crews;
    const stowaways = get().stowaways;

    const candidatePool = stowaways.length >= size
      ? participants.filter(p => stowaways.includes(p.id))
      : participants.filter(p => !crews.some(c => c.isLocked && c.members.some(m => m.participantId === p.id)));

    const newCrew = createSkillBasedDivision(name, shipName, skills, size, candidatePool, challenges);
    if (!newCrew) {
      get().showToast({
        title: 'Insufficient Candidates',
        message: 'Not enough candidates available to form this new division.',
        type: 'warning',
      });
      return;
    }

    const assignedIds = new Set(newCrew.members.map(m => m.participantId));
    const updatedCrews = crews.map(c => ({
      ...c,
      members: c.members.filter(m => !assignedIds.has(m.participantId)),
    })).filter(c => c.members.length > 0);

    updatedCrews.push(newCrew);
    const updatedStowaways = stowaways.filter(id => !assignedIds.has(id));

    set({ crews: updatedCrews, stowaways: updatedStowaways });
    await api.saveFleetState({
      participants: get().participants,
      challenges: get().challenges,
      crews: updatedCrews,
      stowaways: updatedStowaways,
      eventConfig: get().eventConfig,
      balanceScore: get().balanceScore,
    });

    get().addBerries(4000000);
    get().showToast({
      title: 'New Fleet Division Commissioned!',
      message: `${newCrew.name} (${newCrew.shipName}) added with ${newCrew.fitScore || 85}% Fit score!`,
      type: 'info',
    });
  },

  resetAll: async () => {
    if (!ensureAuthenticated('reset demo data')) return;
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
