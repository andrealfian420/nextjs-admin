import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { PendingToast } from '@/types';

interface PendingToastState {
  pendingToast: PendingToast | null;
  setPendingToast: (toast: PendingToast) => void;
  clearPendingToast: () => void;
}

// This store persists a single pending toast to sessionStorage so it survives
// full page reloads (e.g., after window.location.href redirect during forceLogout).
// sessionStorage is used intentionally — data is scoped to the tab and auto-cleared
// when the tab is closed.
export const usePendingToastStore = create<PendingToastState>()(
  persist(
    (set) => ({
      pendingToast: null,

      setPendingToast: (toast) => set({ pendingToast: toast }),

      clearPendingToast: () => set({ pendingToast: null }),
    }),
    {
      name: 'pending-toast',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
