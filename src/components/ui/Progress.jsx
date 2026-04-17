'use client';

import * as React from 'react';
import { Progress as ProgressPrimitive } from 'radix-ui';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const progressVariants = cva(
  'relative w-full overflow-hidden rounded-full bg-secondary',
  {
    variants: {
      size: {
        sm: 'h-1',
        default: 'h-2',
        lg: 'h-3',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

const indicatorVariants = cva('h-full w-full flex-1 transition-all', {
  variants: {
    variant: {
      default: 'bg-primary',
      success: 'bg-emerald-500',
      warning: 'bg-amber-500',
      destructive: 'bg-destructive',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

/**
 * Progress — a linear progress bar.
 *
 * Usage:
 *   <Progress value={65} />
 *   <Progress value={30} variant="warning" size="lg" />
 *   <Progress value={null} />   ← indeterminate (striped animation)
 */
function Progress({
  className,
  value,
  variant = 'default',
  size = 'default',
  showLabel = false,
  ...props
}) {
  const indeterminate = value === null || value === undefined;

  return (
    <div data-slot='progress-wrapper' className='w-full space-y-1'>
      <ProgressPrimitive.Root
        data-slot='progress'
        value={indeterminate ? undefined : value}
        className={cn(progressVariants({ size }), className)}
        {...props}
      >
        <ProgressPrimitive.Indicator
          data-slot='progress-indicator'
          className={cn(
            indicatorVariants({ variant }),
            indeterminate &&
              'animate-[progress-indeterminate_1.5s_ease-in-out_infinite] origin-left',
          )}
          style={
            indeterminate
              ? undefined
              : { transform: `translateX(-${100 - (value ?? 0)}%)` }
          }
        />
      </ProgressPrimitive.Root>

      {showLabel && !indeterminate && (
        <p className='text-right text-xs text-muted-foreground'>
          {Math.round(value ?? 0)}%
        </p>
      )}
    </div>
  );
}

export { Progress };
