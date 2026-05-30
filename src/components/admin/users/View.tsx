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
import { toast } from '@/components/ui/Toast';
import { userService } from '@/services/userService';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import Can from '@/components/layout/admin/Can';
import type { Column, ColumnDef } from '@tanstack/react-table';
import type { UserRow } from '@/types';

function SortHeader({
  column,
  label,
}: {
  column: Column<UserRow, unknown>;
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
            <Link href={`/admin/users/${row.slug}`}>
              <Pencil size={14} />
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
            <Link
              href='#!'
              className='cursor-pointer hover:text-red-600 dark:hover:text-red-400'
              onClick={() => onDeleteClick(row)}
            >
              <Trash2 size={14} />
            </Link>
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
    // header: 'Name'
    header: ({ column }) => <SortHeader column={column} label='Name' />, // if you need to sort
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

  const handleDelete = async (row: unknown) => {
    const userRow = row as UserRow;
    try {
      await userService.deleteUser(userRow.slug);
      setRefreshKey((key) => key + 1);
      toast.success('Delete Successful', {
        description: `${userRow.name} has been removed.`,
      });
    } catch (error: unknown) {
      toast.error('Delete Failed', {
        description: `Failed to delete ${userRow.name}.`,
      });
    }
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
