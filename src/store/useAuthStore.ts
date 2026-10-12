import { create } from 'zustand';
import type { UserProfile } from '@/types/user';

interface AuthState {
  user: UserProfile | null;
  // Memory only: never persisted. The refresh token lives in an HttpOnly cookie.
  accessToken: string | null;
  // Bumped by every logout. Async session work started earlier compares it before writing,
  // so a response that lands after logout cannot bring the session back.
  sessionVersion: number;
  setAccessToken: (token: string) => void;
  setUser: (user: UserProfile) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  sessionVersion: 0,

  setAccessToken: (token) => set({ accessToken: token }),

  setUser: (user) => set({ user }),

  logout: () =>
    set((state) => ({
      user: null,
      accessToken: null,
      sessionVersion: state.sessionVersion + 1,
    })),
}));
