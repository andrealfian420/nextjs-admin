import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setAccessToken: (token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

// This store manages the authentication state of the user.
// It provides a way to set the user information and to log out, which resets the user information and authentication status.
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,

  setAccessToken: (token) => set({ accessToken: token }),

  setUser: (user) => set({ user }),

  logout: () =>
    set({
      user: null,
      accessToken: null,
    }),
}));
