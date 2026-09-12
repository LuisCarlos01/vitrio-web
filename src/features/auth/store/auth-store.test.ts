import { describe, expect, it } from 'vitest';
import { useAuthStore } from './auth-store';

describe('useAuthStore', () => {
  it('stores the session and reports authenticated after setSession', () => {
    useAuthStore
      .getState()
      .setSession({ accessToken: 'access-123', refreshToken: 'refresh-456' });

    const state = useAuthStore.getState();

    expect(state.accessToken).toBe('access-123');
    expect(state.refreshToken).toBe('refresh-456');
    expect(state.isAuthenticated).toBe(true);
  });

  it('forgets the session and reports unauthenticated after clearSession', () => {
    useAuthStore
      .getState()
      .setSession({ accessToken: 'access-123', refreshToken: 'refresh-456' });

    useAuthStore.getState().clearSession();

    const state = useAuthStore.getState();

    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});
