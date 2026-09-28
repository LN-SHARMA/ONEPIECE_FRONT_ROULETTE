import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore, DEMO_USERS } from '../store/authStore';

describe('authStore & Demo Users', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('provides all 5 pre-loaded demo users with pirate lore metadata', () => {
    expect(DEMO_USERS.length).toBe(5);
    const luffy = DEMO_USERS.find(u => u.name === 'Monkey D. Luffy');
    expect(luffy).toBeDefined();
    expect(luffy?.role).toBe('Fleet Admiral');
    expect(luffy?.bounty).toBe(3000000000);
    expect(luffy?.password).toBe('meat123');

    const zoro = DEMO_USERS.find(u => u.name === 'Roronoa Zoro');
    expect(zoro).toBeDefined();
    expect(zoro?.password).toBe('swords123');
  });

  it('logs in successfully with 1-click demo user', () => {
    const luffy = DEMO_USERS[0];
    useAuthStore.getState().loginWithDemo(luffy);

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.name).toBe('Monkey D. Luffy');
    expect(state.user?.role).toBe('Fleet Admiral');
  });

  it('authenticates with valid credentials and rejects invalid ones', async () => {
    const failRes = await useAuthStore.getState().loginWithCredentials('bad@email.com', '12');
    expect(failRes.success).toBe(false);

    const successDemo = await useAuthStore.getState().loginWithCredentials('zoro@strawhat.fleet', 'swords123');
    expect(successDemo.success).toBe(true);
    expect(useAuthStore.getState().user?.name).toBe('Roronoa Zoro');
  });

  it('supports custom pirate credentials creation', async () => {
    const custom = await useAuthStore.getState().loginWithCredentials('ace@spade.fleet', 'fire1234');
    expect(custom.success).toBe(true);
    expect(useAuthStore.getState().user?.name).toBe('Ace');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('logs out cleanly and resets session', () => {
    useAuthStore.getState().loginWithDemo(DEMO_USERS[0]);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    useAuthStore.getState().logout();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('enforces read-only mode when logged out and allows actions after login', async () => {
    const { useFleetStore } = await import('../store/fleetStore');
    
    // Ensure logged out
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);

    // requireAuth returns false and sets readOnlyNotice & opens modal
    const allowedBefore = useAuthStore.getState().requireAuth('enlist pirates');
    expect(allowedBefore).toBe(false);
    expect(useAuthStore.getState().isLoginModalOpen).toBe(true);
    expect(useAuthStore.getState().readOnlyNotice).toContain('enlist pirates');

    // Attempting store mutation while unauthenticated is blocked
    const prevCrewSize = useFleetStore.getState().eventConfig.crewSize;
    useFleetStore.getState().updateConfig({ crewSize: 9 });
    // crewSize remains unchanged because user is unauthenticated
    expect(useFleetStore.getState().eventConfig.crewSize).toBe(prevCrewSize);

    // Now log in with demo account
    useAuthStore.getState().loginWithDemo(DEMO_USERS[0]);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().isLoginModalOpen).toBe(false);

    // requireAuth now returns true
    const allowedAfter = useAuthStore.getState().requireAuth('enlist pirates');
    expect(allowedAfter).toBe(true);

    // Mutation now succeeds
    useFleetStore.getState().updateConfig({ crewSize: 6 });
    expect(useFleetStore.getState().eventConfig.crewSize).toBe(6);
  });
});
