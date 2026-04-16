'use client';

import { useEffect, useState } from 'react';

export default function DataTableSearch({ onSearch }) {
  const [value, setValue] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      onSearch(value);
    }, 500);

    return () => clearTimeout(timeout);
  }, [value, onSearch]);

  return (
    <div className='relative max-w-sm'>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none'
        fill='none'
        viewBox='0 0 24 24'
        stroke='currentColor'
        strokeWidth={2}
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          d='M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z'
        />
      </svg>
      <input
        type='text'
        placeholder='Search...'
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className='h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 shadow-xs placeholder:text-slate-400 transition-[border-color,box-shadow] outline-none focus:border-slate-400 focus:ring-3 focus:ring-slate-100'
      />
    </div>
  );
}
