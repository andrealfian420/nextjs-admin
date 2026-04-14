'use client';

import Link from 'next/link';
import { LayoutDashboard, Users } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

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
    <aside className='w-64 bg-white flex flex-col shadow-[2px_0_12px_0_rgba(0,0,0,0.06)]'>
      <div className='h-14 flex items-center px-6'>
        <h1 className='font-semibold text-lg tracking-tight'>Admin Panel</h1>
      </div>

      <nav className='flex flex-col gap-1 p-3'>
        {menu.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
              ${
                isActive
                  ? 'bg-slate-100 font-medium text-slate-900'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
