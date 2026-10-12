'use client';

import { useState } from 'react';
import { Trash2Icon } from 'lucide-react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

/**
 * Reusable delete confirmation dialog.
 *
 * @example
 * <DeleteDialog
 *   open={!!deleteTarget}
 *   onOpenChange={(open) => !open && setDeleteTarget(null)}
 *   row={deleteTarget}
 *   onConfirm={handleDelete}
 * />
 */
interface DeleteDialogProps<T> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The row to delete, passed back to onConfirm. Null while nothing is selected. */
  row: T | null | undefined;
  /** Should report its own failure (e.g. a toast) and throw, so the dialog stays open. */
  onConfirm: (row: T) => Promise<void> | void;
  title?: string;
  description?: React.ReactNode;
}

// `name` or `title` of the row, for the default message.
function rowLabel(row: unknown): string {
  if (row && typeof row === 'object') {
    const { name, title } = row as { name?: unknown; title?: unknown };
    const label = typeof name === 'string' && name ? name : title;
    if (typeof label === 'string' && label) return label;
  }
  return 'this item';
}

export default function DeleteDialog<T>({
  open,
  onOpenChange,
  row,
  onConfirm,
  title = 'Delete Confirmation',
  description,
}: DeleteDialogProps<T>) {
  // Keep the last non-null row so the text doesn't flash to "this item" while closing.
  const [displayRow, setDisplayRow] = useState(row);
  if (row && row !== displayRow) setDisplayRow(row);

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={() => (displayRow ? onConfirm(displayRow) : undefined)}
      confirmDisabled={!displayRow}
      title={title}
      icon={<Trash2Icon className='size-5 text-red-500' />}
      confirmLabel='Delete'
      loadingLabel='Deleting…'
      description={
        description ?? (
          <>
            Are you sure you want to delete{' '}
            <span className='font-medium text-zinc-700 dark:text-zinc-300'>
              {rowLabel(displayRow)}
            </span>
            ? This action{' '}
            <span className='font-medium text-red-500'>cannot be undone</span>.
          </>
        )
      }
    />
  );
}
