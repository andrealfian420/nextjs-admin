import * as React from 'react';
import { cva } from 'class-variance-authority';
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  InfoIcon,
  TriangleAlertIcon,
  XIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';

const alertVariants = cva(
  'relative flex w-full gap-3 rounded-lg border p-4 text-sm [&>svg]:mt-0.5 [&>svg]:size-4 [&>svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'border-border bg-card text-foreground [&>svg]:text-foreground',
        info: 'border-blue-200 bg-blue-50 text-blue-900 [&>svg]:text-blue-500 dark:border-blue-800/40 dark:bg-blue-950/30 dark:text-blue-200',
        success:
          'border-emerald-200 bg-emerald-50 text-emerald-900 [&>svg]:text-emerald-500 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-200',
        warning:
          'border-amber-200 bg-amber-50 text-amber-900 [&>svg]:text-amber-500 dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-200',
        destructive:
          'border-destructive/30 bg-destructive/10 text-destructive [&>svg]:text-destructive dark:border-destructive/40 dark:bg-destructive/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

/** Icon shown automatically per variant when no custom icon child is passed */
const DEFAULT_ICONS = {
  info: InfoIcon,
  success: CheckCircle2Icon,
  warning: TriangleAlertIcon,
  destructive: AlertCircleIcon,
  default: InfoIcon,
};

/**
 * Alert — a coloured inline banner for form errors, status messages, etc.
 *
 * Usage (auto icon):
 *   <Alert variant="destructive">
 *     <AlertTitle>Something went wrong</AlertTitle>
 *     <AlertDescription>Please try again later.</AlertDescription>
 *   </Alert>
 *
 * Usage (custom icon):
 *   <Alert variant="info">
 *     <SparklesIcon />
 *     <AlertTitle>Pro tip</AlertTitle>
 *     <AlertDescription>You can use Ctrl+K to open the command palette.</AlertDescription>
 *   </Alert>
 *
 * Usage (dismissible):
 *   <Alert variant="success" onDismiss={() => setVisible(false)}>
 *     <AlertTitle>Saved</AlertTitle>
 *   </Alert>
 */
function Alert({
  className,
  variant = 'default',
  onDismiss,
  children,
  ...props
}) {
  // Determine whether the first child is an svg/icon element
  const childArray = React.Children.toArray(children);
  const hasIconChild = childArray.some(
    (child) =>
      React.isValidElement(child) &&
      typeof child.type !== 'string' &&
      !('title' in (child.props ?? {})) &&
      !child.props?.['data-slot'],
  );

  const DefaultIcon = DEFAULT_ICONS[variant];

  return (
    <div
      data-slot='alert'
      role='alert'
      className={cn(
        alertVariants({ variant }),
        onDismiss && 'pr-10',
        className,
      )}
      {...props}
    >
      {!hasIconChild && <DefaultIcon aria-hidden='true' />}
      <div className='flex-1 space-y-1'>{children}</div>

      {onDismiss && (
        <button
          type='button'
          aria-label='Dismiss'
          onClick={onDismiss}
          className='absolute top-3 right-3 rounded-sm opacity-60 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
        >
          <XIcon className='size-4' />
        </button>
      )}
    </div>
  );
}

function AlertTitle({ className, ...props }) {
  return (
    <p
      data-slot='alert-title'
      className={cn('font-medium leading-none tracking-tight', className)}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }) {
  return (
    <p
      data-slot='alert-description'
      className={cn('text-sm opacity-90', className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
