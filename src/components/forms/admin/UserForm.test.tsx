import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError } from 'axios';

const push = vi.fn();
const notFound = vi.fn();
let routeParams: Record<string, string> = {};

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  useParams: () => routeParams,
  notFound: () => notFound(),
}));

// Keep the real multipart builder: the form hands the service a UserInput.
vi.mock('@/services/userService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/userService')>()),
  userService: { getUser: vi.fn(), createUser: vi.fn(), updateUser: vi.fn() },
}));

vi.mock('@/services/utilService', () => ({
  utilService: { getRoleOptions: vi.fn() },
}));

vi.mock('@/components/ui/Toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import UserForm from '@/components/forms/admin/UserForm';
import { toUserFormData, userService } from '@/services/userService';
import { utilService } from '@/services/utilService';
import { toast } from '@/components/ui/Toast';
import {
  actionBarLabels,
  confirmDiscard,
  discardButton,
} from '@/test/admin-form-actions';
import type { UserInput } from '@/types/user';

const mockedGet = vi.mocked(userService.getUser);
const mockedCreate = vi.mocked(userService.createUser);
const mockedUpdate = vi.mocked(userService.updateUser);
const mockedRoles = vi.mocked(utilService.getRoleOptions);

const roles = [
  { value: 1, label: 'Super Administrator' },
  { value: 2, label: 'Editor' },
];

const user = {
  slug: 'ada',
  name: 'Ada Lovelace',
  email: 'ada@example.test',
  avatar: 'ada.png',
  avatarUrl: 'https://media.example.test/ada.png',
  role: { id: 2, slug: 'editor', title: 'Editor' },
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

// The schema demands an uppercase letter, a digit and a symbol.
const STRONG_PASSWORD = 'Secret123!';

type Setup = ReturnType<typeof userEvent.setup>;

/** The avatar input is the picker's labelled native file input. */
const attachAvatar = (
  u: Setup,
  file = new File(['x'], 'ada.png', { type: 'image/png' }),
) => u.upload(screen.getByLabelText(/^Avatar/), file);

const pickRole = async (u: Setup, name: string) => {
  const trigger = await screen.findByRole('combobox', { name: /Role/ });
  trigger.focus();
  await u.keyboard('{Enter}');
  await u.click(await screen.findByRole('option', { name }));
};

/** The multipart body the service builds from what the form sent. */
const sentMultipart = (input: unknown) => toUserFormData(input as UserInput);

beforeEach(() => {
  routeParams = {};
  mockedRoles.mockResolvedValue({ data: roles } as never);
});

describe('UserForm — create', () => {
  it('blocks submission and reports the required fields when empty', async () => {
    const u = userEvent.setup();
    render(<UserForm />);

    await u.click(await screen.findByRole('button', { name: 'Create User' }));

    expect(await screen.findByText('Full name is required')).toBeInTheDocument();
    expect(screen.getByText('Role is required')).toBeInTheDocument();
    expect(screen.getByText('Avatar is required')).toBeInTheDocument();
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it('sends the fields, the role id and the avatar, then opens the list', async () => {
    const u = userEvent.setup();
    mockedCreate.mockResolvedValue({ data: user } as never);
    render(<UserForm />);

    await u.type(await screen.findByLabelText(/^Full Name/), 'Ada Lovelace');
    await u.type(screen.getByLabelText(/^Email/), 'ada@example.test');
    await u.type(screen.getByLabelText(/^Password/), STRONG_PASSWORD);
    await pickRole(u, 'Editor');
    await attachAvatar(u);
    await u.click(screen.getByRole('button', { name: 'Create User' }));

    await waitFor(() => expect(push).toHaveBeenCalledWith('/admin/users'));
    const body = sentMultipart(mockedCreate.mock.calls[0][0]);
    expect(Object.fromEntries(body.entries())).toMatchObject({
      name: 'Ada Lovelace',
      email: 'ada@example.test',
      roleId: '2',
      password: STRONG_PASSWORD,
    });
    expect(body.get('avatar')).toBeInstanceOf(File);
    expect(toast.success).toHaveBeenCalled();
  });

  it('shows API field errors next to their fields', async () => {
    const u = userEvent.setup();
    mockedCreate.mockRejectedValue(
      apiError(400, 'Validation failed', [
        { field: 'email', message: 'Email already registered' },
      ]),
    );
    render(<UserForm />);

    await u.type(await screen.findByLabelText(/^Full Name/), 'Ada Lovelace');
    await u.type(screen.getByLabelText(/^Email/), 'ada@example.test');
    await u.type(screen.getByLabelText(/^Password/), STRONG_PASSWORD);
    await pickRole(u, 'Editor');
    await attachAvatar(u);
    await u.click(screen.getByRole('button', { name: 'Create User' }));

    expect(await screen.findByText('Email already registered')).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Create User' })).toBeEnabled();
  });

  it('rejects a wrong type or an oversized avatar without a preview', async () => {
    // applyAccept off: the browser hint must not hide what the schema rejects.
    const u = userEvent.setup({ applyAccept: false });
    render(<UserForm />);
    await screen.findByLabelText(/^Full Name/);

    await attachAvatar(u, new File(['x'], 'a.gif', { type: 'image/gif' }));
    expect(
      await screen.findByText('Only JPG, PNG, and WEBP formats are allowed'),
    ).toBeInTheDocument();
    expect(screen.queryByAltText('Avatar preview')).toBeNull();

    await attachAvatar(
      u,
      new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'big.png', { type: 'image/png' }),
    );
    expect(await screen.findByText('Avatar size must not exceed 2MB')).toBeInTheDocument();
    expect(screen.queryByAltText('Avatar preview')).toBeNull();

    await u.click(screen.getByRole('button', { name: 'Cancel new Avatar' }));
    expect(screen.queryByText('Avatar size must not exceed 2MB')).toBeNull();
  });

  it('retries when the role options fail to load', async () => {
    const u = userEvent.setup();
    mockedRoles.mockRejectedValueOnce(new AxiosError('Network Error'));
    render(<UserForm />);

    await u.click(await screen.findByRole('button', { name: 'Try again' }));

    expect(await screen.findByLabelText(/^Full Name/)).toBeInTheDocument();
    expect(mockedRoles).toHaveBeenCalledTimes(2);
  });
});

describe('UserForm — edit', () => {
  beforeEach(() => {
    routeParams = { slug: user.slug };
    mockedGet.mockResolvedValue({ data: user } as never);
  });

  it('loads by slug and preselects the role from the user detail', async () => {
    render(<UserForm isEdit />);

    expect(await screen.findByLabelText(/^Full Name/)).toHaveValue(user.name);
    expect(mockedGet).toHaveBeenCalledWith(user.slug);
    expect(screen.getByLabelText(/^Email/)).toHaveValue(user.email);
    expect(screen.getByRole('combobox', { name: /Role/ })).toHaveTextContent('Editor');
    expect(screen.getByAltText('Avatar preview')).toHaveAttribute('src', user.avatarUrl);
  });

  it('keeps the current password and avatar when both are left alone', async () => {
    const u = userEvent.setup();
    mockedUpdate.mockResolvedValue({ data: user } as never);
    render(<UserForm isEdit />);

    await u.click(await screen.findByRole('button', { name: 'Save' }));

    await waitFor(() => expect(mockedUpdate).toHaveBeenCalled());
    expect(mockedUpdate.mock.calls[0][0]).toBe(user.slug);
    const body = sentMultipart(mockedUpdate.mock.calls[0][1]);
    expect([...body.keys()].sort()).toEqual(['email', 'name', 'roleId']);
  });

  it('cancels a new avatar back to the stored one and does not send it', async () => {
    const u = userEvent.setup();
    mockedUpdate.mockResolvedValue({ data: user } as never);
    render(<UserForm isEdit />);

    await screen.findByAltText('Avatar preview');
    await attachAvatar(u);
    expect(screen.getByAltText('Avatar preview')).toHaveAttribute(
      'src',
      expect.stringMatching(/^blob:/),
    );

    await u.click(screen.getByRole('button', { name: 'Cancel new Avatar' }));
    expect(screen.getByAltText('Avatar preview')).toHaveAttribute('src', user.avatarUrl);

    await u.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(mockedUpdate).toHaveBeenCalled());
    expect(sentMultipart(mockedUpdate.mock.calls[0][1]).get('avatar')).toBeNull();
  });

  it('locks the avatar picker while saving', async () => {
    const u = userEvent.setup();
    mockedUpdate.mockReturnValue(new Promise(() => {}));
    render(<UserForm isEdit />);

    await u.click(await screen.findByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Replace Avatar' })).toBeDisabled(),
    );
  });

  it('hands a missing user to the not-found page', async () => {
    mockedGet.mockRejectedValue(apiError(404, 'User not found'));
    render(<UserForm isEdit />);

    await waitFor(() => expect(notFound).toHaveBeenCalled());
  });

  it('offers a retry, not the not-found page, when loading fails', async () => {
    const u = userEvent.setup();
    mockedGet.mockRejectedValueOnce(apiError(503, 'Service unavailable'));
    render(<UserForm isEdit />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Failed to load the user.');
    expect(notFound).not.toHaveBeenCalled();

    await u.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByLabelText(/^Full Name/)).toHaveValue(user.name);
  });
});

describe('UserForm — action bar', () => {
  it('shows Back and Discard on the left and Create User on the right', async () => {
    const u = userEvent.setup();
    render(<UserForm />);

    await screen.findByLabelText(/^Full Name/);
    expect(actionBarLabels()).toEqual(['Back', 'Discard changes', 'Create User']);
    expect(discardButton()).toBeDisabled();
    await u.click(screen.getByRole('button', { name: /Back/ }));
    expect(push).toHaveBeenCalledWith('/admin/users');
  });

  it('discards a create back to the empty form, avatar included', async () => {
    const u = userEvent.setup();
    render(<UserForm />);

    await u.type(await screen.findByLabelText(/^Full Name/), 'Ada');
    await pickRole(u, 'Editor');
    await attachAvatar(u);
    await confirmDiscard(u);

    expect(screen.getByLabelText(/^Full Name/)).toHaveValue('');
    expect(screen.getByRole('combobox', { name: /Role/ })).toHaveTextContent('Select a role');
    expect(screen.queryByAltText('Avatar preview')).toBeNull();
    expect(discardButton()).toBeDisabled();
  });

  describe('edit', () => {
    beforeEach(() => {
      routeParams = { slug: user.slug };
      mockedGet.mockResolvedValue({ data: user } as never);
    });

    it('does not count showing the password as a change', async () => {
      const u = userEvent.setup();
      render(<UserForm isEdit />);

      const password = await screen.findByLabelText(/^Password/);
      await u.click(screen.getByRole('button', { name: 'Show password' }));
      expect(password).toHaveAttribute('type', 'text');
      expect(discardButton()).toBeDisabled();
    });

    it('treats a new avatar as a change and discards it back to the stored one', async () => {
      const u = userEvent.setup();
      render(<UserForm isEdit />);

      await screen.findByAltText('Avatar preview');
      await attachAvatar(u);
      expect(discardButton()).toBeEnabled();
      await confirmDiscard(u);

      expect(screen.getByAltText('Avatar preview')).toHaveAttribute('src', user.avatarUrl);
      expect(screen.queryByRole('button', { name: 'Cancel new Avatar' })).toBeNull();
      expect(discardButton()).toBeDisabled();
    });

    it('restores the loaded role and a blank password without refetching', async () => {
      const u = userEvent.setup();
      render(<UserForm isEdit />);

      await screen.findByLabelText(/^Full Name/);
      await pickRole(u, 'Super Administrator');
      await u.type(screen.getByLabelText(/^Password/), STRONG_PASSWORD);
      await confirmDiscard(u);

      expect(screen.getByRole('combobox', { name: /Role/ })).toHaveTextContent('Editor');
      expect(screen.getByLabelText(/^Password/)).toHaveValue('');
      expect(screen.getByLabelText(/^Full Name/)).toHaveValue(user.name);
      expect(discardButton()).toBeDisabled();
      expect(mockedGet).toHaveBeenCalledTimes(1);
    });

    it('restores the inputs on every Discard, not only the first', async () => {
      const u = userEvent.setup();
      render(<UserForm isEdit />);

      const name = await screen.findByLabelText(/^Full Name/);
      for (const draft of [' one', ' two']) {
        await u.type(name, draft);
        await confirmDiscard(u);
        expect(name).toHaveValue(user.name);
      }
    });
  });
});
