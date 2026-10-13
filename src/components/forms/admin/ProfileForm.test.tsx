import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError } from 'axios';

const handleLogout = vi.fn();
const setPendingToast = vi.fn();
const setStoreUser = vi.fn();
const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

vi.mock('@/hooks/useLogout', () => ({
  useLogout: () => ({ handleLogout }),
}));

vi.mock('@/store/useAuthStore', () => ({
  useAuthStore: (selector: (s: unknown) => unknown) => selector({ setUser: setStoreUser }),
}));

vi.mock('@/store/usePendingToastStore', () => ({
  usePendingToastStore: (selector: (s: unknown) => unknown) =>
    selector({ setPendingToast }),
}));

// Keep the real multipart builder: the form hands the service a ProfileInput.
vi.mock('@/services/authService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/authService')>()),
  authService: { profile: vi.fn(), updateProfile: vi.fn() },
}));

vi.mock('@/components/ui/Toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import ProfileForm from '@/components/forms/admin/ProfileForm';
import { authService, toProfileFormData } from '@/services/authService';
import {
  actionBarLabels,
  confirmDiscard,
  discardButton,
} from '@/test/admin-form-actions';
import type { ProfileInput } from '@/types/user';

const mockedProfile = vi.mocked(authService.profile);
const mockedUpdate = vi.mocked(authService.updateProfile);

const profile = {
  slug: 'ada',
  name: 'Ada Lovelace',
  email: 'ada@example.test',
  avatar: 'ada.png',
  avatarUrl: 'https://media.example.test/ada.png',
  role: { title: 'Editor', access: [] },
};

const png = () => new File(['x'], 'ada.png', { type: 'image/png' });

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

/** The multipart body the service builds from the nth update. */
const sent = (call = 0) =>
  toProfileFormData(mockedUpdate.mock.calls[call][0] as ProfileInput);

beforeEach(() => {
  // authService resolves with the AxiosResponse, so the envelope is nested.
  mockedProfile.mockResolvedValue({ data: { data: profile } } as never);
  mockedUpdate.mockResolvedValue({ data: { data: profile } } as never);
});

describe('ProfileForm — loading', () => {
  it('prefills from GET /profile and keeps the email read-only', async () => {
    render(<ProfileForm />);

    expect(await screen.findByLabelText(/^Full Name/)).toHaveValue(profile.name);
    const email = screen.getByLabelText(/^Email/);
    expect(email).toHaveValue(profile.email);
    expect(email).toHaveAttribute('readonly');
    expect(screen.getByAltText('Avatar preview')).toHaveAttribute('src', profile.avatarUrl);
  });

  it('offers a retry when the profile fails to load', async () => {
    const u = userEvent.setup();
    mockedProfile.mockRejectedValueOnce(new AxiosError('Network Error'));
    render(<ProfileForm />);

    await u.click(await screen.findByRole('button', { name: 'Try again' }));

    expect(await screen.findByLabelText(/^Full Name/)).toHaveValue(profile.name);
  });
});

describe('ProfileForm — submit', () => {
  it('rejects a weak password', async () => {
    const u = userEvent.setup();
    render(<ProfileForm />);

    await u.type(await screen.findByLabelText(/^Password/), 'secret');
    await u.click(screen.getByRole('button', { name: 'Save' }));

    expect(
      await screen.findByText(/Password must be at least 8 characters long/),
    ).toBeInTheDocument();
    expect(mockedUpdate).not.toHaveBeenCalled();
  });

  // Also guards the form's 'use no memo': compiled, the Discard after a save left the typed
  // draft in the input.
  it('saves the name without a password, makes it the baseline and syncs the store', async () => {
    const u = userEvent.setup();
    const updated = { ...profile, name: 'Ada L.' };
    mockedUpdate.mockResolvedValue({ data: { data: updated } } as never);
    render(<ProfileForm />);

    const name = await screen.findByLabelText(/^Full Name/);
    await u.clear(name);
    await u.type(name, 'Ada L.');
    await u.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(setStoreUser).toHaveBeenCalledWith(updated));
    expect(Object.fromEntries(sent().entries())).toEqual({ name: 'Ada L.' });
    expect(handleLogout).not.toHaveBeenCalled();
    await waitFor(() => expect(discardButton()).toBeDisabled());

    await u.type(screen.getByLabelText(/^Full Name/), ' draft');
    await confirmDiscard(u);
    expect(screen.getByLabelText(/^Full Name/)).toHaveValue('Ada L.');
    expect(mockedProfile).toHaveBeenCalledTimes(1);
  });

  it('queues a notice and clears the local session after a password change', async () => {
    const u = userEvent.setup();
    render(<ProfileForm />);

    await u.type(await screen.findByLabelText(/^Password/), 'Secret123!');
    await u.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(handleLogout).toHaveBeenCalledWith('PROFILE_PASSWORD_CHANGED'),
    );
    expect(sent().get('password')).toBe('Secret123!');
    // Queued before leaving, so it shows on the login page.
    expect(setPendingToast.mock.invocationCallOrder[0]).toBeLessThan(
      handleLogout.mock.invocationCallOrder[0],
    );
    expect(setStoreUser).not.toHaveBeenCalled();
  });

  it('shows API field errors next to their fields', async () => {
    const u = userEvent.setup();
    mockedUpdate.mockRejectedValue(
      apiError(400, 'Validation failed', [{ field: 'name', message: 'Name is not allowed' }]),
    );
    render(<ProfileForm />);

    await u.click(await screen.findByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Name is not allowed')).toBeInTheDocument();
  });
});

