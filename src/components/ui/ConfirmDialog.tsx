'use client';

import { useState } from 'react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { AlertTriangleIcon } from 'lucide-react';
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

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Runs the confirmed action; the dialog closes when it settles. To report a failure, show
   * the error first, then throw: the dialog stays open so the user can retry or cancel.
   */
  onConfirm: () => Promise<void> | void;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  loadingLabel?: string;
  /** Icon in the red badge above the title. */
  icon?: React.ReactNode;
  confirmDisabled?: boolean;
}

/** Confirmation for a destructive action (delete, discard). */
export default function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  loadingLabel = 'Processing…',
  icon,
  confirmDisabled = false,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch {
      // Stay open; onConfirm reported the failure.
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !loading && onOpenChange(next)}>
      <DialogPortal>
        <DialogOverlay className='bg-black/40 supports-backdrop-filter:backdrop-blur-sm duration-150 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0' />

        <DialogPrimitive.Content
          className={cn(
            'fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2',
            'rounded-2xl bg-white p-5 sm:p-6 text-sm shadow-xl outline-none ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10',
            'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95',
            'data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
          )}
        >
          <div className='mb-4 flex size-12 items-center justify-center rounded-full bg-red-50 ring-8 ring-red-50/60 dark:bg-red-950/30 dark:ring-red-950/40'>
            {icon ?? <AlertTriangleIcon className='size-5 text-red-500' />}
          </div>

          <DialogHeader className='mb-4'>
            <DialogTitle className='text-base font-semibold text-zinc-800 dark:text-zinc-100'>
              {title}
            </DialogTitle>
            {/* Always rendered: Radix warns when a dialog has no description. */}
            <DialogDescription className='mt-1.5 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400'>
              {description}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className='gap-2 sm:gap-2'>
            <Button
              variant='outline'
              className='p-2.5 flex-1 cursor-pointer'
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              className='p-2.5 flex-1 cursor-pointer bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500/40 dark:bg-red-600 dark:hover:bg-red-700'
              onClick={handleConfirm}
              disabled={loading || confirmDisabled}
            >
              {loading ? (
                <>
                  <span className='size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent' />
                  {loadingLabel}
                </>
              ) : (
                confirmLabel
              )}
            </Button>
          </DialogFooter>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
