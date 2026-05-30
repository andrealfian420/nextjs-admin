import { create } from 'zustand';

interface SidebarState {
  isOpen: boolean;
  toggleSidebar: () => void;
  checkScreenSize: () => void;
  checkMobileClose: () => void;
  close: () => void;
}

// Sidebar store to manage the state of the sidebar (open/closed)
export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: false, // initial state of the sidebar (closed)
  toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })), // function to toggle the sidebar state
  checkScreenSize: () => {
    // Check the screen size and set the sidebar state accordingly
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 1024) {
        set({ isOpen: false });
      } else {
        set({ isOpen: true });
      }
    }
  },
  checkMobileClose: () => {
    // Close the sidebar if the screen size is less than 1024px (mobile view)
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      set({ isOpen: false });
    }
  },
  close: () => set({ isOpen: false }), // function to close the sidebar
}));
