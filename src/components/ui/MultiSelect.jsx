'use client';

import * as React from 'react';
import { Popover as PopoverPrimitive } from 'radix-ui';
import { CheckIcon, ChevronDownIcon, SearchIcon, XIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

/**
 * MultiSelect — multi-value select with badge display and optional search.
 *
 * Usage:
 *   const [values, setValues] = React.useState([]);
 *
 *   <MultiSelect
 *     options={[{ value: 'admin', label: 'Admin' }, { value: 'user', label: 'User' }]}
 *     value={values}
 *     onChange={setValues}
 *     placeholder="Select roles..."
 *     searchable
 *     maxCount={3}
 *   />
 */
function MultiSelect({
  options = [],
  value = [],
  onChange,
  placeholder = 'Select options...',
  searchable = false,
  maxCount = 3,
  disabled = false,
  className,
  'aria-invalid': ariaInvalid,
  ...triggerProps
}) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  const selectedSet = new Set(value);

  const filteredOptions = searchable
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase()),
      )
    : options;

  const toggle = (optValue) => {
    const next = selectedSet.has(optValue)
      ? value.filter((v) => v !== optValue)
      : [...value, optValue];
    onChange?.(next);
  };

  const clearAll = (e) => {
    e.stopPropagation();
    onChange?.([]);
  };

  const removeItem = (e, optValue) => {
    e.stopPropagation();
    onChange?.(value.filter((v) => v !== optValue));
  };

  const visibleValues = value.slice(0, maxCount);
  const overflowCount = value.length - maxCount;

  return (
    <PopoverPrimitive.Root
      open={open}
      onOpenChange={disabled ? undefined : setOpen}
    >
      <PopoverPrimitive.Trigger asChild>
        <button
          type='button'
          role='combobox'
          aria-expanded={open}
          aria-invalid={ariaInvalid}
          disabled={disabled}
          data-slot='multi-select-trigger'
          className={cn(
            'flex min-h-9 w-full items-center justify-between gap-1.5 rounded-md border border-input bg-transparent px-2.5 py-1.5 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
            className,
          )}
          {...triggerProps}
        >
          {/* Selected items */}
          <div className='flex flex-1 flex-wrap items-center gap-1 overflow-hidden'>
            {value.length === 0 ? (
              <span className='text-muted-foreground'>{placeholder}</span>
            ) : (
              <>
                {visibleValues.map((v) => {
                  const opt = options.find((o) => o.value === v);
                  return (
                    <Badge
                      key={v}
                      variant='secondary'
                      className='gap-0.5 pr-0.5'
                    >
                      {opt?.label ?? v}
                      <span
                        role='button'
                        tabIndex={-1}
                        aria-label={`Remove ${opt?.label ?? v}`}
                        onClick={(e) => removeItem(e, v)}
                        className='ml-0.5 rounded-[2px] p-0.5 hover:bg-foreground/10'
                      >
                        <XIcon className='size-2.5' />
                      </span>
                    </Badge>
                  );
                })}
                {overflowCount > 0 && (
                  <Badge variant='secondary'>+{overflowCount} more</Badge>
                )}
              </>
            )}
          </div>

          {/* Right-side controls */}
          <div className='flex shrink-0 items-center gap-0.5'>
            {value.length > 0 && (
              <span
                role='button'
                tabIndex={-1}
                aria-label='Clear all'
                onClick={clearAll}
                className='rounded-[2px] p-0.5 text-muted-foreground hover:text-foreground'
              >
                <XIcon className='size-3.5' />
              </span>
            )}
            <ChevronDownIcon className='size-4 text-muted-foreground' />
          </div>
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          data-slot='multi-select-content'
          align='start'
          sideOffset={4}
          /* match trigger width */
          style={{ width: 'var(--radix-popover-trigger-width)' }}
          className='z-50 rounded-md border border-border bg-white text-foreground shadow-md outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 dark:bg-zinc-950 dark:text-zinc-50 dark:border-zinc-800'
        >
          {/* Search */}
          {searchable && (
            <div className='flex items-center border-b px-3'>
              <SearchIcon className='size-4 shrink-0 text-muted-foreground' />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Search...'
                className='h-9 w-full bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground'
              />
            </div>
          )}

          {/* Options list */}
          <div className='max-h-48 overflow-y-auto p-1'>
            {filteredOptions.length === 0 ? (
              <p className='py-4 text-center text-sm text-muted-foreground'>
                No options found.
              </p>
            ) : (
              filteredOptions.map((opt) => (
                <button
                  key={opt.value}
                  type='button'
                  onClick={() => toggle(opt.value)}
                  className='flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground'
                >
                  <div
                    className={cn(
                      'flex size-4 items-center justify-center rounded-[4px] border border-input',
                      selectedSet.has(opt.value) &&
                        'border-primary bg-primary text-primary-foreground',
                    )}
                  >
                    {selectedSet.has(opt.value) && (
                      <CheckIcon className='size-3' />
                    )}
                  </div>
                  {opt.label}
                </button>
              ))
            )}
          </div>

          {/* Clear all footer */}
          {value.length > 0 && (
            <div className='border-t p-1'>
              <button
                type='button'
                onClick={() => onChange?.([])}
                className='w-full rounded-sm px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              >
                Clear all
              </button>
            </div>
          )}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

export { MultiSelect };
