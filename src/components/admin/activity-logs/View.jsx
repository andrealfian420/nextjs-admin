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

function SortHeader({ column, label }) {
  const sorted = column.getIsSorted();
  const isActive = !!sorted;
  return (
    <button
      onClick={() => column.toggleSorting()}
      className={`flex items-center gap-1 transition-colors ${
        isActive
          ? 'text-blue-600 dark:text-blue-400'
          : 'hover:text-slate-700 dark:hover:text-slate-200'
      }`}
    >
      {label}
      {sorted === 'asc' ? (
        <ArrowUp size={12} className='text-blue-600 dark:text-blue-400' />
      ) : sorted === 'desc' ? (
        <ArrowDown size={12} className='text-blue-600 dark:text-blue-400' />
      ) : (
        <ArrowUpDown size={12} className='text-slate-400 dark:text-slate-600' />
      )}
    </button>
  );
}

function PageActions() {
  return null; // add page actions button here if needed
}

function RowActions({ row }) {
  return (
    <>
      <Can permission='module.activity-log.detail'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/admin/activity-logs/${row.id}`}>
              <Eye size={14} />
            </Link>
          </TooltipTrigger>
          <TooltipContent className='[&_svg]:hidden! bg-slate-700 text-white'>
            View Detail
          </TooltipContent>
        </Tooltip>
      </Can>
    </>
  );
}

const tableColumns = [
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
    <div className='bg-white dark:bg-slate-800 rounded-lg p-4'>
      <DataTable
        columns={tableColumns}
        fetchData={logService.getActivityLogs}
        showNumbers
        rowActions={(row) => <RowActions row={row} />}
      />
    </div>
  );
}
