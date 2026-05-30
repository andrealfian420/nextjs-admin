'use client';

import { useEffect, useState } from 'react';

export default function DataTableSearch({
  onSearch,
}: {
  onSearch: (value: string) => void;
}) {
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
        className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 dark:text-zinc-500 pointer-events-none'
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
        className='h-9 w-full rounded-lg border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-700/50 pl-9 pr-3 text-sm text-zinc-700 dark:text-zinc-200 shadow-xs placeholder:text-zinc-400 dark:placeholder:text-zinc-500 transition-[border-color,box-shadow] outline-none focus:border-zinc-400 dark:focus:border-zinc-500 focus:ring-3 focus:ring-zinc-100 dark:focus:ring-zinc-700'
      />
    </div>
  );
}
