import * as React from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const spinnerVariants = cva(
  'inline-block shrink-0 animate-spin rounded-full border-current border-t-transparent',
  {
    variants: {
      size: {
        xs: 'size-3 border',
        sm: 'size-4 border-2',
        default: 'size-5 border-2',
        lg: 'size-8 border-[3px]',
        xl: 'size-12 border-4',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

/**
 * Spinner — a circular loading indicator.
 *
 * Usage:
 *   <Spinner />
 *   <Spinner size="lg" className="text-primary" />
 *   <Spinner size="sm" /> Loading...
 */
function Spinner({
  className,
  size = 'default',
  label = 'Loading…',
  ...props
}) {
  return (
    <span
      data-slot='spinner'
      role='status'
      aria-label={label}
      className={cn(spinnerVariants({ size }), className)}
      {...props}
    />
  );
}

/**
 * SpinnerOverlay — a full-container loading overlay with a centred spinner.
 * Useful for loading states inside a Card or a section.
 *
 * Usage:
 *   <div className="relative min-h-40">
 *     {isLoading && <SpinnerOverlay />}
 *     {content}
 *   </div>
 */
function SpinnerOverlay({ className, size = 'lg', ...props }) {
  return (
    <div
      data-slot='spinner-overlay'
      className={cn(
        'absolute inset-0 z-10 flex items-center justify-center rounded-[inherit] bg-background/60 backdrop-blur-[2px]',
        className,
      )}
      {...props}
    >
      <Spinner size={size} className='text-primary' />
    </div>
  );
}

export { Spinner, SpinnerOverlay };
