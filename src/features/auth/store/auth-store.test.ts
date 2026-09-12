import { beforeEach, describe, expect, it } from 'vitest';
import { queryClient } from '@/lib/query-client';
import { useAuthStore } from './auth-store';

const STORAGE_KEY = 'vitrio-auth';

function readCookie(name: string): string | undefined {
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1];
}

function clearAllCookies() {
  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=')[0].trim();
    if (name) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    }
  });
}

describe('useAuthStore', () => {
  beforeEach(() => {
    clearAllCookies();
  });

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

  it('sets a lightweight non-httpOnly cookie on setSession so edge middleware can check it', () => {
    useAuthStore
      .getState()
      .setSession({ accessToken: 'access-123', refreshToken: 'refresh-456' });

    expect(readCookie('has-session')).toBe('1');
  });

  it('removes the signal cookie on clearSession', () => {
    useAuthStore
      .getState()
      .setSession({ accessToken: 'access-123', refreshToken: 'refresh-456' });

    useAuthStore.getState().clearSession();

    expect(readCookie('has-session')).toBeUndefined();
  });

  it('clears the shared query cache on setSession so a new account never sees stale data', () => {
    queryClient.setQueryData(['catalog'], { id: 'previous-account-catalog' });

    useAuthStore
      .getState()
      .setSession({ accessToken: 'access-123', refreshToken: 'refresh-456' });

    expect(queryClient.getQueryData(['catalog'])).toBeUndefined();
  });

  it('clears the shared query cache on clearSession so logging out wipes cached data', () => {
    queryClient.setQueryData(['catalog'], { id: 'some-catalog' });

    useAuthStore.getState().clearSession();

    expect(queryClient.getQueryData(['catalog'])).toBeUndefined();
  });
});
