'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type Updater,
  type Row,
} from '@tanstack/react-table';

import DataTableSearch from './DataTableSearch';
import DataTablePagination from './DataTablePagination';
import { Button } from '../Button';
import { RefreshCwIcon } from 'lucide-react';
import type { PaginatedResponse, PaginationParams } from '@/types/api';

const ACTIONS_COLUMN_ID = '_actions';

// Below `sm` the Actions column sticks to the right edge, so edit/delete stay reachable
// while the table scrolls horizontally.
const STICKY_ACTIONS =
  'sticky right-0 z-10 shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.15)] sm:static sm:z-auto sm:shadow-none';

// Opaque equivalents of the translucent header/row colours, so scrolled cells do not show
// through the pinned column.
const STICKY_HEADER_BG =
  'bg-zinc-50 dark:bg-zinc-800 dark:bg-linear-to-r dark:from-zinc-700/40 dark:to-zinc-700/40';
const STICKY_ROW_BG =
  'bg-white dark:bg-zinc-800 bg-linear-to-r group-hover:from-zinc-50 group-hover:to-zinc-50 dark:group-hover:from-zinc-700/40 dark:group-hover:to-zinc-700/40';
const STICKY_ODD_ROW_TINT =
  'from-zinc-50/50 to-zinc-50/50 dark:from-zinc-700/20 dark:to-zinc-700/20';

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  /** A list service, e.g. userService.getUsers. */
  fetchData: (params: PaginationParams) => Promise<PaginatedResponse<TData>>;
  actions?: React.ReactNode;
  rowActions?: (row: TData) => React.ReactNode;
  showNumbers?: boolean;
  /** Change it to reload the current page (e.g. after a delete). */
  refreshKey?: unknown;
}

type LoadResult<TData> =
  | { key: string; rows: TData[]; lastPage: number }
  | { key: string; error: true };

