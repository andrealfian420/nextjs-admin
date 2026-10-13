import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError } from 'axios';

const replace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}));

vi.mock('@/services/authService', () => ({
  authService: { resetPassword: vi.fn() },
}));

vi.mock('@/components/ui/Toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import ResetPasswordForm from '@/components/forms/ResetPasswordForm';
import { authService } from '@/services/authService';
import { toast } from '@/components/ui/Toast';

const mockedReset = vi.mocked(authService.resetPassword);

const apiError = (
  status: number,
  message: string,
  errors?: { field: string; message: string }[],
) => {
  const err = new AxiosError(message);
  err.response = {
    data: { success: false, message, ...(errors ? { errors } : {}) },
    status,
    statusText: 'Error',
    headers: {},
    config: { headers: {} } as never,
  };
  return err;
};

const submit = async (
  u: ReturnType<typeof userEvent.setup>,
  password: string,
  confirm = password,
) => {
  await u.type(screen.getByLabelText('New password'), password);
  await u.type(screen.getByLabelText('Confirm new password'), confirm);
  await u.click(screen.getByRole('button', { name: 'Set new password' }));
};

beforeEach(() => {
  mockedReset.mockResolvedValue({ data: { data: null } } as never);
});

describe('ResetPasswordForm', () => {
  it('sends the token with the new password, then opens the login page', async () => {
    const u = userEvent.setup();
    render(<ResetPasswordForm token='t0k' />);

    await submit(u, 'Secret123!');

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/login'));
    expect(mockedReset).toHaveBeenCalledWith({ token: 't0k', newPassword: 'Secret123!' });
    expect(toast.success).toHaveBeenCalled();
  });

  it('enforces the password rule and the confirmation before calling the backend', async () => {
    const u = userEvent.setup();
    render(<ResetPasswordForm token='t0k' />);

    await submit(u, 'secret');
    expect(await screen.findByText(/Password must be at least 8 characters/)).toBeInTheDocument();

    await u.clear(screen.getByLabelText('New password'));
    await u.clear(screen.getByLabelText('Confirm new password'));
    await submit(u, 'Secret123!', 'Secret123?');
    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
    expect(mockedReset).not.toHaveBeenCalled();
  });

  it('explains a rejected token and links to a new request', async () => {
    const u = userEvent.setup();
    mockedReset.mockRejectedValue(apiError(400, 'Token expired'));
    render(<ResetPasswordForm token='t0k' />);

    await submit(u, 'Secret123!');

    expect(await screen.findByText(/Token expired/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Request a new link' })).toHaveAttribute(
      'href',
      '/forgot-password',
    );
    expect(replace).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Set new password' })).toBeEnabled();
  });

  it('shows a backend password rule next to the field', async () => {
    const u = userEvent.setup();
    mockedReset.mockRejectedValue(
      apiError(400, 'Validation failed', [
        { field: 'newPassword', message: 'Password is too common' },
      ]),
    );
    render(<ResetPasswordForm token='t0k' />);

    await submit(u, 'Secret123!');

    expect(await screen.findByText('Password is too common')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Request a new link' })).toBeNull();
  });

  it('offers a new request instead of the form when the link has no token', () => {
    render(<ResetPasswordForm token={null} />);

    expect(screen.getByText(/This reset link is incomplete/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Request a new link' })).toBeInTheDocument();
    expect(screen.queryByLabelText('New password')).toBeNull();
  });
});
