# 🏴‍☠️ GRAND FLEET: Davy Back Fight Roster Generator

> **A cinematic, scroll-driven One Piece-themed fleet roster generator & interactive Clash-of-Clans style Grand Line island map.**
> Foxy has challenged the Grand Fleet to a Davy Back Fight! Balance combat power, navigation wits, culinary mastery, medical expertise, engineering, and lore scholarship so no crew is left lopsided.

---

## ⚡ Quick Start

### 1. Requirements
- Node.js `v18+` or `v20+` or `v24+`
- npm `v9+` or `v11+`

### 2. Installation & Running
```bash
# Install dependencies
npm install

# Start local dev server (port 3000)
npm run dev

# Run full Vitest unit & integration test suites
npm test

# Build for production
npm run build
```
Open [http://127.0.0.1:3000](http://127.0.0.1:3000) in your browser.

---

## 🗺 Dual-Mode Architecture

The application provides two synchronized modes sharing identical Zustand state and pure localStorage persistence:

1. **⚓ Scroll Voyage (Cinematic Long-Scroll)**:
   - Driven by **Lenis** smooth scrolling synchronized with **GSAP ScrollTrigger** via `gsap.ticker`.
   - 6 content-height bounded scenes with interpolated radial gradient transitions:
     - **Scene 1 (East Blue Dawn)**: Hero title reveal, bobbing Thousand Sunny silhouette, and Organizer Dashboard.
     - **Scene 2 (Grand Line Storm)**: Canvas rain particles & lightning flashes. Hosts "Enlist a Pirate" form (R1–R3).
     - **Scene 3 (Sabaody Bubbles)**: Luminous floating bubble particles. Hosts Wanted Poster Wall (R4).
     - **Scene 4 (Foxy's Arena)**: Coliseum spotlights & fox banners. Hosts Sea Trials Board & Crew Size config (R5–R7).
     - **Scene 5 (Haki Clash)**: Conqueror's red lightning & Observation ripples. Hosts Fleet Assembly, Radar charts, Crew cards, and Drag-and-drop swapping (R8–R12).
     - **Scene 6 (Laugh Tale Gold)**: Golden godrays & treasure motes. Hosts Tournament Scoreboard, fit % gauges, and multi-format exports (R13–R14).
2. **🗺 Grand Line Island Map (Clash-of-Clans Style Overworld)**:
   - Pannable (with inertia), zoomable (`0.45x` to `1.8x`), and interactive 3200x2400 ocean map canvas.
   - 6 Thematic Island Nodes with live status badges, live warning notification bubbles, and fog of war unlock sequence.
   - Live fleet ships docked at the Harbor of Crews that sail to Foxy's Arena along navigation paths when challenges are assigned.
   - Day/Night lighting cycle (Dawn, Noon, Sunset, Night).
   - Minimap radar with draggable viewport and click-to-jump camera.
   - Camera fly-to animation via GSAP (`power3.inOut`, 1.1s) and URL hash deep linking (`#/map/island-recruitment`, etc.).
   - *Resource Optimization*: Mutual exclusive canvas rendering—only one mode's canvas is active at any time.

---

## ⚖️ Team Engine Algorithm (`src/services/teamEngine.ts`)

The team engine is a pure, deterministic, unit-tested function:

### 1. Derived Haki Formulas
- **Observation Haki (Kenbunshoku)**:
  $$\text{Obs} = \min\left(100, \text{round}\left((\text{nav} \cdot 0.4 + \text{wits} \cdot 0.4 + \text{med} \cdot 0.2) \cdot 20\right)\right)$$
- **Armament Haki (Busoshoku)**:
  $$\text{Arm} = \min\left(100, \text{round}\left((\text{combat} \cdot 0.5 + \text{eng} \cdot 0.3 + \text{cook} \cdot 0.2) \cdot 20\right)\right)$$
- **Conqueror's Haki (Haoshoku)**:
  $$\text{Conq} = \min\left(100, \text{round}\left((\text{combat} \cdot 0.35 + \text{wits} \cdot 0.35) \cdot 20 + \text{LeadershipBonus}\right)\right)$$
  *(+15 bonus if Primary Role is Captain, +5 if Secondary)*

### 2. Multi-Axis Variance Minimization
- Evaluates total crew power across 6 distinct axes: `combat`, `navigation`, `cooking`, `medical`, `engineering`, `wits`.
- Minimizes the coefficient of variation ($CV = \frac{\sigma}{\mu}$) using hill-climbing iterations with seeded restarts (`Mulberry32` PRNG).
- Formulates the global **Balance Score**:
  $$\text{Balance Score} = \max\left(0, \min\left(100, \text{round}\left(100 \cdot (1 - \text{AvgImbalance} \cdot 0.8)\right)\right)\right)$$

### 3. Constraints & Invariants
- **Zero Duplicate Invariant**: A participant appears in exactly one crew or the unassigned stowaways pool.
- **Lock & Pin Respect**: Locked crews and pinned members are completely preserved across reshuffles.
- **Role Assignment**: Greedy / Hungarian matching fills Captains first, followed by essential archetypes (Navigator, Doctor, Shipwright).

---

## 🔌 Swap-to-Backend Guide (`src/services/api.ts`)

All persistent data operations are abstracted inside `src/services/api.ts`. Currently, it uses `localStorage`. To plug in a real backend (e.g. Express, NestJS, FastAPI, Supabase, Firebase):

1. Open `src/services/api.ts`.
2. Replace the internal localStorage calls with HTTP fetch / Axios / SDK requests:
```typescript
// Example: Swapping getParticipants to REST
async getParticipants(): Promise<Participant[]> {
  const response = await fetch('/api/v1/participants');
  return response.json();
},

// Example: Swapping addParticipant to REST
async addParticipant(participant: Participant): Promise<Participant[]> {
  const response = await fetch('/api/v1/participants', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(participant),
  });
  return response.json();
}
```
3. None of your components or stores need to change! The entire app communicates purely through the `api` service contract.

---

## 🏴‍☠️ Easter Eggs & Lore
- **Konami Code (`↑ ↑ ↓ ↓ ← → ← → b a`)**: Activates Gear 5th Drums of Liberation, triggering celebratory confetti, a Conqueror's Haki screen shockwave, and a ฿ 100,000,000 bounty grant.
- **Den Den Mushi Snail**: Animated transponder snail sound & visual notification toasts for bounties, challenges, and fleet assemblies.
- **Sea-Stone Weakness**: Devil Fruit eaters gain massive bounty multipliers but display sea-stone warnings requiring non-fruit hammer nakama in their crew.
