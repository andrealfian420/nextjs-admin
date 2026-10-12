import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeleteDialog from '@/components/ui/DeleteDialog';

const role = { slug: 'editor', title: 'Editor' };

describe('DeleteDialog', () => {
  it('names the row and passes it to onConfirm, then closes', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    const onOpenChange = vi.fn();
    render(<DeleteDialog open onOpenChange={onOpenChange} row={role} onConfirm={onConfirm} />);

    expect(screen.getByRole('dialog')).toHaveTextContent('Are you sure you want to delete Editor?');
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(onConfirm).toHaveBeenCalledWith(role);
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it('stays open and usable when onConfirm fails', async () => {
    const onConfirm = vi.fn().mockRejectedValue(new Error('409'));
    const onOpenChange = vi.fn();
    render(<DeleteDialog open onOpenChange={onOpenChange} row={role} onConfirm={onConfirm} />);

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Delete' })).toBeEnabled());
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('cannot confirm without a row', async () => {
    const onConfirm = vi.fn();
    render(<DeleteDialog open onOpenChange={vi.fn()} row={null} onConfirm={onConfirm} />);

    expect(screen.getByRole('dialog')).toHaveTextContent('delete this item?');
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
  });
});