export default function DataTable<TData>({
  columns,
  fetchData,
  actions,
  rowActions,
  showNumbers = false,
  refreshKey,
}: DataTableProps<TData>) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [reloads, setReloads] = useState(0);
  const [result, setResult] = useState<LoadResult<TData> | null>(null);

  // The latest fetchData, kept out of the load effect's dependencies: an inline function
  // from the parent must not refetch on every render.
  const fetchRef = useRef(fetchData);
  useEffect(() => {
    fetchRef.current = fetchData;
  });

  const params = useMemo<PaginationParams>(() => {
    const sort = sorting[0];
    return {
      page,
      per_page: limit,
      search,
      ...(sort && { sort_by: sort.id, sort_dir: sort.desc ? 'desc' : 'asc' }),
    };
  }, [page, limit, search, sorting]);

  // Identifies one load; `loading` is simply "no result for the current key yet".
  const key = JSON.stringify([params, reloads, refreshKey]);
  const loading = result?.key !== key;
  const rows = result && !loading && 'rows' in result ? result.rows : [];
  const failed = !loading && !!result && 'error' in result;
  const lastPage = result && 'rows' in result ? result.lastPage : 1;

  useEffect(() => {
    // Ignore the answer of a load that a newer one replaced (fast paging or typing).
    let active = true;

    fetchRef.current(params).then(
      (res) => {
        if (!active) return;
        const last = res.data.meta.last_page;
        // Deleting the last row of the last page leaves the page past the end.
        if (res.data.data.length === 0 && last >= 1 && page > last) {
          setPage(last);
          return;
        }
        setResult({ key, rows: res.data.data, lastPage: last });
      },
      () => {
        if (active) setResult({ key, error: true });
      },
    );

    return () => {
      active = false;
    };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps -- `key` encodes params

  const tableColumns = useMemo(() => {
    const numbered: ColumnDef<TData, unknown>[] = showNumbers
      ? [
          {
            id: '_no',
            header: '#',
            cell: ({ row }: { row: Row<TData> }) => (
              <span className='text-zinc-400 dark:text-zinc-500 font-medium'>
                {(page - 1) * limit + row.index + 1}
              </span>
            ),
          },
          ...columns,
        ]
      : [...columns];

    if (!rowActions) return numbered;
    return [
      ...numbered,
      {
        id: ACTIONS_COLUMN_ID,
        header: 'Actions',
        cell: ({ row }: { row: Row<TData> }) => (
          <div className='flex items-center gap-1.5'>
            {rowActions(row.original)}
          </div>
        ),
      },
    ];
  }, [columns, rowActions, showNumbers, page, limit]);

  const handleSearch = useCallback((val: string) => {
    setSearch(val);
    setPage(1);
  }, []);

  const reload = () => setReloads((n) => n + 1);

  // React Compiler skips this component: TanStack Table returns functions it cannot memoize.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: rows,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    onSortingChange: (updater: Updater<SortingState>) => {
      setSorting(updater);
      setPage(1);
    },
    state: { sorting },
  });

  return (
    <div className='space-y-4'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <DataTableSearch onSearch={handleSearch} />
        <div className='flex flex-wrap items-center gap-2 sm:shrink-0'>
          <Button
            className='cursor-pointer bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200'
            size='icon-sm'
            aria-label='Refresh'
            onClick={reload}
          >
            <RefreshCwIcon size={14} />
          </Button>
          {actions}
        </div>
      </div>

      <div className='rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-hidden bg-white dark:bg-zinc-800'>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm' aria-busy={loading}>
            <thead>
              <tr className='border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700/40'>
                {table.getHeaderGroups().map((headerGroup) =>
                  headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={`text-left px-3 py-3 sm:px-5 sm:py-3.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider whitespace-nowrap ${
                        header.column.id === ACTIONS_COLUMN_ID
                          ? `${STICKY_ACTIONS} ${STICKY_HEADER_BG}`
                          : ''
                      }`}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </th>
                  )),
                )}
              </tr>
            </thead>

            <tbody className='divide-y divide-zinc-100 dark:divide-zinc-700'>
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className='animate-pulse'>
                    {tableColumns.map((_, j) => (
                      <td key={j} className='px-3 py-3 sm:px-5 sm:py-4'>
                        <div className='h-4 bg-zinc-100 dark:bg-zinc-700 rounded-md w-3/4' />
                      </td>
                    ))}
                  </tr>
                ))}

              {failed && (
                <tr>
                  <td colSpan={tableColumns.length}>
                    <div
                      role='alert'
                      className='flex flex-col items-center justify-center gap-3 py-16 text-zinc-500 dark:text-zinc-400'
                    >
                      <p className='text-sm font-medium'>Failed to load data</p>
                      <Button variant='outline' size='sm' onClick={reload}>
                        Try again
                      </Button>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && !failed && rows.length === 0 && (
                <tr>
                  <td colSpan={tableColumns.length}>
                    <div className='flex flex-col items-center justify-center py-16 text-zinc-400 dark:text-zinc-500'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='size-10 mb-3 text-zinc-300 dark:text-zinc-600'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                        strokeWidth={1.5}
                        aria-hidden='true'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4'
                        />
                      </svg>
                      <p className='text-sm font-medium'>No data found</p>
                      {search && (
                        <p className='text-xs mt-1 text-zinc-300 dark:text-zinc-500'>
                          Try adjusting your search query
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              )}

              {!loading &&
                table.getRowModel().rows.map((row, rowIndex) => (
                  <tr
                    key={row.id}
                    className={`group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-700/40 ${
                      rowIndex % 2 === 0
                        ? 'bg-white dark:bg-zinc-800'
                        : 'bg-zinc-50/50 dark:bg-zinc-700/20'
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={`px-3 py-3 sm:px-5 sm:py-3.5 text-zinc-700 dark:text-zinc-300 ${
                          cell.column.id === ACTIONS_COLUMN_ID
                            ? `${STICKY_ACTIONS} ${STICKY_ROW_BG} ${
                                rowIndex % 2 === 0 ? '' : STICKY_ODD_ROW_TINT
                              }`
                            : ''
                        }`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <DataTablePagination
        page={page}
        lastPage={lastPage}
        onPageChange={setPage}
        limit={limit}
        onLimitChange={(val) => {
          setLimit(val);
          setPage(1);
        }}
      />
    </div>
  );
}
