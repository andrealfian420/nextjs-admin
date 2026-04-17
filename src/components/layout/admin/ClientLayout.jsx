'use client';

import Sidebar from '@/components/layout/admin/Sidebar';
import Navbar from '@/components/layout/admin/Navbar';
import { useEffect } from 'react';
import { useSidebarStore } from '@/store/useSidebarStore';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { Toaster } from '@/components/ui/Sonner';

export default function ClientLayout({ children }) {
  const checkScreenSize = useSidebarStore((state) => state.checkScreenSize);

  useEffect(() => {
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, [checkScreenSize]);

  return (
    <TooltipProvider>
      <div className='flex h-screen font-sans bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 overflow-hidden'>
        <Sidebar />

        <div className='flex-1 flex flex-col transition-all duration-300'>
          <Navbar />

          <main className='flex-1 overflow-y-auto p-6 sm:p-5 space-y-8'>
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </TooltipProvider>
  );
}
