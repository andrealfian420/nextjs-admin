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
        <DialogOverlay className='bg-black/50 backdrop-blur-none duration-0 data-open:animate-none data-closed:animate-none' />

        <DialogPrimitive.Content
          className={cn(
            'fixed top-1/2 left-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2',
            'gap-6 rounded-xl bg-white p-6 text-sm shadow-lg outline-none',
            'data-open:animate-none data-closed:animate-none',
          )}
        >
          <DialogHeader>
            <div className='flex size-10 items-center justify-center rounded-full bg-red-100 mb-1'>
              <Trash2Icon className='size-5 text-red-600' />
            </div>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className='mt-3'>
              {description ?? (
                <>
                  Are you sure you want to delete{' '}
                  <span className='font-medium text-foreground'>
                    {displayRow?.name ?? displayRow?.title ?? 'this item'}
                  </span>
                  ? This action cannot be undone.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              className='cursor-pointer hover:bg-slate-100 hover:rounded-md p-3 hover:text-slate-900'
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              className='cursor-pointer hover:bg-red-600 hover:rounded-md p-3 hover:text-white'
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
