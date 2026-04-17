'use client';

import * as React from 'react';
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui';
import { CircleIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

function RadioGroup({ className, ...props }) {
  return (
    <RadioGroupPrimitive.Root
      data-slot='radio-group'
      className={cn('grid gap-2', className)}
      {...props}
    />
  );
}

function RadioGroupItem({ className, ...props }) {
  return (
    <RadioGroupPrimitive.Item
      data-slot='radio-group-item'
      className={cn(
        'peer aspect-square size-4 shrink-0 rounded-full border border-input shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[state=checked]:border-primary data-[state=checked]:bg-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot='radio-group-indicator'
        className='flex items-center justify-center'
      >
        <CircleIcon className='size-2 fill-primary-foreground text-primary-foreground' />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

/**
 * RadioGroupField — RadioGroupItem + Label pair
 *
 * Usage:
 *   <RadioGroup value={role} onValueChange={setRole}>
 *     <RadioGroupField id="admin" value="admin" label="Admin" description="Full access" />
 *     <RadioGroupField id="user"  value="user"  label="User"  description="Read only" />
 *   </RadioGroup>
 */
function RadioGroupField({ id, value, label, description, className }) {
  return (
    <div
      data-slot='radio-group-field'
      className={cn('flex items-start gap-2', className)}
    >
      <RadioGroupItem id={id} value={value} className='mt-0.5' />
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
    </div>
  );
}

export { RadioGroup, RadioGroupItem, RadioGroupField };
