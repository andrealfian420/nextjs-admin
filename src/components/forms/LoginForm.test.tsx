import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError } from 'axios';

const replace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}));

vi.mock('@/services/authService', () => ({
  authService: { login: vi.fn(), profile: vi.fn() },
}));

vi.mock('@/components/ui/Toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import LoginForm from '@/components/forms/LoginForm';
import { authService } from '@/services/authService';
import { toast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/useAuthStore';

const mockedLogin = vi.mocked(authService.login);
const mockedProfile = vi.mocked(authService.profile);

const profile = {
  slug: 'ada',
  name: 'Ada',
  email: 'ada@example.test',
  avatar: null,
  role: { title: 'Editor', access: [] },
};

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

const signIn = async (u: ReturnType<typeof userEvent.setup>, password = 'Secret123!') => {
  await u.type(screen.getByLabelText('Email'), 'ada@example.test');
  await u.type(screen.getByLabelText('Password'), password);
  await u.click(screen.getByRole('button', { name: 'Sign in' }));
};

beforeEach(() => {
  mockedLogin.mockResolvedValue({ data: { data: { accessToken: 'token-123' } } } as never);
  mockedProfile.mockResolvedValue({ data: { data: profile } } as never);
});

describe('LoginForm', () => {
  it('validates the fields before calling the backend', async () => {
    const u = userEvent.setup();
    render(<LoginForm />);

    await u.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(mockedLogin).not.toHaveBeenCalled();
  });

  it('stores the token and profile, then replaces the page with the dashboard', async () => {
    const u = userEvent.setup();
    render(<LoginForm />);

    await signIn(u);

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/admin'));
    expect(mockedLogin).toHaveBeenCalledWith({
      email: 'ada@example.test',
      password: 'Secret123!',
    });
    expect(useAuthStore.getState().accessToken).toBe('token-123');
    expect(useAuthStore.getState().user).toEqual(profile);
  });

  it('shows API field errors next to their fields', async () => {
    const u = userEvent.setup();
    mockedLogin.mockRejectedValue(
      apiError(400, 'Validation failed', [{ field: 'email', message: 'Unknown account' }]),
    );
    render(<LoginForm />);

    await signIn(u);

    expect(await screen.findByText('Unknown account')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled();
  });

  it("toasts the backend's message, or a fallback when there is none", async () => {
    const u = userEvent.setup();
    mockedLogin.mockRejectedValueOnce(apiError(401, 'Invalid email or password'));
    mockedLogin.mockRejectedValueOnce(new AxiosError('Network Error'));
    render(<LoginForm />);

    await signIn(u);
    await waitFor(() =>
      expect(toast.error).toHaveBeenLastCalledWith('Invalid email or password', expect.anything()),
    );

    await u.click(screen.getByRole('button', { name: 'Sign in' }));
    await waitFor(() =>
      expect(toast.error).toHaveBeenLastCalledWith(
        'Login failed. Please check your credentials.',
        expect.anything(),
      ),
    );
    expect(replace).not.toHaveBeenCalled();
  });

  it('toggles the password visibility', async () => {
    const u = userEvent.setup();
    render(<LoginForm />);

    await u.click(screen.getByRole('button', { name: 'Show password' }));

    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Hide password' })).toBeInTheDocument();
  });
});
