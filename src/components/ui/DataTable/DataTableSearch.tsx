'use client';

import { useEffect, useRef, useState } from 'react';

const DEBOUNCE_MS = 500;

// Debounced search box. The timer is scheduled by typing only, never by mount or a parent
// re-render, so the table's page is not reset behind the user's back. A term equal to the
// last one sent (e.g. typed and deleted again) is not sent.
export default function DataTableSearch({
  onSearch,
}: {
  onSearch: (value: string) => void;
}) {
  const [value, setValue] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastSent = useRef('');

  // Call the latest onSearch when the timer fires, whatever the parent passed meanwhile.
  const onSearchRef = useRef(onSearch);
  useEffect(() => {
    onSearchRef.current = onSearch;
  });

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleChange = (next: string) => {
    setValue(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const term = next.trim();
      if (term === lastSent.current) return;
      lastSent.current = term;
      onSearchRef.current(term);
    }, DEBOUNCE_MS);
  };

  return (
    <div className='relative w-full min-w-0 sm:w-auto sm:max-w-sm'>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 dark:text-zinc-500 pointer-events-none'
        fill='none'
        viewBox='0 0 24 24'
        stroke='currentColor'
        strokeWidth={2}
        aria-hidden='true'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          d='M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z'
        />
      </svg>
      <input
        type='text'
        aria-label='Search'
        placeholder='Search...'
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className='h-9 w-full rounded-lg border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-700/50 pl-9 pr-3 text-sm text-zinc-700 dark:text-zinc-200 shadow-xs placeholder:text-zinc-400 dark:placeholder:text-zinc-500 transition-[border-color,box-shadow] outline-none focus:border-zinc-400 dark:focus:border-zinc-500 focus:ring-3 focus:ring-zinc-100 dark:focus:ring-zinc-700'
      />
    </div>
  );
}
