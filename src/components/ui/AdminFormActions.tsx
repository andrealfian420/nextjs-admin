'use client';

import { useState, type ReactNode } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Spinner } from '@/components/ui/Spinner';

/** One extra action rendered before the primary. */
export interface AdminFormSecondaryAction {
  label: string;
  icon?: ReactNode;
  /** Says what happens, e.g. that the action saves first. */
  title?: string;
  disabled?: boolean;
  onClick: () => void;
}

export interface AdminFormActionsProps {
  /** Picks the primary label and the Discard message (edit vs create). */
  isEdit: boolean;
  /** Primary label on create. */
  createLabel?: string;
  /** Primary label on edit. */
  saveLabel?: string;
  isSubmitting: boolean;
  /** The form differs from its loaded (or empty) baseline; enables Discard changes. */
  isDirty: boolean;
  /** False when the user may not write this record: only Back is offered. */
  canSave?: boolean;
  /** A domain rule blocks saving; blocks the primary only. */
  submitDisabled?: boolean;
  /** Leaves the form; the caller decides where to (never history-based). */
  onBack: () => void;
  /**
   * Restores the form's local baseline after the user confirmed; no request needed. To
   * report a failure, show the error first, then throw: the dialog stays open.
   */
  onDiscard: () => void | Promise<void>;
  secondaryAction?: AdminFormSecondaryAction;
}

/**
 * The action bar of an admin form: Back and Discard changes on the left, an optional
 * secondary action and the primary submit on the right. Render it as the form's last child;
 * `position: sticky` keeps it at the bottom of the visible area while a long form scrolls.
 */
export function AdminFormActions({
  isEdit,
  createLabel = 'Create',
  saveLabel = 'Save',
  isSubmitting,
  isDirty,
  canSave = true,
  submitDisabled = false,
  onBack,
  onDiscard,
  secondaryAction,
}: AdminFormActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div
      data-slot='admin-form-actions'
      className='sticky bottom-0 z-20 mt-6 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95'
    >
      <div className='flex items-center gap-1'>
        <Button
          type='button'
          variant='ghost'
          className='cursor-pointer'
          disabled={isSubmitting}
          onClick={onBack}
        >
          <ArrowLeft size={14} aria-hidden /> Back
        </Button>
        {canSave && (
          <Button
            type='button'
            variant='ghost'
            className='cursor-pointer text-zinc-500 dark:text-zinc-400'
            disabled={!isDirty || isSubmitting}
            onClick={() => setConfirmOpen(true)}
          >
            <RotateCcw size={14} aria-hidden /> Discard changes
          </Button>
        )}
      </div>

      {canSave && (
        // ml-auto keeps this group right-aligned when it wraps onto its own line.
        <div className='ml-auto flex flex-wrap items-center justify-end gap-2'>
          {secondaryAction && (
            <Button
              type='button'
              variant='outline'
              className='cursor-pointer'
              disabled={secondaryAction.disabled || isSubmitting}
              title={secondaryAction.title}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.icon} {secondaryAction.label}
            </Button>
          )}
          <Button
            type='submit'
            disabled={isSubmitting || submitDisabled}
            className='cursor-pointer bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200'
          >
            {isSubmitting ? (
              <>
                <Spinner size='sm' className='text-current' /> Saving…
              </>
            ) : isEdit ? (
              saveLabel
            ) : (
              createLabel
            )}
          </Button>
        </div>
      )}

      {canSave && (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          onConfirm={onDiscard}
          title='Discard changes?'
          description={
            isEdit
              ? 'The form goes back to the last saved version. Unsaved changes are lost.'
              : 'The form is cleared. Everything you entered is lost.'
          }
          confirmLabel='Discard'
          loadingLabel='Discarding…'
          icon={<RotateCcw className='size-5 text-red-500' />}
        />
      )}
    </div>
  );
}
