import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useEffect } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('@/services/roleService', () => ({
  roleService: { getRoles: vi.fn(), deleteRole: vi.fn() },
}));

vi.mock('@/components/ui/Toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/components/layout/admin/Can', () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));

// Loads on mount and on every refreshKey change, like the real DataTable.
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

import ViewRoles from '@/components/admin/roles/View';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { roleService } from '@/services/roleService';
import { toast } from '@/components/ui/Toast';
import { AxiosError } from 'axios';

const row = {
  id: 2,
  slug: 'editor',
  title: 'Editor',
  description: 'Content editor',
  userType: 'Administrator',
};

const mockedList = vi.mocked(roleService.getRoles);
const mockedDelete = vi.mocked(roleService.deleteRole);

const renderView = () =>
  render(
    <TooltipProvider>
      <ViewRoles />
    </TooltipProvider>,
  );

const confirmDelete = async (u: ReturnType<typeof userEvent.setup>) => {
  await u.click(await screen.findByRole('button', { name: 'Delete role' }));
  await u.click(await screen.findByRole('button', { name: 'Delete' }));
};

beforeEach(() => {
  mockedList.mockResolvedValue({ data: { data: [row], links: [], meta: {} } } as never);
  mockedDelete.mockResolvedValue({ data: null } as never);
});

describe('ViewRoles', () => {
  it('links edit to the row slug', async () => {
    renderView();

    expect(await screen.findByRole('link', { name: 'Edit role' })).toHaveAttribute(
      'href',
      `/admin/roles/${row.slug}`,
    );
  });

  it('names the role by its title in the confirmation and deletes by slug', async () => {
    const u = userEvent.setup();
    renderView();

    await u.click(await screen.findByRole('button', { name: 'Delete role' }));
    expect(await screen.findByRole('dialog')).toHaveTextContent('Editor');
    await u.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(mockedDelete).toHaveBeenCalledWith(row.slug);
    expect(mockedList).toHaveBeenCalledTimes(2);
  });

  it('falls back to a generic message and keeps the dialog open when the request fails', async () => {
    const u = userEvent.setup();
    mockedDelete.mockRejectedValue(new AxiosError('Network Error'));
    renderView();

    await confirmDelete(u);

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Delete Failed', {
        description: 'Failed to delete Editor.',
      }),
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(mockedList).toHaveBeenCalledTimes(1);
  });
});
