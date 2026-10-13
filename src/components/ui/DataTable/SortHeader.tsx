'use client';

import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import type { Column } from '@tanstack/react-table';

/**
 * Sortable column header for DataTable. Only use it on columns the backend whitelists for
 * `sort_by`; the column id is sent as is.
 */
export function SortHeader<T>({
  column,
  label,
}: {
  column: Column<T, unknown>;
  label: string;
}) {
  const sorted = column.getIsSorted();
  return (
    <button
      type='button'
      onClick={() => column.toggleSorting()}
      className={`flex cursor-pointer items-center gap-1 transition-colors ${
        sorted
          ? 'text-blue-600 dark:text-blue-400'
          : 'hover:text-zinc-700 dark:hover:text-zinc-200'
      }`}
    >
      {label}
      {sorted === 'asc' ? (
        <ArrowUp size={12} aria-hidden className='text-blue-600 dark:text-blue-400' />
      ) : sorted === 'desc' ? (
        <ArrowDown size={12} aria-hidden className='text-blue-600 dark:text-blue-400' />
      ) : (
        <ArrowUpDown size={12} aria-hidden className='text-zinc-400 dark:text-zinc-600' />
      )}
    </button>
  );
}
