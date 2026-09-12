import { describe, expect, it } from 'vitest';
import { useAuthStore } from './auth-store';

const STORAGE_KEY = 'vitrio-auth';

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

  it('persists the session to localStorage so it survives a reload', () => {
    useAuthStore
      .getState()
      .setSession({ accessToken: 'access-123', refreshToken: 'refresh-456' });

    const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');

    expect(persisted?.state?.accessToken).toBe('access-123');
    expect(persisted?.state?.refreshToken).toBe('refresh-456');
  });
});
