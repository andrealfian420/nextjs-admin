'use client';

import { useRef, useState } from 'react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { Trash2Icon } from 'lucide-react';
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

/**
 * Reusable delete confirmation dialog.
 *
 * @param {boolean}  open           - Controlled open state
 * @param {Function} onOpenChange   - Called when dialog requests open/close change
 * @param {object}   row            - The row object to delete (passed back to onConfirm)
 * @param {Function} onConfirm      - async (row) => void — called when user confirms
 * @param {string}   [title]        - Dialog title (default: "Delete Confirmation")
 * @param {string}   [description]  - Dialog body text (default: generic message)
 *
 * @example
 * <DeleteDialog
 *   open={!!deleteTarget}
 *   onOpenChange={(open) => !open && setDeleteTarget(null)}
 *   row={deleteTarget}
 *   onConfirm={handleDelete}
 * />
 */
export default function DeleteDialog({
  open,
  onOpenChange,
  row,
  onConfirm,
  title = 'Delete Confirmation',
  description,
}) {
  const [loading, setLoading] = useState(false);

  // Retain last non-null row so content doesn't flash to "this item" during close
  const displayRowRef = useRef(row);
  if (row) displayRowRef.current = row;
  const displayRow = displayRowRef.current;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm(displayRow);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className='bg-black/40 supports-backdrop-filter:backdrop-blur-sm duration-150 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0' />

        <DialogPrimitive.Content
          className={cn(
            'fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2',
            'rounded-2xl bg-white p-6 text-sm shadow-xl outline-none ring-1 ring-black/5',
            'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95',
            'data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
          )}
        >
          {/* Icon */}
          <div className='mb-4 flex size-12 items-center justify-center rounded-full bg-red-50 ring-8 ring-red-50/60'>
            <Trash2Icon className='size-5 text-red-500' />
          </div>

          <DialogHeader className='mb-4'>
            <DialogTitle className='text-base font-semibold text-slate-800'>
              {title}
            </DialogTitle>
            <DialogDescription className='mt-1.5 text-sm leading-relaxed text-slate-500'>
              {description ?? (
                <>
                  Are you sure you want to delete{' '}
                  <span className='font-medium text-slate-700'>
                    {displayRow?.name ?? displayRow?.title ?? 'this item'}
                  </span>
                  ? This action{' '}
                  <span className='font-medium text-red-500'>
                    cannot be undone
                  </span>
                  .
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className='gap-2 sm:gap-2'>
            <Button
              variant='outline'
              className='flex-1 cursor-pointer'
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              className='flex-1 cursor-pointer bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500/40'
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className='size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent' />
                  Deleting…
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
