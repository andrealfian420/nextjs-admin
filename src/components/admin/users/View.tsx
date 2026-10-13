'use client';

import { useState } from 'react';
import DataTable from '@/components/ui/DataTable/DataTable';
import { SortHeader } from '@/components/ui/DataTable/SortHeader';
import DeleteDialog from '@/components/ui/DeleteDialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/Tooltip';
import { toast } from '@/components/ui/Toast';
import { getApiErrorMessage } from '@/lib/utils';
import { userService } from '@/services/userService';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Can from '@/components/layout/admin/Can';
import type { ColumnDef } from '@tanstack/react-table';
import type { UserRow } from '@/types';

function PageActions() {
  return (
    <Can permission='module.master-data.user.create'>
      <Link
        href='/admin/users/create'
        className='inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-zinc-900 text-white text-sm font-medium shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors'
      >
        <Plus size={14} />
        Add User
      </Link>
    </Can>
  );
}

function RowActions({
  row,
  onDeleteClick,
}: {
  row: UserRow;
  onDeleteClick: (row: UserRow) => void;
}) {
  return (
    <div className='flex gap-2'>
      <Can permission='module.master-data.user.edit'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/admin/users/${row.slug}`} aria-label='Edit user'>
              <Pencil size={14} aria-hidden />
            </Link>
          </TooltipTrigger>
          <TooltipContent className='[&_svg]:hidden! bg-zinc-700 text-white hover:text-zinc-200'>
            Edit
          </TooltipContent>
        </Tooltip>
      </Can>

      <Can permission='module.master-data.user.delete'>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type='button'
              aria-label='Delete user'
              className='cursor-pointer hover:text-red-600 dark:hover:text-red-400'
              onClick={() => onDeleteClick(row)}
            >
              <Trash2 size={14} aria-hidden />
            </button>
          </TooltipTrigger>
          <TooltipContent className='[&_svg]:hidden! bg-zinc-700 text-white'>
            Delete
          </TooltipContent>
        </Tooltip>
      </Can>
    </div>
  );
}

const tableColumns: ColumnDef<UserRow, unknown>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <SortHeader column={column} label='Name' />,
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'roleName',
    header: 'Role',
  },
  {
    accessorKey: 'registeredAt',
    header: 'Registered At',
  },
];

export default function ViewUsers() {
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // A failure is reported, then rethrown so the dialog stays open for a retry.
  const handleDelete = async (row: UserRow) => {
    try {
      await userService.deleteUser(row.slug);
    } catch (err: unknown) {
      toast.error('Delete Failed', {
        description: getApiErrorMessage(err, `Failed to delete ${row.name}.`),
      });
      throw err;
    }
    setRefreshKey((key) => key + 1);
    toast.success('Delete Successful', {
      description: `${row.name} has been removed.`,
    });
  };

  return (
    <div className='bg-white dark:bg-zinc-800 rounded-lg p-4'>
      <DataTable
        columns={tableColumns}
        fetchData={userService.getUsers}
        showNumbers
        refreshKey={refreshKey}
        actions={<PageActions />}
        rowActions={(row) => (
          <RowActions row={row} onDeleteClick={setDeleteTarget} />
        )}
      />

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        row={deleteTarget}
        onConfirm={handleDelete}
      />
    </div>
  );
}