describe('ProfileForm — avatar', () => {
  it('sends a new avatar, then shows the stored one and stops sending it', async () => {
    const u = userEvent.setup();
    const updated = { ...profile, avatarUrl: 'https://media.example.test/new.png' };
    mockedUpdate.mockResolvedValue({ data: { data: updated } } as never);
    render(<ProfileForm />);

    await u.upload(await screen.findByLabelText(/^Avatar/), png());
    expect(screen.getByAltText('Avatar preview')).toHaveAttribute(
      'src',
      expect.stringMatching(/^blob:/),
    );
    await u.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(screen.getByAltText('Avatar preview')).toHaveAttribute('src', updated.avatarUrl),
    );
    expect(sent(0).get('avatar')).toBeInstanceOf(File);

    await u.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(mockedUpdate).toHaveBeenCalledTimes(2));
    expect(sent(1).get('avatar')).toBeNull();
  });

  it('rejects a wrong-typed avatar without replacing the preview', async () => {
    const u = userEvent.setup({ applyAccept: false });
    render(<ProfileForm />);

    await u.upload(
      await screen.findByLabelText(/^Avatar/),
      new File(['x'], 'a.gif', { type: 'image/gif' }),
    );

    expect(
      await screen.findByText('Only JPG, PNG, and WEBP formats are allowed'),
    ).toBeInTheDocument();
    expect(screen.getByAltText('Avatar preview')).toHaveAttribute('src', profile.avatarUrl);
    await u.click(screen.getByRole('button', { name: 'Save' }));
    expect(mockedUpdate).not.toHaveBeenCalled();
  });
});

describe('ProfileForm — action bar', () => {
  it('shows Back, Discard and Save; Back opens the dashboard', async () => {
    const u = userEvent.setup();
    render(<ProfileForm />);

    await screen.findByLabelText(/^Full Name/);
    expect(actionBarLabels()).toEqual(['Back', 'Discard changes', 'Save']);
    expect(discardButton()).toBeDisabled();
    await u.click(screen.getByRole('button', { name: /Back/ }));
    expect(push).toHaveBeenCalledWith('/admin');
  });

  it('discards a new avatar back to the stored one', async () => {
    const u = userEvent.setup();
    render(<ProfileForm />);

    await u.upload(await screen.findByLabelText(/^Avatar/), png());
    expect(discardButton()).toBeEnabled();
    await confirmDiscard(u);

    expect(screen.getByAltText('Avatar preview')).toHaveAttribute('src', profile.avatarUrl);
    expect(discardButton()).toBeDisabled();
  });

  it('discards a typed password, so saving neither sends it nor logs out', async () => {
    const u = userEvent.setup();
    render(<ProfileForm />);

    await u.type(await screen.findByLabelText(/^Password/), 'Secret123!');
    await confirmDiscard(u);

    expect(screen.getByLabelText(/^Password/)).toHaveValue('');
    await u.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(mockedUpdate).toHaveBeenCalledTimes(1));
    expect(sent().has('password')).toBe(false);
    expect(setPendingToast).not.toHaveBeenCalled();
    expect(handleLogout).not.toHaveBeenCalled();
  });
});
