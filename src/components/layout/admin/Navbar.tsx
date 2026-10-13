'use client';

import { Menu } from 'lucide-react';
import { useSidebarStore } from '@/store/useSidebarStore';
import ThemeToggle from '@/components/frontend/ThemeToggle';
import ProfileMenu from '@/components/layout/admin/profile/ProfileMenu';
import { ADMIN_SIDEBAR_ID } from '@/components/layout/admin/Sidebar';

export default function Navbar() {
  const isOpen = useSidebarStore((state) => state.isOpen);
  const toggleSidebar = useSidebarStore((state) => state.toggleSidebar);

  return (
    <header className='h-14 shrink-0 bg-white dark:bg-zinc-900 border-b border-zinc-200/70 dark:border-zinc-800/50 flex items-center justify-between px-4 sm:px-6'>
      <button
        type='button'
        onClick={toggleSidebar}
        aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
        aria-expanded={isOpen}
        aria-controls={ADMIN_SIDEBAR_ID}
        className='cursor-pointer rounded-lg p-2 text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 outline-none focus-visible:ring-3 focus-visible:ring-ring/50'
      >
        <Menu size={18} aria-hidden />
      </button>

      <div className='flex items-center gap-2'>
        <ThemeToggle />
        <ProfileMenu variant='navbar' />
      </div>
    </header>
  );
}
