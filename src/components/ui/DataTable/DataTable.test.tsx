import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ColumnDef } from '@tanstack/react-table';
import DataTable from '@/components/ui/DataTable/DataTable';
import type { PaginatedResponse, PaginationParams } from '@/types/api';
import { deferred } from '@/test/axios';

interface Person {
  slug: string;
  name: string;
}

const columns: ColumnDef<Person, unknown>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <button type='button' onClick={() => column.toggleSorting()}>
        Name
      </button>
    ),
  },
];

function page(names: string[], lastPage = 1): PaginatedResponse<Person> {
  return {
    data: {
      data: names.map((name) => ({ slug: name.toLowerCase(), name })),
      meta: { current_page: 1, last_page: lastPage, per_page: 10, total: names.length },
      links: [],
    },
  };
}

const lastParams = (fetchData: ReturnType<typeof vi.fn>) =>
  fetchData.mock.calls.at(-1)?.[0] as PaginationParams;

afterEach(() => vi.useRealTimers());

describe('DataTable', () => {
  it('loads the first page and renders rows with row actions', async () => {
    const fetchData = vi.fn().mockResolvedValue(page(['Ann', 'Bob']));

    render(
      <DataTable
        columns={columns}
        fetchData={fetchData}
        rowActions={(row) => <button type='button'>Edit {row.name}</button>}
      />,
    );

    expect(await screen.findByText('Ann')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit Bob' })).toBeInTheDocument();
    expect(fetchData).toHaveBeenCalledTimes(1);
    expect(lastParams(fetchData)).toEqual({ page: 1, per_page: 10, search: '' });
  });

  it('does not refetch when the parent re-renders with a new inline fetchData', async () => {
    const fetchData = vi.fn().mockResolvedValue(page(['Ann']));
    const { rerender } = render(<DataTable columns={columns} fetchData={(p) => fetchData(p)} />);
    await screen.findByText('Ann');

    rerender(<DataTable columns={columns} fetchData={(p) => fetchData(p)} />);
    rerender(<DataTable columns={columns} fetchData={(p) => fetchData(p)} />);

    expect(fetchData).toHaveBeenCalledTimes(1);
  });

  it('pages, and a search goes back to page 1 with the term', async () => {
    const fetchData = vi.fn().mockResolvedValue(page(['Ann'], 3));
    render(<DataTable columns={columns} fetchData={fetchData} />);
    await screen.findByText('Ann');

    await userEvent.click(screen.getAllByRole('button', { name: 'Next page' })[0]);
    await waitFor(() => expect(lastParams(fetchData)).toMatchObject({ page: 2 }));

    vi.useFakeTimers();
    fireEvent.change(screen.getByRole('textbox', { name: 'Search' }), { target: { value: 'ann' } });
    act(() => vi.advanceTimersByTime(500));
    vi.useRealTimers();

    await waitFor(() => expect(lastParams(fetchData)).toEqual({ page: 1, per_page: 10, search: 'ann' }));
  });

  it('sends the sort and goes back to page 1', async () => {
    const fetchData = vi.fn().mockResolvedValue(page(['Ann'], 2));
    render(<DataTable columns={columns} fetchData={fetchData} />);
    await screen.findByText('Ann');
    await userEvent.click(screen.getAllByRole('button', { name: 'Next page' })[0]);
    await waitFor(() => expect(lastParams(fetchData)).toMatchObject({ page: 2 }));

    await userEvent.click(screen.getByRole('button', { name: 'Name' }));

    await waitFor(() =>
      expect(lastParams(fetchData)).toMatchObject({ page: 1, sort_by: 'name', sort_dir: 'asc' }),
    );
  });

  it('reloads the same page with the refresh button and when refreshKey changes', async () => {
    const fetchData = vi.fn().mockResolvedValue(page(['Ann']));
    const { rerender } = render(<DataTable columns={columns} fetchData={fetchData} refreshKey={0} />);
    await screen.findByText('Ann');

    await userEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    await waitFor(() => expect(fetchData).toHaveBeenCalledTimes(2));

    rerender(<DataTable columns={columns} fetchData={fetchData} refreshKey={1} />);
    await waitFor(() => expect(fetchData).toHaveBeenCalledTimes(3));
  });

  it('shows an empty state', async () => {
    render(<DataTable columns={columns} fetchData={vi.fn().mockResolvedValue(page([]))} />);
    expect(await screen.findByText('No data found')).toBeInTheDocument();
  });

  it('shows an error state with a retry instead of an empty table', async () => {
    const fetchData = vi.fn().mockRejectedValueOnce(new Error('down')).mockResolvedValue(page(['Ann']));
    render(<DataTable columns={columns} fetchData={fetchData} />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Failed to load data');
    expect(screen.queryByText('No data found')).toBeNull();

    await userEvent.click(within(alert).getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Ann')).toBeInTheDocument();
  });

  it('ignores the answer of a load that a newer one replaced', async () => {
    const slow = deferred<PaginatedResponse<Person>>();
    const fetchData = vi
      .fn()
      .mockReturnValueOnce(Promise.resolve(page(['Page one'], 3)))
      .mockReturnValueOnce(slow.promise)
      .mockResolvedValue(page(['Page three'], 3));
    render(<DataTable columns={columns} fetchData={fetchData} />);
    await screen.findByText('Page one');

    const next = screen.getAllByRole('button', { name: 'Next page' })[0];
    await userEvent.click(next); // page 2, held open
    await userEvent.click(next); // page 3
    expect(await screen.findByText('Page three')).toBeInTheDocument();

    await act(async () => slow.resolve(page(['Page two (late)'], 3)));
    expect(screen.queryByText('Page two (late)')).toBeNull();
    expect(screen.getByText('Page three')).toBeInTheDocument();
  });

  it('steps back when the page is past the end (last row of the last page deleted)', async () => {
    const fetchData = vi
      .fn()
      .mockResolvedValueOnce(page(['Ann'], 2))
      .mockResolvedValueOnce(page(['Zed'], 2))
      .mockResolvedValueOnce(page([], 1))
      .mockResolvedValue(page(['Ann'], 1));
    const { rerender } = render(<DataTable columns={columns} fetchData={fetchData} refreshKey={0} />);
    await screen.findByText('Ann');
    await userEvent.click(screen.getAllByRole('button', { name: 'Next page' })[0]);
    await screen.findByText('Zed');

    rerender(<DataTable columns={columns} fetchData={fetchData} refreshKey={1} />);

    expect(await screen.findByText('Ann')).toBeInTheDocument();
    expect(lastParams(fetchData)).toMatchObject({ page: 1 });
  });
});
