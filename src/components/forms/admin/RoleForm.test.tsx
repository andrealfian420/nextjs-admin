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

vi.mock('@/services/roleService', () => ({
  roleService: {
    getRole: vi.fn(),
    getAccessList: vi.fn(),
    getUserTypes: vi.fn(),
    createRole: vi.fn(),
    updateRole: vi.fn(),
  },
}));

vi.mock('@/components/ui/Toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import RoleForm from '@/components/forms/admin/RoleForm';
import { roleService } from '@/services/roleService';
import {
  actionBarLabels,
  confirmDiscard,
  discardButton,
} from '@/test/admin-form-actions';

const mockedGet = vi.mocked(roleService.getRole);
const mockedAccessList = vi.mocked(roleService.getAccessList);
const mockedUserTypes = vi.mocked(roleService.getUserTypes);
const mockedCreate = vi.mocked(roleService.createRole);
const mockedUpdate = vi.mocked(roleService.updateRole);

const USER_INDEX = 'module.master-data.user.index';
const USER_CREATE = 'module.master-data.user.create';

const accessList = [
  {
    module: 'Master Data',
    sub_module: [
      {
        module: 'User',
        activities: [
          { label: 'Menu User', value: USER_INDEX },
          { label: 'Add User', value: USER_CREATE },
        ],
      },
    ],
  },
];

const role = {
  id: 2,
  slug: 'editor',
  title: 'Editor',
  userType: 'Administrator',
  description: 'Content editor',
  access: [USER_INDEX],
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

const pickUserType = async (u: ReturnType<typeof userEvent.setup>, name: string) => {
  const trigger = await screen.findByRole('combobox', { name: /User Type/ });
  trigger.focus();
  await u.keyboard('{Enter}');
  await u.click(await screen.findByRole('option', { name }));
};

beforeEach(() => {
  routeParams = {};
  mockedAccessList.mockResolvedValue({ data: accessList } as never);
  mockedUserTypes.mockResolvedValue({ data: ['Administrator', 'Member'] } as never);
});

describe('RoleForm — create', () => {
  it('blocks submission and reports the required fields when empty', async () => {
    const u = userEvent.setup();
    render(<RoleForm />);

    await u.click(await screen.findByRole('button', { name: 'Create Role' }));

    expect(await screen.findByText('Role name is required')).toBeInTheDocument();
    expect(screen.getByText('User type is required')).toBeInTheDocument();
    expect(screen.getByText('Description is required')).toBeInTheDocument();
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it('offers the user types from the backend catalogue', async () => {
    const u = userEvent.setup();
    render(<RoleForm />);

    const trigger = await screen.findByRole('combobox', { name: /User Type/ });
    trigger.focus();
    await u.keyboard('{Enter}');

    expect(
      (await screen.findAllByRole('option')).map((option) => option.textContent),
    ).toEqual(['Administrator', 'Member']);
  });

  it('sends the ticked activities as `access`, then opens the list', async () => {
    const u = userEvent.setup();
    mockedCreate.mockResolvedValue({ data: role } as never);
    render(<RoleForm />);

    await u.type(await screen.findByLabelText(/^Role Name/), 'Editor');
    await u.type(screen.getByLabelText(/^Description/), 'Content editor');
    await pickUserType(u, 'Member');
    await u.click(screen.getByLabelText('Menu User'));
    await u.click(screen.getByRole('button', { name: 'Create Role' }));

    await waitFor(() => expect(push).toHaveBeenCalledWith('/admin/roles'));
    expect(mockedCreate).toHaveBeenCalledWith({
      title: 'Editor',
      userType: 'Member',
      description: 'Content editor',
      access: [USER_INDEX],
    });
  });

  it('retries when a catalogue fails to load', async () => {
    const u = userEvent.setup();
    mockedUserTypes.mockRejectedValueOnce(new AxiosError('Network Error'));
    render(<RoleForm />);

    await u.click(await screen.findByRole('button', { name: 'Try again' }));

    expect(await screen.findByLabelText('Menu User')).toBeInTheDocument();
  });
});

describe('RoleForm — edit', () => {
  beforeEach(() => {
    routeParams = { slug: role.slug };
    mockedGet.mockResolvedValue({ data: role } as never);
  });

  it('loads by slug and preticks the granted permissions', async () => {
    render(<RoleForm isEdit />);

    expect(await screen.findByLabelText(/^Role Name/)).toHaveValue(role.title);
    expect(mockedGet).toHaveBeenCalledWith(role.slug);
    expect(screen.getByRole('combobox', { name: /User Type/ })).toHaveTextContent(
      'Administrator',
    );
    expect(screen.getByLabelText('Menu User')).toBeChecked();
    expect(screen.getByLabelText('Add User')).not.toBeChecked();
  });

  it('updates by slug', async () => {
    const u = userEvent.setup();
    mockedUpdate.mockResolvedValue({ data: role } as never);
    render(<RoleForm isEdit />);

    await u.click(await screen.findByRole('button', { name: 'Save' }));

    await waitFor(() => expect(mockedUpdate).toHaveBeenCalled());
    expect(mockedUpdate.mock.calls[0][0]).toBe(role.slug);
  });

  it('shows API field errors next to their fields', async () => {
    const u = userEvent.setup();
    mockedUpdate.mockRejectedValue(
      apiError(400, 'Validation failed', [
        { field: 'title', message: 'Role name already exists' },
      ]),
    );
    render(<RoleForm isEdit />);

    await u.click(await screen.findByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Role name already exists')).toBeInTheDocument();
  });

  it('hands a missing role to the not-found page', async () => {
    mockedGet.mockRejectedValue(apiError(404, 'Role not found'));
    render(<RoleForm isEdit />);

    await waitFor(() => expect(notFound).toHaveBeenCalled());
  });

  it('offers a retry, not the not-found page, when loading fails', async () => {
    mockedGet.mockRejectedValue(new AxiosError('Network Error'));
    render(<RoleForm isEdit />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Failed to load the role.');
    expect(notFound).not.toHaveBeenCalled();
  });
});

describe('RoleForm — action bar', () => {
  it('shows Back and Discard on the left and Create Role on the right', async () => {
    const u = userEvent.setup();
    render(<RoleForm />);

    await screen.findByLabelText(/^Role Name/);
    expect(actionBarLabels()).toEqual(['Back', 'Discard changes', 'Create Role']);
    expect(discardButton()).toBeDisabled();
    await u.click(screen.getByRole('button', { name: /Back/ }));
    expect(push).toHaveBeenCalledWith('/admin/roles');
  });

  it('discards a create back to the empty form', async () => {
    const u = userEvent.setup();
    render(<RoleForm />);

    await u.type(await screen.findByLabelText(/^Role Name/), 'Editor');
    await u.click(screen.getByLabelText('Add User'));
    await confirmDiscard(u);

    expect(screen.getByLabelText(/^Role Name/)).toHaveValue('');
    expect(screen.getByLabelText('Add User')).not.toBeChecked();
    expect(discardButton()).toBeDisabled();
  });

  describe('edit', () => {
    beforeEach(() => {
      routeParams = { slug: role.slug };
      mockedGet.mockResolvedValue({ data: role } as never);
    });

    it('treats an access-only tick as a change; ticking back leaves the form clean', async () => {
      const u = userEvent.setup();
      render(<RoleForm isEdit />);

      const add = await screen.findByLabelText('Add User');
      expect(discardButton()).toBeDisabled();
      await u.click(add);
      expect(discardButton()).toBeEnabled();
      await u.click(add);
      expect(discardButton()).toBeDisabled();
    });

    it('counts Select All as a change and discards back to the loaded access', async () => {
      const u = userEvent.setup();
      render(<RoleForm isEdit />);

      await screen.findByLabelText('Add User');
      await u.click(screen.getByRole('button', { name: 'Select All' }));
      expect(screen.getByLabelText('Add User')).toBeChecked();
      expect(screen.getByRole('button', { name: 'Deselect All' })).toBeInTheDocument();
      expect(discardButton()).toBeEnabled();

      await confirmDiscard(u);

      expect(screen.getByLabelText('Menu User')).toBeChecked();
      expect(screen.getByLabelText('Add User')).not.toBeChecked();
      expect(discardButton()).toBeDisabled();
      expect(mockedGet).toHaveBeenCalledTimes(1);
    });

    it('counts Reset Access as a change and saves the restored access after Discard', async () => {
      const u = userEvent.setup();
      mockedUpdate.mockResolvedValue({ data: role } as never);
      render(<RoleForm isEdit />);

      await screen.findByLabelText('Menu User');
      await u.click(screen.getByRole('button', { name: 'Reset Access' }));
      expect(screen.getByLabelText('Menu User')).not.toBeChecked();
      expect(discardButton()).toBeEnabled();

      await confirmDiscard(u);
      expect(screen.getByLabelText('Menu User')).toBeChecked();

      await u.click(screen.getByRole('button', { name: 'Save' }));
      await waitFor(() => expect(mockedUpdate).toHaveBeenCalledTimes(1));
      expect(mockedUpdate.mock.calls[0][1]).toMatchObject({ access: role.access });
    });
  });
});
