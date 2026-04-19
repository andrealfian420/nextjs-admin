'use client';

import * as React from 'react';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';
import { CheckIcon, MinusIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

function Checkbox({ className, indeterminate, ...props }) {
  return (
    <CheckboxPrimitive.Root
      data-slot='checkbox'
      checked={indeterminate ? 'indeterminate' : props.checked}
      className={cn(
        'cursor-pointer peer size-4 shrink-0 rounded-[4px] border border-input shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground dark:bg-input/30 dark:data-[state=checked]:bg-primary dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot='checkbox-indicator'
        className='flex items-center justify-center text-current transition-none'
      >
        {indeterminate ? (
          <MinusIcon className='size-3' />
        ) : (
          <CheckIcon className='size-3' />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

/**
 * CheckboxGroup — a labelled group of checkboxes
 *
 * Usage:
 *   <CheckboxGroup label="Roles" description="Choose one or more roles.">
 *     <CheckboxField id="admin" label="Admin" checked={...} onCheckedChange={...} />
 *     <CheckboxField id="user"  label="User"  checked={...} onCheckedChange={...} />
 *   </CheckboxGroup>
 */
function CheckboxGroup({ label, description, className, children }) {
  return (
    <fieldset data-slot='checkbox-group' className={cn('space-y-2', className)}>
      {label && (
        <legend className='text-sm font-medium leading-none text-foreground'>
          {label}
        </legend>
      )}
      {description && (
        <p className='text-xs text-muted-foreground'>{description}</p>
      )}
      <div className='space-y-2'>{children}</div>
    </fieldset>
  );
}

/**
 * CheckboxField — Checkbox + Label pair for use inside CheckboxGroup or standalone
 *
 * Usage:
 *   <CheckboxField id="agree" label="I agree to the terms" checked={...} onCheckedChange={...} />
 */
function CheckboxField({
  id,
  label,
  description,
  className,
  ...checkboxProps
}) {
  return (
    <div
      data-slot='checkbox-field'
      className={cn('flex items-start gap-2', className)}
    >
      <Checkbox id={id} className='mt-0.5' {...checkboxProps} />
      <div className='grid gap-0.5'>
        <label
          htmlFor={id}
          className='cursor-pointer text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50'
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

export { Checkbox, CheckboxGroup, CheckboxField };
