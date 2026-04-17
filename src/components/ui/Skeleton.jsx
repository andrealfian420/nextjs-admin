import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Skeleton — a generic animated placeholder for loading states.
 * Renders a pulsing rounded box — size it with Tailwind classes.
 *
 * Usage:
 *   <Skeleton className="h-4 w-48" />           ← single line
 *   <Skeleton className="size-10 rounded-full" /> ← avatar circle
 */
function Skeleton({ className, ...props }) {
  return (
    <div
      data-slot='skeleton'
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}

/**
 * SkeletonText — stacked text line placeholders.
 *
 * Usage:
 *   <SkeletonText lines={3} />
 */
function SkeletonText({ lines = 3, className }) {
  return (
    <div data-slot='skeleton-text' className={cn('space-y-2', className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            // last line is shorter to mimic natural text ending
            i === lines - 1 && lines > 1 ? 'w-4/5' : 'w-full',
          )}
        />
      ))}
    </div>
  );
}

/**
 * SkeletonCard — a card-shaped skeleton preset.
 *
 * Usage:
 *   <SkeletonCard />
 *   <div className="grid grid-cols-3 gap-4">
 *     {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}
 *   </div>
 */
function SkeletonCard({ className }) {
  return (
    <div
      data-slot='skeleton-card'
      className={cn('space-y-3 rounded-lg border border-border p-4', className)}
    >
      <Skeleton className='h-5 w-2/5' />
      <SkeletonText lines={2} />
    </div>
  );
}

/**
 * SkeletonTable — a table-row skeleton preset.
 * Mirrors the DataTable loading state but as a reusable component.
 *
 * Usage:
 *   <SkeletonTable rows={5} cols={4} />
 */
function SkeletonTable({ rows = 5, cols = 4, className }) {
  return (
    <div
      data-slot='skeleton-table'
      className={cn('w-full overflow-hidden', className)}
    >
      {/* Header */}
      <div className='flex gap-4 border-b px-4 py-3'>
        {Array.from({ length: cols }, (_, i) => (
          <Skeleton key={i} className='h-4 flex-1' />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className='flex gap-4 border-b px-4 py-3'>
          {Array.from({ length: cols }, (_, c) => (
            <Skeleton key={c} className='h-4 flex-1' />
          ))}
        </div>
      ))}
    </div>
  );
}

export { Skeleton, SkeletonText, SkeletonCard, SkeletonTable };
