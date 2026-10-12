'use client';

import { useRef } from 'react';
import { Label } from '@/components/ui/Label';
import { cn } from '@/lib/utils';
import { RefreshCw, Upload, X } from 'lucide-react';

export interface ImagePickerFieldProps {
  id: string;
  label: string;
  hint: string;
  required?: boolean;
  /** Stored image URL, the caller's blob URL of a valid new pick, or null. */
  preview: string | null;
  /** A new, unsaved file is selected — valid or not. Enables Cancel. */
  isNewPick: boolean;
  error?: string;
  /** Called with the chosen file; never called when the dialog is dismissed. */
  onPick: (file: File) => void;
  /** Drop the new pick; the caller brings the stored image (or nothing) back. */
  onCancel: () => void;
  heightClass?: string;
  /** A picker hint only — the caller still validates type and size. */
  accept?: string;
  disabled?: boolean;
  previewFit?: 'cover' | 'contain';
}

const overlayButton =
  'inline-flex cursor-pointer items-center gap-1 rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-zinc-700 shadow-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-900/90 dark:text-zinc-200 dark:hover:bg-zinc-900';

/**
 * Image upload slot with preview: Upload when empty, Replace when a preview exists, Cancel
 * only for a new unsaved pick (also an invalid one, which has no preview). A stored image
 * can be replaced, never deleted, from here. Owns only the native file input: file state,
 * validation, blob URLs and the request stay with the form.
 */
export function ImagePickerField({
  id,
  label,
  hint,
  required,
  preview,
  isNewPick,
  error,
  onPick,
  onCancel,
  heightClass = 'h-48',
  accept = '.jpg,.jpeg,.png,.webp',
  disabled = false,
  previewFit = 'cover',
}: ImagePickerFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = error ? `${hintId} ${errorId}` : hintId;
  const openDialog = () => inputRef.current?.click();

  const cancel = isNewPick && (
    <button
      type='button'
      onClick={onCancel}
      disabled={disabled}
      aria-label={`Cancel new ${label}`}
      className={overlayButton}
    >
      <X size={12} aria-hidden /> Cancel
    </button>
  );

  return (
    <div className='space-y-1.5'>
      <Label htmlFor={id}>
        {label}
        {required && (
          <>
            <span className='text-red-500 ml-0.5' aria-hidden>
              *
            </span>
            <span className='sr-only'> (required)</span>
          </>
        )}
      </Label>
      <p id={hintId} className='text-xs text-zinc-500 dark:text-zinc-400 -mt-1'>
        {hint}
      </p>
      <input
        ref={inputRef}
        id={id}
        type='file'
        accept={accept}
        className='hidden'
        disabled={disabled}
        aria-required={required || undefined}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        onChange={(e) => {
          const file = e.target.files?.[0];
          // Reset so the same file can be picked again; an empty selection changes nothing.
          e.target.value = '';
          if (file) onPick(file);
        }}
      />
      {preview ? (
        <div
          className={cn(
            'relative w-full overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700',
            previewFit === 'contain' && 'bg-zinc-50 dark:bg-zinc-900',
            heightClass,
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- blob/remote preview, incl. SVG */}
          <img
            src={preview}
            alt={`${label} preview`}
            className={cn(
              'absolute inset-0 h-full w-full',
              previewFit === 'contain' ? 'object-contain' : 'object-cover',
            )}
          />
          <div className='absolute right-2 bottom-2 flex gap-1.5'>
            <button
              type='button'
              onClick={openDialog}
              disabled={disabled}
              aria-label={`Replace ${label}`}
              aria-describedby={describedBy}
              className={overlayButton}
            >
              <RefreshCw size={12} aria-hidden /> Replace
            </button>
            {cancel}
          </div>
        </div>
      ) : (
        <div className={cn('relative w-full', heightClass)}>
          <button
            type='button'
            onClick={openDialog}
            disabled={disabled}
            aria-describedby={describedBy}
            className={cn(
              'flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-400 dark:hover:text-zinc-200',
              error
                ? 'border-red-300 dark:border-red-800'
                : 'border-zinc-200 dark:border-zinc-700',
            )}
          >
            <Upload size={20} aria-hidden />
            <span className='text-xs mt-1'>Upload {label}</span>
          </button>
          {cancel && <div className='absolute right-2 bottom-2'>{cancel}</div>}
        </div>
      )}
      <p id={errorId} className='text-xs text-red-600 dark:text-red-400 min-h-2'>
        {error}
      </p>
    </div>
  );
}
