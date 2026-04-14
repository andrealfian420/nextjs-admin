import { create } from 'zustand';

// Auth store to manage user authentication state
export const useAuthStore = create((set) => ({
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
}));
