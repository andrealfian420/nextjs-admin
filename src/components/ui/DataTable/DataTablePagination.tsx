'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';

const LIMIT_OPTIONS = [10, 25, 50];

const NAV_BUTTON =
  'inline-flex items-center justify-center rounded-lg border h-8 px-2.5 text-sm font-medium transition-colors select-none border-zinc-200 bg-white text-zinc-600 enabled:cursor-pointer enabled:hover:border-zinc-400 enabled:hover:bg-zinc-100 enabled:hover:text-zinc-800 disabled:text-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:enabled:hover:border-zinc-500 dark:enabled:hover:bg-zinc-700 dark:enabled:hover:text-zinc-200 dark:disabled:text-zinc-600';

// Page navigation and page-size selector. Pages come from the list's `meta`, so nothing
// depends on the format of the backend's link URLs.
export default function DataTablePagination({
  page,
  lastPage,
  onPageChange,
  limit,
  onLimitChange,
}: {
  page: number;
  lastPage: number;
  onPageChange: (page: number) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
}) {
  const hasPrev = page > 1;
  const hasNext = page < lastPage;

  return (
    <div className='flex items-center justify-between gap-3 mt-2'>
      {/* Per-page selector */}
      <div className='flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400'>
        <span className='whitespace-nowrap hidden sm:inline'>
          Rows per page
        </span>
        <Select
          value={String(limit)}
          onValueChange={(val) => onLimitChange(Number(val))}
        >
          <SelectTrigger size='sm' className='w-16 cursor-pointer'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent
            position='popper'
            side='top'
            className='bg-white border border-zinc-200 dark:border-zinc-700 shadow-md'
          >
            {LIMIT_OPTIONS.map((opt) => (
              <SelectItem
                key={opt}
                value={String(opt)}
                className='cursor-pointer'
              >
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Mobile: prev / page info / next */}
      <div className='flex sm:hidden items-center gap-2'>
        <button
          type='button'
          aria-label='Previous page'
          disabled={!hasPrev}
          onClick={() => onPageChange(page - 1)}
          className={NAV_BUTTON}
        >
          ‹
        </button>
        <span className='text-sm text-zinc-500 dark:text-zinc-400 whitespace-nowrap'>
          {page} / {Math.max(lastPage, 1)}
        </span>
        <button
          type='button'
          aria-label='Next page'
          disabled={!hasNext}
          onClick={() => onPageChange(page + 1)}
          className={NAV_BUTTON}
        >
          ›
        </button>
      </div>

      {/* Desktop: full page buttons */}
      <nav aria-label='Pagination' className='hidden sm:flex items-center gap-1.5'>
        <button
          type='button'
          aria-label='Previous page'
          disabled={!hasPrev}
          onClick={() => onPageChange(page - 1)}
          className={NAV_BUTTON}
        >
          ‹
        </button>

        {/* Page numbers with ellipsis */}
        {buildPageItems(page, lastPage).map((item, i) => {
          if (item === '...') {
            return (
              <span
                key={`ellipsis-${i}`}
                className='inline-flex items-center justify-center h-8 min-w-8 px-1 text-sm text-zinc-400 dark:text-zinc-500 select-none'
              >
                …
              </span>
            );
          }
          const isActive = item === page;
          return (
            <button
              type='button'
              key={item}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onPageChange(item)}
              className={[
                'inline-flex items-center justify-center rounded-lg border h-8 min-w-8 px-2 text-sm font-medium transition-colors select-none cursor-pointer',
                isActive
                  ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                  : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400 hover:bg-zinc-100 hover:text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:bg-zinc-700 dark:hover:text-zinc-200',
              ].join(' ')}
            >
              {item}
            </button>
          );
        })}

        <button
          type='button'
          aria-label='Next page'
          disabled={!hasNext}
          onClick={() => onPageChange(page + 1)}
          className={NAV_BUTTON}
        >
          ›
        </button>
      </nav>
    </div>
  );
}

/**
 * Build a truncated list of page numbers with ellipsis.
 * Always shows: first, last, current, and up to 1 sibling on each side.
 * Example (page 6 of 20): [1, '...', 5, 6, 7, '...', 20]
 */
export function buildPageItems(current: number, total: number): (number | '...')[] {
  if (total <= 1) return [];

  const delta = 1; // siblings around current
  const range: number[] = [];

  for (
    let i = Math.max(2, current - delta);
    i <= Math.min(total - 1, current + delta);
    i++
  ) {
    range.push(i);
  }

  const items: (number | '...')[] = [1];

  if (range.length > 0 && range[0] > 2) items.push('...');
  items.push(...range);
  if (range.length > 0 && range[range.length - 1] < total - 1) items.push('...');

  items.push(total);

  return items;
}
