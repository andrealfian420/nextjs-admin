'use client';

import Sidebar from '@/components/layout/admin/Sidebar';
import Navbar from '@/components/layout/admin/Navbar';
import AdminAccessGuard from '@/components/layout/admin/AdminAccessGuard';
import { useEffect } from 'react';
import { useSidebarStore } from '@/store/useSidebarStore';
import { TooltipProvider } from '@/components/ui/Tooltip';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const checkScreenSize = useSidebarStore((state) => state.checkScreenSize);

  useEffect(() => {
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, [checkScreenSize]);

  return (
    <AdminAccessGuard>
      <TooltipProvider>
        {/* h-dvh: the visible height on mobile browsers, whose toolbars 100vh ignores. */}
        <div className='flex h-dvh font-sans bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-hidden'>
          <Sidebar />

          <div className='flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300'>
            <Navbar />

            {/* The one scroll container of the admin area: sticky form action bars stick to
                its bottom, so pages must not add their own scrolling wrappers. Narrow screens
                get less padding to leave room for tables. */}
            <main className='flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-8'>
              {children}
            </main>
          </div>
        </div>
      </TooltipProvider>
    </AdminAccessGuard>
  );
}
