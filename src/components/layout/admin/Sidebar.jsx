'use client';

import Link from 'next/link';
import {
  ChevronDown,
  Database,
  History,
  LayoutDashboard,
  Shield,
  Users,
} from 'lucide-react';
import { useState, useEffect } from 'react';
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
import { authService } from '@/services/authService';
import { toast } from 'sonner';
import { useLogout } from '@/hooks/useLogout';

const generateRandomKey = () => Math.random().toString(36).substring(2, 9);

const menu = [
  {
    name: 'Dashboard',
    icon: LayoutDashboard,
    key: 'dash',
    href: '/admin',
    access: 'modules.dashboard.index',
  },
  {
    name: 'Master Data',
    icon: Database,
    key: 'master',
    children: [
      {
        name: 'Users',
        icon: Users,
        key: 'users',
        href: '/admin/users',
        access: 'modules.master-data.users.index',
      },
      {
        name: 'Roles',
        icon: Shield,
        key: 'roles',
        href: '/admin/roles',
        access: 'modules.master-data.role.index',
      },
    ],
  },
  { separator: true }, // separator item, if you need to divide sections
  {
    name: 'Log Activity',
    icon: History,
    key: 'log-activity',
    href: '/admin/log-activity',
    access: 'modules.log-activity.index',
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const isOpen = useSidebarStore((state) => state.isOpen);
  const close = useSidebarStore((state) => state.close);
  const { handleLogout } = useLogout();
  const [openAccordions, setOpenAccordions] = useState(new Set());

  // watch route changes to auto-open accordions with active child
  useEffect(() => {
    menu.forEach((item) => {
      if (item.children?.some((child) => child.href === pathname)) {
        setOpenAccordions((prev) => {
          if (prev.has(item.key)) return prev;
          const next = new Set(prev);
          next.add(item.key);
          return next;
        });
      }
    });
  }, [pathname]);

  // toggle accordion menu open/close
  const toggleAccordion = (key) => {
    setOpenAccordions((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

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
          bg-white dark:bg-slate-800 shadow-[2px_0_12px_0_rgba(0,0,0,0.06)]
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
          <h1 className='font-semibold text-lg tracking-tight whitespace-nowrap text-slate-800 dark:text-slate-100'>
            Admin Panel
          </h1>
        </div>

        <nav className='flex flex-col gap-1 p-3 flex-1 overflow-y-auto'>
          {menu.map((item) => {
            if (item.separator) {
              return (
                <div
                  key={generateRandomKey()}
                  className='border-t border-slate-200 dark:border-slate-700 my-2'
                />
              );
            }

            const Icon = item.icon;
            const isActive = pathname === item.href;

            if (item.children) {
              const isAccordionOpen = openAccordions.has(item.key);
              const hasActiveChild = item.children.some(
                (child) => child.href === pathname,
              );

              return (
                <div key={item.key}>
                  <button
                    onClick={() => toggleAccordion(item.key)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                      hasActiveChild
                        ? 'text-slate-900 dark:text-slate-100'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <Icon size={18} />
                    <span className='flex-1 text-left'>{item.name}</span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${
                        isAccordionOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <div
                    className={`grid transition-all duration-200 ${
                      isAccordionOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                  >
                    <div className='overflow-hidden'>
                      <div className='ml-6 flex flex-col gap-1 pt-1'>
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          const isChildActive = pathname.includes(child.href);

                          return (
                            <Link
                              key={child.key}
                              href={child.href}
                              className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors whitespace-nowrap ${
                                isChildActive
                                  ? 'bg-slate-100 dark:bg-slate-700 font-medium text-slate-900 dark:text-slate-100'
                                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
                              }`}
                            >
                              <ChildIcon size={16} />
                              {child.name}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setOpenAccordions(new Set())}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-700 font-medium text-slate-900 dark:text-slate-100'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className='h-14 flex items-center px-6 flex-shrink-0 border-t border-slate-200 dark:border-slate-700'>
          <div className='flex items-center gap-3'>
            <div className='h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <User
                    size={16}
                    className='text-slate-600 dark:text-slate-300 cursor-pointer'
                  />
                </DropdownMenuTrigger>

                <DropdownMenuContent className='mb-4 p-0 min-w-[180px]'>
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

            <div className='flex flex-col'>
              <span className='text-sm font-medium text-slate-700 dark:text-slate-200'>
                Administrator
              </span>
              <span className='text-xs font-medium text-slate-500 dark:text-slate-400'>
                Super Admin
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
