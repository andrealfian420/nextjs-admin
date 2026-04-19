import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// This store persists a single pending toast to sessionStorage so it survives
// full page reloads (e.g., after window.location.href redirect during forceLogout).
// sessionStorage is used intentionally — data is scoped to the tab and auto-cleared
// when the tab is closed.
export const usePendingToastStore = create(
  persist(
    (set) => ({
      pendingToast: null, // { type: 'success'|'error'|'warning'|'info', title: string, description?: string }

      setPendingToast: (toast) => set({ pendingToast: toast }),

      clearPendingToast: () => set({ pendingToast: null }),
    }),
    {
      name: 'pending-toast',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
