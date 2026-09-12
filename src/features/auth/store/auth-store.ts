import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setSession: ({ accessToken, refreshToken }) =>
        set({ accessToken, refreshToken, isAuthenticated: true }),
      clearSession: () =>
        set({ accessToken: null, refreshToken: null, isAuthenticated: false }),
    }),
    { name: 'vitrio-auth' },
  ),
);
