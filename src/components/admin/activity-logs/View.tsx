'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable/DataTable';
import DeleteDialog from '@/components/ui/DeleteDialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/Tooltip';
import { ArrowDown, ArrowUp, ArrowUpDown, Eye } from 'lucide-react';
import Link from 'next/link';
import { logService } from '@/services/logService';
import Can from '@/components/layout/admin/Can';
import type { Column, ColumnDef } from '@tanstack/react-table';
import type { ActivityLogRow } from '@/types';

function SortHeader({
  column,
  label,
}: {
  column: Column<ActivityLogRow, unknown>;
  label: string;
}) {
  const sorted = column.getIsSorted();
  const isActive = !!sorted;
  return (
    <button
      onClick={() => column.toggleSorting()}
      className={`flex items-center gap-1 transition-colors ${
        isActive
          ? 'text-blue-600 dark:text-blue-400'
          : 'hover:text-zinc-700 dark:hover:text-zinc-200'
      }`}
    >
      {label}
      {sorted === 'asc' ? (
        <ArrowUp size={12} className='text-blue-600 dark:text-blue-400' />
      ) : sorted === 'desc' ? (
        <ArrowDown size={12} className='text-blue-600 dark:text-blue-400' />
      ) : (
        <ArrowUpDown size={12} className='text-zinc-400 dark:text-zinc-600' />
      )}
    </button>
  );
}

function PageActions() {
  return null; // add page actions button here if needed
}

function RowActions({ row }: { row: ActivityLogRow }) {
  return (
    <>
      <Can permission='module.activity-log.detail'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/admin/activity-logs/${row.id}`}>
              <Eye size={14} />
            </Link>
          </TooltipTrigger>
          <TooltipContent className='[&_svg]:hidden! bg-zinc-700 text-white'>
            View Detail
          </TooltipContent>
        </Tooltip>
      </Can>
    </>
  );
}

const tableColumns: ColumnDef<ActivityLogRow, unknown>[] = [
  {
    accessorKey: 'actionType',
    header: 'Action Type',
    // header: ({ column }) => <SortHeader column={column} label='Action Type' />, // if you need to sort
  },
  {
    accessorKey: 'subjectType',
    header: 'Subject Type',
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    accessorKey: 'user.name',
    header: 'Caused By',
  },
  {
    accessorKey: 'causedAt',
    header: 'Caused At',
  },
];

export default function ViewActivityLogs() {
  return (
    <div className='bg-white dark:bg-zinc-800 rounded-lg p-4'>
      <DataTable
        columns={tableColumns}
        fetchData={logService.getActivityLogs}
        showNumbers
        rowActions={(row) => <RowActions row={row} />}
      />
    </div>
  );
}
