import { refresh } from 'next/cache';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Auth store to manage user authentication state
export const useAuthStore = create(
  // Define the store with persist middleware to save auth state in localStorage
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      setAuth: (user, token, refreshToken) => {
        set({
          user,
          token,
          refreshToken,
        });
      },
      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
        });
      },
      setHasHydrated: (state) => {
        set({
          _hasHrydrated: state,
        });
      },
    }),
    {
      name: 'auth', // name of the item in storage
      storage: createJSONStorage(() => localStorage), // use localStorage for persistence
      partialize: (state) => ({
        user: state.user,
        token: state.token, // only persist the user, token, and refreshToken
        refreshToken: state.refreshToken,
      }),
    },
  ),
);
