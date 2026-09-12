import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { queryClient } from '@/lib/query-client';

type Session = {
  accessToken: string;
  refreshToken: string;
};

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setSession: (session: Session) => void;
  clearSession: () => void;
};

const SESSION_COOKIE = 'has-session';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setSession: ({ accessToken, refreshToken }) => {
        document.cookie = `${SESSION_COOKIE}=1; path=/`;
        queryClient.clear();
        set({ accessToken, refreshToken, isAuthenticated: true });
      },
      clearSession: () => {
        document.cookie = `${SESSION_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
        queryClient.clear();
        set({ accessToken: null, refreshToken: null, isAuthenticated: false });
      },
    }),
    { name: 'vitrio-auth' },
  ),
);
