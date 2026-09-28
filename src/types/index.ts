export type PirateRole = 
  | 'Tech Lead / Architect'
  | 'Frontend Engineer'
  | 'Backend Systems Dev'
  | 'DevOps / Cloud Architect'
  | 'AI / ML Engineer'
  | 'Cybersecurity Analyst'
  | 'Full-Stack Developer'
  | 'QA & Test Engineer'
  | 'Data Engineer'
  | 'Captain' 
  | 'Navigator' 
  | 'Sniper' 
  | 'Chef' 
  | 'Doctor' 
  | 'Shipwright' 
  | 'Swordsman' 
  | 'Musician' 
  | 'Archaeologist';

export const CSE_ROLES: PirateRole[] = [
  'Tech Lead / Architect',
  'Backend Systems Dev',
  'Frontend Engineer',
  'DevOps / Cloud Architect',
  'AI / ML Engineer',
  'Cybersecurity Analyst',
  'Full-Stack Developer',
  'QA & Test Engineer',
  'Data Engineer',
];

export const ALL_ROLES: PirateRole[] = [
  ...CSE_ROLES,
  'Captain',
  'Navigator',
  'Sniper',
  'Chef',
  'Doctor',
  'Shipwright',
  'Swordsman',
  'Musician',
  'Archaeologist'
];

export type DevilFruitType = 'Paramecia' | 'Zoan' | 'Logia' | 'Mythical Zoan' | 'None';

export interface HakiStats {
  observation: number; // 0 - 100
  armament: number;    // 0 - 100
  conqueror: number;   // 0 - 100
}

export interface SkillSet {
  combat: number;      // 1 - 5 (Algorithms & DSA / Problem Solving)
  navigation: number;  // 1 - 5 (DevOps, Cloud & Infrastructure)
  cooking: number;     // 1 - 5 (Frontend Engineering, UI/UX & React)
  medical: number;     // 1 - 5 (Cybersecurity, Code Quality & Testing)
  engineering: number; // 1 - 5 (Backend Systems, Database & Scalability)
  wits: number;        // 1 - 5 (AI / Machine Learning & System Design)
}

export const CSE_SKILL_META: Record<keyof SkillSet, { label: string; icon: string; tag: string; description: string }> = {
  combat: { 
    label: 'Algorithms & Problem Solving (DSA)', 
    icon: '⚡', 
    tag: 'Algorithms',
    description: 'Dynamic programming, graph theory, algorithmic complexity, optimization' 
  },
  engineering: { 
    label: 'Backend & Distributed Systems', 
    icon: '⚙️', 
    tag: 'Backend',
    description: 'REST/gRPC APIs, SQL/NoSQL databases, concurrency, caching, microservices' 
  },
  cooking: { 
    label: 'Frontend & UI/UX Engineering', 
    icon: '🎨', 
    tag: 'Frontend',
    description: 'React, TypeScript, WebGL/CSS, state management, design systems' 
  },
  navigation: { 
    label: 'DevOps & Cloud Infrastructure', 
    icon: '☁️', 
    tag: 'Cloud/DevOps',
    description: 'Docker, Kubernetes, AWS/GCP, CI/CD pipelines, observability' 
  },
  medical: { 
    label: 'Cybersecurity & Code Quality', 
    icon: '🛡️', 
    tag: 'Security/QA',
    description: 'Penetration testing, encryption, vulnerability audits, automated unit/E2E testing' 
  },
  wits: { 
    label: 'AI / Machine Learning & System Design', 
    icon: '🧠', 
    tag: 'AI/ML & Architecture',
    description: 'Deep learning, LLM agents, data pipelines, high-level distributed architecture' 
  },
};

export interface JollyRogerStyle {
  baseColor: string;
  accentColor: string;
  hatType: 'straw' | 'tricorn' | 'bandana' | 'tophat' | 'crown';
  symbol: 'crossbones' | 'swords' | 'flames' | 'heart' | 'anchor';
}

export interface Participant {
  id: string;
  name: string;
  epithet: string;
  bounty: number; // in Berries ฿
  primaryRole: PirateRole;
  secondaryRole: PirateRole;
  skills: SkillSet;
  interests: string[];
  devilFruit: DevilFruitType;
  jollyRogerStyle: JollyRogerStyle;
}

export interface RequiredSkill {
  skill: keyof SkillSet;
  minLevel: number;
  weight: number;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  category: 
    | 'Distributed Systems'
    | 'Fullstack Web'
    | 'DevOps & Cloud'
    | 'AI & Machine Learning'
    | 'Cybersecurity & Auditing'
    | 'Algorithms & DSA'
    | 'Combat' 
    | 'Navigation' 
    | 'Culinary' 
    | 'Technical' 
    | 'Intellect' 
    | 'Special';
  requiredRoles: PirateRole[];
  requiredSkills: RequiredSkill[];
  isCompleted?: boolean;
  assignedCrewId?: string;
}

export interface StructuredWarning {
  type: 'ROLE_GAP' | 'LOW_SKILL' | 'NO_CAPTAIN' | 'HIGH_VARIANCE';
  crewId: string;
  role?: PirateRole;
  suggestion: string;
}

export interface CrewMember {
  participantId: string;
  assignedRole: PirateRole;
  isPinned: boolean;
}

export interface Crew {
  id: string;
  name: string;
  shipName: string;
  jollyRogerSvgSeed: string;
  members: CrewMember[];
  isLocked: boolean;
  assignedChallengeId?: string;
  fitScore?: number;
  axisScores: SkillSet;
  hasConqueror: boolean;
  warnings: StructuredWarning[];
}

export interface EventConfig {
  crewSize: number;           // default 4 (range 2-9)
  crewCount?: number;         // optional override
  seed: number;
  lockedCrewIds: string[];
  conquerorWinnerId?: string;
}

export interface FleetState {
  participants: Participant[];
  challenges: Challenge[];
  crews: Crew[];
  stowaways: string[];        // participant IDs not assigned
  eventConfig: EventConfig;
  balanceScore: number;       // 0 - 100
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt?: string;
  icon: string;
}

export interface GameState {
  berries: number;
  xp: number;
  fleetLevel: number;
  achievements: Achievement[];
  unlockedIslands: string[];
  mapCamera: { x: number; y: number; zoom: number };
}

export type ViewMode = 'voyage' | 'map';
