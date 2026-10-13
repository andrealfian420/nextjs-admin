import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError } from 'axios';

vi.mock('@/services/authService', () => ({
  authService: { forgotPassword: vi.fn() },
}));

import ForgotPasswordForm from '@/components/forms/ForgotPasswordForm';
import { authService } from '@/services/authService';

const mockedForgot = vi.mocked(authService.forgotPassword);

const send = async (u: ReturnType<typeof userEvent.setup>, email: string) => {
  await u.type(screen.getByLabelText('Email'), email);
  await u.click(screen.getByRole('button', { name: 'Send reset link' }));
};

beforeEach(() => {
  mockedForgot.mockResolvedValue({ data: { data: null } } as never);
});

describe('ForgotPasswordForm', () => {
  it('validates the email before calling the backend', async () => {
    const u = userEvent.setup();
    render(<ForgotPasswordForm />);

    await send(u, 'not-an-email');

    expect(await screen.findByText('Invalid email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    expect(mockedForgot).not.toHaveBeenCalled();
  });

  it('requests the link and confirms without revealing whether the account exists', async () => {
    const u = userEvent.setup();
    render(<ForgotPasswordForm />);

    await send(u, 'ada@example.test');

    expect(await screen.findByText(/If an account exists for that email/)).toBeInTheDocument();
    expect(mockedForgot).toHaveBeenCalledWith({ email: 'ada@example.test' });
  });

  it("shows the backend's message when the request is refused", async () => {
    const u = userEvent.setup();
    const err = new AxiosError('Too Many Requests');
    err.response = {
      data: { success: false, message: 'Too many reset requests, try again later' },
      status: 429,
      statusText: 'Too Many Requests',
      headers: {},
      config: { headers: {} } as never,
    };
    mockedForgot.mockRejectedValue(err);
    render(<ForgotPasswordForm />);

    await send(u, 'ada@example.test');

    expect(
      await screen.findByText('Too many reset requests, try again later'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/If an account exists/)).toBeNull();
  });
});
