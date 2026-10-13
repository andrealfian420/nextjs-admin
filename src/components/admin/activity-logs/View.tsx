'use client';

import DataTable from '@/components/ui/DataTable/DataTable';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/Tooltip';
import { Eye } from 'lucide-react';
import Link from 'next/link';
import { logService } from '@/services/logService';
import Can from '@/components/layout/admin/Can';
import type { ColumnDef } from '@tanstack/react-table';
import type { ActivityLogRow } from '@/types';

function RowActions({ row }: { row: ActivityLogRow }) {
  return (
    <>
      <Can permission='module.activity-log.detail'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={`/admin/activity-logs/${row.id}`}
              aria-label='View activity log detail'
            >
              <Eye size={14} aria-hidden />
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
    // Sortable columns use SortHeader from '@/components/ui/DataTable/SortHeader'.
    header: 'Action Type',
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
    // System actions have no user.
    id: 'causedBy',
    accessorFn: (row) => row.user?.name ?? '—',
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
