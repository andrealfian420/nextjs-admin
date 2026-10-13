import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/components/layout/admin/Can', () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));

// Renders the row actions and every column cell for one row.
vi.mock('@/components/ui/DataTable/DataTable', () => ({
  default: function DataTableStub({
    columns,
    rowActions,
  }: {
    columns: { id?: string; accessorKey?: string; accessorFn?: (r: unknown) => unknown }[];
    rowActions?: (r: unknown) => React.ReactNode;
  }) {
    return (
      <div>
        {columns.map((column) => (
          <span key={column.id ?? column.accessorKey} data-testid={column.id ?? column.accessorKey}>
            {String(
              column.accessorFn
                ? column.accessorFn(row)
                : row[column.accessorKey as keyof typeof row],
            )}
          </span>
        ))}
        {rowActions?.(row)}
      </div>
    );
  },
}));

import ViewActivityLogs from '@/components/admin/activity-logs/View';
import { TooltipProvider } from '@/components/ui/Tooltip';

const row = {
  id: 42,
  actionType: 'CREATE',
  subjectType: 'Role',
  description: 'Role created',
  user: null,
  causedAt: '12 October 2026 at 07:00',
};

describe('ViewActivityLogs', () => {
  it('links each row to its detail and shows a dash for a system action', () => {
    render(
      <TooltipProvider>
        <ViewActivityLogs />
      </TooltipProvider>,
    );

    expect(screen.getByRole('link', { name: 'View activity log detail' })).toHaveAttribute(
      'href',
      `/admin/activity-logs/${row.id}`,
    );
    expect(screen.getByTestId('causedBy')).toHaveTextContent('—');
    expect(screen.queryByRole('button', { name: /Delete/ })).toBeNull();
  });
});
