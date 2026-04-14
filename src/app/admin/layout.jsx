'use client';

import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from "next/navigation"

export default function AdminLayout({ children }) {
  const token = useAuthStore((state) => state.token);
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token]);

  if (!token) {
    return null; // or a loading spinner
  }

  return (
    <div className='flex h-screen font-sans bg-slate-50 text-slate-800 overflow-hidden'>
      <Sidebar />

      <div className='flex-1 flex flex-col transition-all duration-300'>
        <Navbar />

        <main className='flex-1 overflow-y-auto p-6 sm:p-5 space-y-8'>
          {children}
        </main>
      </div>
    </div>
  );
}
