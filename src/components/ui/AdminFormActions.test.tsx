import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Eye } from 'lucide-react';

import { AdminFormActions } from '@/components/ui/AdminFormActions';
import {
  actionBarLabels,
  cancelDiscard,
  confirmDiscard,
  discardButton,
} from '@/test/admin-form-actions';

type Props = Parameters<typeof AdminFormActions>[0];

const renderBar = (props: Partial<Props> = {}) => {
  const handlers = {
    onBack: vi.fn(),
    onDiscard: vi.fn(),
    onSubmit: vi.fn((e: React.FormEvent) => e.preventDefault()),
  };
  render(
    <form onSubmit={handlers.onSubmit}>
      <AdminFormActions
        isEdit={false}
        createLabel='Create Thing'
        isSubmitting={false}
        isDirty={false}
        onBack={handlers.onBack}
        onDiscard={handlers.onDiscard}
        {...props}
      />
    </form>,
  );
  return handlers;
};

const button = (name: RegExp | string) => screen.getByRole('button', { name });

describe('AdminFormActions — layout', () => {
  it('orders Back, Discard, the secondary action and the primary', () => {
    const onPreview = vi.fn();
    renderBar({
      isEdit: true,
      secondaryAction: { label: 'Preview', icon: <Eye size={14} />, onClick: onPreview },
    });

    expect(actionBarLabels()).toEqual(['Back', 'Discard changes', 'Preview', 'Save']);
    expect(button('Save')).toHaveAttribute('type', 'submit');
    for (const name of [/Back/, /Discard changes/, /Preview/])
      expect(button(name)).toHaveAttribute('type', 'button');
  });

  it('labels the primary by mode, with a custom save label', () => {
    const { unmount } = render(
      <AdminFormActions
        isEdit={false}
        isSubmitting={false}
        isDirty={false}
        onBack={vi.fn()}
        onDiscard={vi.fn()}
      />,
    );
    expect(button('Create')).toBeInTheDocument();
    unmount();

    renderBar({ isEdit: true, saveLabel: 'Save Order' });
    expect(actionBarLabels()).toEqual(['Back', 'Discard changes', 'Save Order']);
  });

  it('uses the create label on create', () => {
    renderBar();
    expect(button('Create Thing')).toHaveAttribute('type', 'submit');
  });
});

describe('AdminFormActions — Discard', () => {
  it('stays disabled while the form is clean', () => {
    renderBar();
    expect(discardButton()).toBeDisabled();
  });

  it('discards only after the confirmation, with the mode-specific message', async () => {
    const user = userEvent.setup();
    const { onDiscard } = renderBar({ isDirty: true, isEdit: true });

    await user.click(discardButton());
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Discard changes?')).toBeInTheDocument();
    expect(within(dialog).getByText(/goes back to the last saved version/)).toBeInTheDocument();
    expect(onDiscard).not.toHaveBeenCalled();

    await user.click(within(dialog).getByRole('button', { name: 'Discard' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(onDiscard).toHaveBeenCalledTimes(1);
  });

  it('explains that a create form is cleared', async () => {
    const user = userEvent.setup();
    renderBar({ isDirty: true });

    await user.click(discardButton());
    expect(await screen.findByText(/The form is cleared/)).toBeInTheDocument();
  });

  it('keeps the changes when the confirmation is cancelled', async () => {
    const user = userEvent.setup();
    const { onDiscard } = renderBar({ isDirty: true });

    await cancelDiscard(user);
    expect(onDiscard).not.toHaveBeenCalled();
  });

  it('keeps the dialog open when the Discard callback fails', async () => {
    const user = userEvent.setup();
    const onDiscard = vi.fn(() => {
      throw new Error('restore failed');
    });
    renderBar({ isDirty: true, onDiscard });

    await user.click(discardButton());
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Discard' }));

    expect(onDiscard).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Discard' })).toBeEnabled();

    // Cancelling afterwards still closes it.
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('closes after a successful Discard so it can be reopened', async () => {
    const user = userEvent.setup();
    const { onDiscard } = renderBar({ isDirty: true });

    await confirmDiscard(user);
    await confirmDiscard(user);
    expect(onDiscard).toHaveBeenCalledTimes(2);
  });
});

describe('AdminFormActions — states', () => {
  it('disables every action while submitting', () => {
    renderBar({
      isDirty: true,
      isSubmitting: true,
      secondaryAction: { label: 'Preview', onClick: vi.fn() },
    });

    expect(button(/Back/)).toBeDisabled();
    expect(discardButton()).toBeDisabled();
    expect(button(/Preview/)).toBeDisabled();
    expect(button(/Saving…/)).toBeDisabled();
  });

  it('offers only Back when the record cannot be saved', () => {
    renderBar({
      isEdit: true,
      isDirty: true,
      canSave: false,
      secondaryAction: { label: 'Preview', onClick: vi.fn() },
    });

    expect(actionBarLabels()).toEqual(['Back']);
    expect(button(/Back/)).toBeEnabled();
  });

  it('blocks only the primary on a domain guard', () => {
    renderBar({ isEdit: true, isDirty: true, submitDisabled: true });

    expect(button('Save')).toBeDisabled();
    expect(discardButton()).toBeEnabled();
    expect(button(/Back/)).toBeEnabled();
  });

  it('respects the secondary action’s own disabled flag', () => {
    renderBar({ secondaryAction: { label: 'Preview', disabled: true, onClick: vi.fn() } });
    expect(button(/Preview/)).toBeDisabled();
    expect(button('Create Thing')).toBeEnabled();
  });
});

describe('AdminFormActions — callbacks', () => {
  it('calls Back without submitting the form', async () => {
    const user = userEvent.setup();
    const { onBack, onSubmit } = renderBar({ isDirty: true });

    await user.click(button(/Back/));
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls the secondary action once without submitting the form', async () => {
    const user = userEvent.setup();
    const onPreview = vi.fn();
    const { onSubmit } = renderBar({
      isEdit: true,
      secondaryAction: {
        label: 'Preview',
        title: 'Saves your changes, then shows the preview',
        onClick: onPreview,
      },
    });

    const preview = button(/Preview/);
    expect(preview).toHaveAttribute('title', 'Saves your changes, then shows the preview');
    await user.click(preview);
    expect(onPreview).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the enclosing form from the primary', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderBar({ isEdit: true });

    await user.click(button('Save'));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
