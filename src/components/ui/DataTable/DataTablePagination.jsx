'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';

const LIMIT_OPTIONS = [10, 25, 50];

export default function DataTablePagination({
  links,
  onPageChange,
  limit,
  onLimitChange,
}) {
  if (!links || links.length === 0) return null;

  // Derive current page and total pages from links
  const pageLinks = links.slice(1, -1); // strip prev/next
  const activePage = pageLinks.find((l) => l.active);
  const currentPage = activePage ? Number(activePage.label) : null;
  const totalPages =
    pageLinks.length > 0 ? Number(pageLinks[pageLinks.length - 1].label) : null;

  const prevLink = links[0];
  const nextLink = links[links.length - 1];

  const getPage = (link) => {
    const m = link.url?.match(/page=(\d+)/);
    return m ? Number(m[1]) : null;
  };

  const navBtnClass = (link) =>
    [
      'inline-flex items-center justify-center rounded-lg border h-8 px-2.5 text-sm font-medium transition-colors select-none',
      link.url
        ? 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-100 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-200 cursor-pointer'
        : 'border-slate-200 bg-white text-slate-300 cursor-default dark:border-slate-700 dark:bg-slate-800 dark:text-slate-600',
    ].join(' ');

  return (
    <div className='flex items-center justify-between gap-3 mt-2'>
      {/* Per-page selector */}
      <div className='flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400'>
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
            className='bg-white border border-slate-200 dark:border-slate-700 shadow-md'
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
          disabled={!prevLink.url}
          onClick={() => {
            const p = getPage(prevLink);
            if (p) onPageChange(p);
          }}
          className={navBtnClass(prevLink)}
        >
          ‹
        </button>
        {currentPage && totalPages && (
          <span className='text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap'>
            {currentPage} / {totalPages}
          </span>
        )}
        <button
          disabled={!nextLink.url}
          onClick={() => {
            const p = getPage(nextLink);
            if (p) onPageChange(p);
          }}
          className={navBtnClass(nextLink)}
        >
          ›
        </button>
      </div>

      {/* Desktop: full page buttons */}
      <div className='hidden sm:flex items-center gap-1.5'>
        {/* Prev */}
        <button
          disabled={!prevLink.url}
          onClick={() => {
            const p = getPage(prevLink);
            if (p) onPageChange(p);
          }}
          className={[
            'inline-flex items-center justify-center rounded-lg border h-8 px-2.5 text-sm font-medium transition-colors select-none cursor-pointer',
            prevLink.url
              ? 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-100 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-200'
              : 'border-slate-200 bg-white text-slate-300 cursor-default dark:border-slate-700 dark:bg-slate-800 dark:text-slate-600',
          ].join(' ')}
        >
          ‹
        </button>

        {/* Page numbers with ellipsis */}
        {buildPageItems(currentPage, totalPages).map((item, i) => {
          if (item === '...') {
            return (
              <span
                key={`ellipsis-${i}`}
                className='inline-flex items-center justify-center h-8 min-w-8 px-1 text-sm text-slate-400 dark:text-slate-500 select-none'
              >
                …
              </span>
            );
          }
          const isActive = item === currentPage;
          return (
            <button
              key={item}
              onClick={() => onPageChange(item)}
              className={[
                'inline-flex items-center justify-center rounded-lg border h-8 min-w-8 px-2 text-sm font-medium transition-colors select-none cursor-pointer',
                isActive
                  ? 'border-slate-700 bg-slate-700 text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-100 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-200',
              ].join(' ')}
            >
              {item}
            </button>
          );
        })}

        {/* Next */}
        <button
          disabled={!nextLink.url}
          onClick={() => {
            const p = getPage(nextLink);
            if (p) onPageChange(p);
          }}
          className={[
            'inline-flex items-center justify-center rounded-lg border h-8 px-2.5 text-sm font-medium transition-colors select-none cursor-pointer',
            nextLink.url
              ? 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-100 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-200'
              : 'border-slate-200 bg-white text-slate-300 cursor-default dark:border-slate-700 dark:bg-slate-800 dark:text-slate-600',
          ].join(' ')}
        >
          ›
        </button>
      </div>
    </div>
  );
}

/**
 * Build a truncated list of page numbers with ellipsis.
 * Always shows: first, last, current, and up to 1 sibling on each side.
 * Example (page 6 of 20): [1, '...', 5, 6, 7, '...', 20]
 */
function buildPageItems(current, total) {
  if (!current || !total || total <= 1) return [];

  const delta = 1; // siblings around current
  const range = [];

  for (
    let i = Math.max(2, current - delta);
    i <= Math.min(total - 1, current + delta);
    i++
  ) {
    range.push(i);
  }

  const items = [];

  items.push(1);

  if (range[0] > 2) items.push('...');
  items.push(...range);
  if (range[range.length - 1] < total - 1) items.push('...');

  if (total > 1) items.push(total);

  return items;
}
