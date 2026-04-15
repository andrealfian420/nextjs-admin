'use client';

import { useSidebarStore } from '@/store/useSidebarStore';
import { Bell, User, Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const setIsOpen = useSidebarStore((state) => state.toggleSidebar);

  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className='h-14 bg-white flex items-center justify-between px-6'>
      <div>
        <Menu
          className='cursor-pointer hover:opacity-75 transition'
          size={18}
          onClick={setIsOpen}
        />
      </div>

      <div className='flex items-center gap-4'>
        {/* <button className='relative p-2 rounded-lg hover:bg-slate-100 transition'>
          <Bell size={18} className='text-slate-600 cursor-pointer' />
        </button> */}

        <div className='flex items-center gap-3'>
          <div className='h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <User size={16} className='text-slate-600 cursor-pointer' />
              </DropdownMenuTrigger>

              <DropdownMenuContent className='mt-4 mr-4 p-0'>
                <DropdownMenuItem className='w-full h-full hover:bg-slate-100 hover:text-slate-900 p-2 rounded-md transition cursor-pointer'>
                  <Link href='/profile'>Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className='w-full h-full hover:bg-slate-100 hover:text-slate-900 p-2 rounded-md transition cursor-pointer'
                  onClick={handleLogout}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <span className='text-sm font-medium text-slate-700'>Admin</span>
        </div>
      </div>
    </header>
  );
}
