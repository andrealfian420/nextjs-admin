'use client';

import * as React from 'react';
import { Switch as SwitchPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';

function Switch({ className, ...props }) {
  return (
    <SwitchPrimitive.Root
      data-slot='switch'
      className={cn(
        'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/60',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot='switch-thumb'
        className='pointer-events-none block size-4 rounded-full bg-background shadow-sm ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0'
      />
    </SwitchPrimitive.Root>
  );
}

/**
 * SwitchField — Switch + Label pair with optional description
 *
 * Usage:
 *   <SwitchField
 *     id="notifications"
 *     label="Email notifications"
 *     description="Receive updates via email"
 *     checked={enabled}
 *     onCheckedChange={setEnabled}
 *   />
 */
function SwitchField({ id, label, description, className, ...switchProps }) {
  return (
    <div
      data-slot='switch-field'
      className={cn('flex items-center justify-between gap-4', className)}
    >
      <div className='grid gap-0.5'>
        <label
          htmlFor={id}
          className='text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50'
        >
          {label}
        </label>
        {description && (
          <p className='text-xs text-muted-foreground'>{description}</p>
        )}
      </div>
      <Switch id={id} {...switchProps} />
    </div>
  );
}

export { Switch, SwitchField };
