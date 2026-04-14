'use client';

import { Bell, User, Menu } from 'lucide-react';

export default function Navbar() {
  return (
    <header className='h-14 bg-white flex items-center justify-between px-6'>
      <div>
        <Menu
          className='cursor-pointer hover:opacity-75 transition'
          size={18}
        />
      </div>

      <div className='flex items-center gap-4'>
        <button className='relative p-2 rounded-lg hover:bg-slate-100 transition'>
          <Bell size={18} className='text-slate-600 cursor-pointer' />
        </button>

        <div className='flex items-center gap-3'>
          <div className='h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center'>
            <User size={16} className='text-slate-600 cursor-pointer' />
          </div>

          <span className='text-sm font-medium text-slate-700'>Admin</span>
        </div>
      </div>
    </header>
  );
}
