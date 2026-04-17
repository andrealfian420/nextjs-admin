'use client';

import * as React from 'react';
import { CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * DatePicker — styled native <input type="date"> matching the design system.
 * Drop-in replacement for Input when a date value is needed.
 * Can be upgraded to a calendar-popup-based picker later by swapping internals.
 *
 * Usage:
 *   <DatePicker value={date} onChange={(e) => setDate(e.target.value)} />
 */
function DatePicker({ className, ...props }) {
  return (
    <div
      data-slot='date-picker'
      className={cn('relative flex items-center', className)}
    >
      <CalendarIcon className='pointer-events-none absolute left-2.5 size-4 shrink-0 text-muted-foreground' />
      <input
        type='date'
        className={cn(
          'h-9 w-full min-w-0 rounded-md border border-input bg-transparent py-1 pl-8 pr-2.5 text-sm shadow-xs transition-[color,box-shadow] outline-none [color-scheme:light] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:[color-scheme:dark] dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
        )}
        {...props}
      />
    </div>
  );
}

/**
 * DateRangePicker — two DatePicker inputs for a start/end range.
 *
 * Usage:
 *   <DateRangePicker
 *     fromProps={{ value: startDate, onChange: (e) => setStartDate(e.target.value) }}
 *     toProps={{ value: endDate,   onChange: (e) => setEndDate(e.target.value) }}
 *   />
 */
function DateRangePicker({
  className,
  fromProps = {},
  toProps = {},
  separator = 'to',
}) {
  return (
    <div
      data-slot='date-range-picker'
      className={cn('flex items-center gap-2', className)}
    >
      <DatePicker {...fromProps} />
      <span className='shrink-0 text-sm text-muted-foreground'>
        {separator}
      </span>
      <DatePicker {...toProps} />
    </div>
  );
}

export { DatePicker, DateRangePicker };
