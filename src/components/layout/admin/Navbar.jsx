'use client';

import { useSidebarStore } from '@/store/useSidebarStore';
import { User, Menu, SunIcon, MoonIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useLogout } from '@/hooks/useLogout';

export default function Navbar() {
  const setIsOpen = useSidebarStore((state) => state.toggleSidebar);
  const { resolvedTheme, setTheme } = useTheme();
  const { handleLogout } = useLogout();

  // resolvedTheme is undefined before client hydration — used as mount guard
  const toggleTheme = () => {
    return setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className='h-14 bg-white dark:bg-slate-800 border-b border-transparent dark:border-slate-700 flex items-center justify-between px-6'>
      <div>
        <Menu
          className='cursor-pointer hover:opacity-75 transition text-slate-700 dark:text-slate-300'
          size={18}
          onClick={setIsOpen}
        />
      </div>

      <div className='flex items-center gap-4'>
        {/* Theme toggle — only renders after client hydration (resolvedTheme is undefined on server) */}
        <button
          onClick={toggleTheme}
          aria-label='Toggle theme'
          className='relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer'
        >
          {resolvedTheme === 'dark' ? (
            <SunIcon size={18} className='text-slate-400' />
          ) : (
            <MoonIcon size={18} className='text-slate-600' />
          )}
        </button>

        {/* <button className='relative p-2 rounded-lg hover:bg-slate-100 transition cursor-pointer'>
          <Bell size={18} className='text-slate-600 cursor-pointer' />
        </button> */}

        <div className='flex items-center gap-3'>
          <div className='h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <User
                  size={16}
                  className='text-slate-600 dark:text-slate-300 cursor-pointer'
                />
              </DropdownMenuTrigger>

              <DropdownMenuContent className='mt-4 mr-4 p-0'>
                <DropdownMenuItem className='w-full h-full hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 p-2 rounded-md transition cursor-pointer'>
                  <Link href='/profile'>Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className='w-full h-full hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 p-2 rounded-md transition cursor-pointer'
                  onClick={handleLogout}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <span className='text-sm font-medium text-slate-700 dark:text-slate-200'>
            Admin
          </span>
        </div>
      </div>
    </header>
  );
}
