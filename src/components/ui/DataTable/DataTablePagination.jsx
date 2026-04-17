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

  return (
    <div className='flex items-center justify-between gap-3 mt-2'>
      {/* Per-page selector */}
      <div className='flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400'>
        <span className='whitespace-nowrap'>Rows per page</span>
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

      {/* Page buttons */}
      <div className='flex items-center gap-1.5'>
        {links.map((link, index) => {
          const label = link.label
            .replace('&laquo;', '‹')
            .replace('&raquo;', '›');

          const pageMatch = link.url?.match(/page=(\d+)/);
          const page = pageMatch ? Number(pageMatch[1]) : null;

          const isNav = index === 0 || index === links.length - 1;

          return (
            <button
              key={index}
              disabled={!link.url}
              onClick={() => page && onPageChange(page)}
              className={[
                'inline-flex items-center justify-center rounded-lg border text-sm font-medium transition-colors select-none cursor-pointer',
                isNav ? 'h-8 px-2.5' : 'h-8 min-w-8 px-2',
                link.active
                  ? 'border-slate-700 bg-slate-700 text-white shadow-sm'
                  : !link.url
                    ? 'border-slate-200 bg-white text-slate-300 cursor-default dark:border-slate-700 dark:bg-slate-800 dark:text-slate-600'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-100 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-200',
              ].join(' ')}
            >
              <span dangerouslySetInnerHTML={{ __html: label }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
