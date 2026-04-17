import { create } from 'zustand';

// This store manages the authentication state of the user.
// It provides a way to set the user information and to log out, which resets the user information and authentication status.
export const useAuthStore = create((set) => ({
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
