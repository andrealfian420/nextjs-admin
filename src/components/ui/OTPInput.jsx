'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * OTPInput — a segmented one-time password / verification code input.
 *
 * - Controlled via `value` (string) + `onChange(string)`.
 * - Supports numeric-only or alphanumeric mode via `pattern`.
 * - Pasting the full code is handled automatically.
 * - Auto-focuses the next slot on character entry.
 *
 * Usage:
 *   <OTPInput length={6} value={code} onChange={setCode} />
 */
function OTPInput({
  length = 6,
  value = '',
  onChange,
  pattern = /^[0-9]$/, // restrict to digits by default
  disabled = false,
  className,
  inputClassName,
  'aria-invalid': ariaInvalid,
  ...props
}) {
  const inputsRef = React.useRef([]);

  // Pad or trim value to exactly `length` characters
  const slots = Array.from({ length }, (_, i) => value[i] ?? '');

  const setSlot = (index, char) => {
    const next = [...slots];
    next[index] = char;
    onChange?.(next.join(''));
  };

  const handleChange = (index, e) => {
    const raw = e.target.value;
    // Take only the last typed character that matches the pattern
    const char =
      raw
        .split('')
        .reverse()
        .find((c) => pattern.test(c)) ?? '';
    setSlot(index, char);
    if (char && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (slots[index]) {
        setSlot(index, '');
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
        setSlot(index - 1, '');
      }
    }
    if (e.key === 'ArrowLeft' && index > 0)
      inputsRef.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < length - 1)
      inputsRef.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData('text')
      .split('')
      .filter((c) => pattern.test(c))
      .slice(0, length);
    if (!pasted.length) return;
    const next = [...slots];
    pasted.forEach((c, i) => {
      next[i] = c;
    });
    onChange?.(next.join(''));
    const focusIndex = Math.min(pasted.length, length - 1);
    inputsRef.current[focusIndex]?.focus();
  };

  const handleFocus = (e) => e.target.select();

  return (
    <div
      data-slot='otp-input'
      aria-invalid={ariaInvalid}
      className={cn('flex items-center gap-2', className)}
    >
      {slots.map((char, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type='text'
          inputMode='numeric'
          autoComplete='one-time-code'
          maxLength={1}
          value={char}
          disabled={disabled}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={handleFocus}
          className={cn(
            'h-10 w-10 rounded-md border border-input bg-transparent text-center text-sm font-medium shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30',
            char && 'border-ring/60',
            inputClassName,
          )}
          {...props}
        />
      ))}
    </div>
  );
}

export { OTPInput };
