'use client';

import Link from 'next/link';
import { LayoutDashboard, Users } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useSidebarStore } from '@/store/useSidebarStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { User } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const isOpen = useSidebarStore((state) => state.isOpen);
  const close = useSidebarStore((state) => state.close);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const menu = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: Users,
    },
  ];

  return (
    <>
      {/* Overlay — always rendered, fade in/out via opacity */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={close}
      />

      {/* Sidebar — fixed on mobile (overlay), static in flex flow on desktop */}
      <aside
        className={`
          fixed lg:static top-0 left-0
          h-full lg:h-auto
          z-50 lg:z-auto
          flex flex-col flex-shrink-0
          bg-white shadow-[2px_0_12px_0_rgba(0,0,0,0.06)]
          overflow-hidden
          transition-all duration-300 ease-in-out
          ${
            isOpen
              ? 'w-64 translate-x-0'
              : 'w-64 -translate-x-full lg:w-0 lg:translate-x-0'
          }
        `}
      >
        <div className='h-14 flex items-center px-6 flex-shrink-0'>
          <h1 className='font-semibold text-lg tracking-tight whitespace-nowrap'>
            Admin Panel
          </h1>
        </div>

        <nav className='flex flex-col gap-1 p-3 flex-1 overflow-y-auto'>
          {menu.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-100 font-medium text-slate-900'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon size={18} className='flex-shrink-0' />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className='h-14 flex items-center px-6 flex-shrink-0'>
          <div className='flex items-center gap-3'>
            <div className='h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <User size={16} className='text-slate-600 cursor-pointer' />
                </DropdownMenuTrigger>

                <DropdownMenuContent className='mb-4 p-0 min-w-[180px]'>
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

            <div className='flex flex-col'>
              <span className='text-sm font-medium text-slate-700'>Admin</span>
              <span className='text-xs font-medium text-slate-500'>Backend User</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
