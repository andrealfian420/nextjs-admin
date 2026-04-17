'use client';

import * as React from 'react';
import { MinusIcon, PlusIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * NumberInput — a numeric input with increment / decrement stepper buttons.
 *
 * - Supports both controlled (`value` + `onChange`) and uncontrolled (`defaultValue`) modes.
 * - `onChange` receives a `number`, not a synthetic event.
 * - Keyboard: ArrowUp/ArrowDown adjust by `step`.
 *
 * Usage:
 *   <NumberInput
 *     value={qty}
 *     onChange={setQty}
 *     min={1}
 *     max={99}
 *     step={1}
 *   />
 */
function NumberInput({
  className,
  value,
  defaultValue = 0,
  onChange,
  min,
  max,
  step = 1,
  disabled = false,
  placeholder,
  'aria-invalid': ariaInvalid,
  ...props
}) {
  const controlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const currentValue = controlled ? value : internalValue;

  const clamp = (n) => {
    let result = n;
    if (min !== undefined && result < min) result = min;
    if (max !== undefined && result > max) result = max;
    return result;
  };

  const commit = (newValue) => {
    const clamped = clamp(newValue);
    if (!controlled) setInternalValue(clamped);
    onChange?.(clamped);
  };

  const handleInputChange = (e) => {
    const parsed = parseFloat(e.target.value);
    if (!isNaN(parsed)) commit(parsed);
  };

  const handleBlur = (e) => {
    const parsed = parseFloat(e.target.value);
    commit(isNaN(parsed) ? (min ?? 0) : parsed);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      commit(currentValue + step);
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      commit(currentValue - step);
    }
  };

  const canDecrement = min === undefined || currentValue > min;
  const canIncrement = max === undefined || currentValue < max;

  return (
    <div
      data-slot='number-input'
      aria-invalid={ariaInvalid}
      data-disabled={disabled || undefined}
      className={cn(
        'flex h-9 overflow-hidden rounded-md border border-input shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
        className,
      )}
    >
      {/* Decrement */}
      <button
        type='button'
        tabIndex={-1}
        disabled={disabled || !canDecrement}
        onClick={() => commit(currentValue - step)}
        className='flex items-center justify-center border-r border-input px-2.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40'
        aria-label='Decrease'
      >
        <MinusIcon className='size-3.5' />
      </button>

      {/* Input */}
      <input
        type='number'
        value={currentValue}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        placeholder={placeholder}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className='w-full min-w-0 bg-transparent px-2 text-center text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
        {...props}
      />

      {/* Increment */}
      <button
        type='button'
        tabIndex={-1}
        disabled={disabled || !canIncrement}
        onClick={() => commit(currentValue + step)}
        className='flex items-center justify-center border-l border-input px-2.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40'
        aria-label='Increase'
      >
        <PlusIcon className='size-3.5' />
      </button>
    </div>
  );
}

export { NumberInput };
