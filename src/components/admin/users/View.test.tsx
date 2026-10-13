import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useEffect } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('@/services/userService', () => ({
  userService: { getUsers: vi.fn(), deleteUser: vi.fn() },
}));

vi.mock('@/components/ui/Toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// Permission gating has its own tests; here it would only hide the controls under test.
vi.mock('@/components/layout/admin/Can', () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));

// The real DataTable has its own tests. This stand-in loads on mount and on every refreshKey
// change, which is how the view reloads after a delete.
vi.mock('@/components/ui/DataTable/DataTable', () => ({
  default: function DataTableStub({
    fetchData,
    rowActions,
    refreshKey,
  }: {
    fetchData: (p: object) => Promise<unknown>;
    rowActions?: (r: unknown) => React.ReactNode;
    refreshKey?: number;
  }) {
    useEffect(() => {
      void fetchData({ page: 1, limit: 10 });
    }, [fetchData, refreshKey]);
    return <div data-testid='data-table'>{rowActions?.(row)}</div>;
  },
}));

import ViewUsers from '@/components/admin/users/View';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { userService } from '@/services/userService';
import { toast } from '@/components/ui/Toast';
import { AxiosError } from 'axios';

const row = {
  id: 3,
  slug: 'ada',
  name: 'Ada',
  email: 'ada@example.test',
  roleName: 'Editor',
  registeredAt: '12 October 2026',
};

const mockedList = vi.mocked(userService.getUsers);
const mockedDelete = vi.mocked(userService.deleteUser);

const renderView = () =>
  render(
    <TooltipProvider>
      <ViewUsers />
    </TooltipProvider>,
  );

const confirmDelete = async (u: ReturnType<typeof userEvent.setup>) => {
  await u.click(await screen.findByRole('button', { name: 'Delete user' }));
  await u.click(await screen.findByRole('button', { name: 'Delete' }));
};

beforeEach(() => {
  mockedList.mockResolvedValue({ data: { data: [row], links: [], meta: {} } } as never);
  mockedDelete.mockResolvedValue({ data: null } as never);
});

describe('ViewUsers', () => {
  it('links edit to the row slug', async () => {
    renderView();

    expect(await screen.findByRole('link', { name: 'Edit user' })).toHaveAttribute(
      'href',
      `/admin/users/${row.slug}`,
    );
  });

  it('deletes by slug, closes the dialog and reloads the list', async () => {
    const u = userEvent.setup();
    renderView();

    await confirmDelete(u);

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(mockedDelete).toHaveBeenCalledWith(row.slug);
    expect(toast.success).toHaveBeenCalled();
    expect(mockedList).toHaveBeenCalledTimes(2);
  });

  it('reports a failed delete with the backend message and keeps the dialog open', async () => {
    const u = userEvent.setup();
    const err = new AxiosError('Request failed');
    err.response = {
      data: { message: 'You cannot delete yourself' },
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: { headers: {} } as never,
    };
    mockedDelete.mockRejectedValue(err);
    renderView();

    await confirmDelete(u);

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Delete Failed', {
        description: 'You cannot delete yourself',
      }),
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeEnabled();
    expect(mockedList).toHaveBeenCalledTimes(1);
  });
});
