'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';

import DataTableSearch from './DataTableSearch';
import DataTablePagination from './DataTablePagination';
import { Button } from '../Button';
import { RefreshCwIcon } from 'lucide-react';

export default function DataTable({
  columns,
  fetchData,
  actions,
  rowActions,
  showNumbers = false,
}) {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sorting, setSorting] = useState([]);
  const [limit, setLimit] = useState(10);

  const tableColumns = useMemo(() => {
    const numbered = showNumbers
      ? [
          {
            id: '_no',
            header: '#',
            cell: ({ row }) => (
              <span className='text-slate-400 font-medium'>
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
        id: '_actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center gap-1.5'>
            {rowActions(row.original)}
          </div>
        ),
      },
    ];
  }, [columns, rowActions, showNumbers, page, limit]);

  const handleSearch = useCallback((val) => {
    setSearch(val);
    setPage(1);
  }, []);

  const loadData = async () => {
    setLoading(true);
    const sort_by = sorting[0]?.id ?? null;
    const sort_dir = sorting[0]?.desc ? 'desc' : 'asc';
    const res = await fetchData({
      page,
      per_page: limit,
      search,
      ...(sort_by && { sort_by, sort_dir }),
    });

    setData(res.data.data);
    setLinks(res.data.links);
    setTotalPages(res.data.meta.last_page);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [page, search, sorting, limit]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    onSortingChange: (updater) => {
      setSorting(updater);
      setPage(1);
    },
    state: { sorting },
  });

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between gap-3'>
        <DataTableSearch value={search} onSearch={handleSearch} />
        <div className='flex items-center gap-2 shrink-0'>
          <Button
            className='cursor-pointer bg-slate-700 text-white hover:bg-slate-800'
            size='icon-sm'
            onClick={loadData}
          >
            <RefreshCwIcon size={14} />
          </Button>
          {actions}
        </div>
      </div>

      <div className='rounded-xl border border-slate-200 shadow-sm overflow-hidden bg-white'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-b border-slate-200 bg-slate-50'>
              {table.getHeaderGroups().map((headerGroup) =>
                headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className='text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap'
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

          <tbody className='divide-y divide-slate-100'>
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className='animate-pulse'>
                  {tableColumns.map((_, j) => (
                    <td key={j} className='px-5 py-4'>
                      <div className='h-4 bg-slate-100 rounded-md w-3/4' />
                    </td>
                  ))}
                </tr>
              ))}

            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={columns.length}>
                  <div className='flex flex-col items-center justify-center py-16 text-slate-400'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='size-10 mb-3 text-slate-300'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4'
                      />
                    </svg>
                    <p className='text-sm font-medium'>No data found</p>
                    <p className='text-xs mt-1 text-slate-300'>
                      Try adjusting your search query
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {!loading &&
              table.getRowModel().rows.map((row, rowIndex) => (
                <tr
                  key={row.id}
                  className={`transition-colors hover:bg-slate-50 ${
                    rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className='px-5 py-3.5 text-slate-700'>
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

      <DataTablePagination
        links={links}
        onPageChange={setPage}
        limit={limit}
        onLimitChange={(val) => {
          setLimit(val);
          setPage(page);
        }}
      />
    </div>
  );
}
