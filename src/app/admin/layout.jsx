'use client';

import Sidebar from '@/components/layout/admin/Sidebar';
import Navbar from '@/components/layout/admin/Navbar';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useSidebarStore } from '@/store/useSidebarStore';
import { TooltipProvider } from '@/components/ui/Tooltip';

export default function AdminLayout({ children }) {
  const token = useAuthStore((state) => state.token);
  const router = useRouter();
  const checkScreenSize = useSidebarStore((state) => state.checkScreenSize);

  useEffect(() => {
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, [checkScreenSize]);

  const [hydrated, setHydrated] = useState(false);

  // useEffect(() => {
  //   setHydrated(useAuthStore.persist.hasHydrated());

  //   const unsub = useAuthStore.persist.onFinishHydration(() => {
  //     setHydrated(true);
  //   });

  //   return () => unsub();
  // }, []);

  // useEffect(() => {
  //   if (hydrated && !token) {
  //     router.replace('/login');
  //   }
  // }, [hydrated, token]);

  // if (!hydrated) {
  //   return null; // bisa diganti spinner
  // }

  // if (!token) {
  //   return null;
  // }

  return (
    <TooltipProvider>
      <div className='flex h-screen font-sans bg-slate-50 text-slate-800 overflow-hidden'>
        <Sidebar />

        <div className='flex-1 flex flex-col transition-all duration-300'>
          <Navbar />

          <main className='flex-1 overflow-y-auto p-6 sm:p-5 space-y-8'>
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
