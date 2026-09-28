import { create } from 'zustand';
import { User } from '../types';

export interface DemoUser extends User {
  password: string;
  description: string;
  avatarColor: string;
}

export const DEMO_USERS: DemoUser[] = [
  {
    id: 'user-luffy',
    name: 'Monkey D. Luffy',
    email: 'luffy@strawhat.fleet',
    password: 'meat123',
    role: 'Fleet Admiral',
    title: 'Fifth Emperor of the Sea',
    bounty: 3000000000,
    avatar: 'crown',
    avatarColor: '#f59e0b',
    hakiType: 'Conqueror',
    fleetDivision: 'Straw Hat Vanguard',
    description: 'Supreme Fleet Commander & Emperor. Unlocks supreme Conqueror authority.',
  },
  {
    id: 'user-zoro',
    name: 'Roronoa Zoro',
    email: 'zoro@strawhat.fleet',
    password: 'swords123',
    role: 'First Mate',
    title: 'King of Hell',
    bounty: 1111000000,
    avatar: 'bandana',
    avatarColor: '#10b981',
    hakiType: 'Conqueror',
    fleetDivision: 'Iron Anchor Battalion',
    description: 'Lead Swordsman & Enforcer. Algorithmic combat & blade mastery.',
  },
  {
    id: 'user-nami',
    name: 'Nami',
    email: 'nami@strawhat.fleet',
    password: 'berries123',
    role: 'Chief Navigator',
    title: 'Cat Burglar',
    bounty: 366000000,
    avatar: 'straw',
    avatarColor: '#f97316',
    hakiType: 'Observation',
    fleetDivision: 'Golden Lion Navigators',
    description: 'Grand Line Weather Wizard & Chief Treasurer. Cloud architecture specialist.',
  },
  {
    id: 'user-law',
    name: 'Trafalgar D. Water Law',
    email: 'law@heart.fleet',
    password: 'room123',
    role: 'Surgeon General',
    title: 'Surgeon of Death',
    bounty: 3000000000,
    avatar: 'tricorn',
    avatarColor: '#eab308',
    hakiType: 'Armament',
    fleetDivision: 'Polar Tang Refit',
    description: 'Heart Pirates Captain. Distributed systems & deep architectural refactoring.',
  },
  {
    id: 'user-vegapunk',
    name: 'Dr. Vegapunk',
    email: 'vegapunk@egghead.dev',
    password: 'punk123',
    role: 'Grand Architect',
    title: 'Genius of Egghead',
    bounty: 500000000,
    avatar: 'tophat',
    avatarColor: '#8b5cf6',
    hakiType: 'Observation',
    fleetDivision: 'Egghead Cyber Fleet',
    description: 'Distributed Systems & AI Swarm Architect. 500 years ahead in tech.',
  },
];

const AUTH_STORAGE_KEY = 'grand_fleet_auth_user_v1';

const getInitialUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load user session', e);
  }
  return null;
};

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoginModalOpen: boolean;
  readOnlyNotice: string | null;
  
  // Actions
  openLoginModal: (notice?: string) => void;
  closeLoginModal: () => void;
  requireAuth: (actionName?: string) => boolean;
  loginWithDemo: (demoUser: DemoUser) => void;
  loginWithCredentials: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: getInitialUser(),
  isAuthenticated: getInitialUser() !== null,
  isLoginModalOpen: false,
  readOnlyNotice: null,

  openLoginModal: (notice?: string) => set({ isLoginModalOpen: true, readOnlyNotice: notice || null }),
  closeLoginModal: () => set({ isLoginModalOpen: false, readOnlyNotice: null }),

  requireAuth: (actionName = 'modify fleet data') => {
    const isAuth = get().isAuthenticated;
    if (!isAuth) {
      set({ 
        isLoginModalOpen: true, 
        readOnlyNotice: `Sign in required to ${actionName}. Choose a 1-click Demo Account below!` 
      });
      return false;
    }
    return true;
  },

  loginWithDemo: (demoUser: DemoUser) => {
    const user: User = {
      id: demoUser.id,
      name: demoUser.name,
      email: demoUser.email,
      role: demoUser.role,
      title: demoUser.title,
      bounty: demoUser.bounty,
      avatar: demoUser.avatar,
      hakiType: demoUser.hakiType,
      fleetDivision: demoUser.fleetDivision,
    };
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    }
    set({ user, isAuthenticated: true, isLoginModalOpen: false, readOnlyNotice: null });
  },

  loginWithCredentials: async (email: string, pass: string) => {
    // Check if matches any demo user
    const matched = DEMO_USERS.find(
      u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === pass
    );

    if (matched) {
      const user: User = {
        id: matched.id,
        name: matched.name,
        email: matched.email,
        role: matched.role,
        title: matched.title,
        bounty: matched.bounty,
        avatar: matched.avatar,
        hakiType: matched.hakiType,
        fleetDivision: matched.fleetDivision,
      };
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      }
      set({ user, isAuthenticated: true, isLoginModalOpen: false, readOnlyNotice: null });
      return { success: true, message: `Welcome back, ${matched.name}!` };
    }

    // If custom credentials entered with at least 3 chars
    if (email.includes('@') && pass.length >= 4) {
      const displayName = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const customUser: User = {
        id: `user-${Date.now()}`,
        name: displayName,
        email: email.trim(),
        role: 'Pirate Captain',
        title: 'New World Navigator',
        bounty: 500000000,
        avatar: 'straw',
        hakiType: 'Armament',
        fleetDivision: 'Custom Fleet Wing',
      };
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(customUser));
      }
      set({ user: customUser, isAuthenticated: true, isLoginModalOpen: false, readOnlyNotice: null });
      return { success: true, message: `Pirate Pass Registered for ${displayName}!` };
    }

    return { 
      success: false, 
      message: 'Invalid credentials. Password must be at least 4 characters or choose a 1-click Demo Account below.' 
    };
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    set({ user: null, isAuthenticated: false });
  },
}));
