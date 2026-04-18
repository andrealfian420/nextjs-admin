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

function SortHeader({ column, label }) {
  const sorted = column.getIsSorted();
  return (
    <button
      onClick={() => column.toggleSorting()}
      className='flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200 transition-colors'
    >
      {label}
      {sorted === 'asc' ? (
        <ArrowUp size={12} className='text-slate-700 dark:text-slate-300' />
      ) : sorted === 'desc' ? (
        <ArrowDown size={12} className='text-slate-700 dark:text-slate-300' />
      ) : (
        <ArrowUpDown size={12} className='text-slate-400 dark:text-slate-600' />
      )}
    </button>
  );
}

function PageActions() {
  return (
    <Can permission='module.master-data.user.create'>
      <Link
        href='/admin/users/create'
        className='inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-slate-700 text-white text-sm font-medium shadow-sm hover:bg-slate-800 transition-colors'
      >
        <Plus size={14} />
        Add User
      </Link>
    </Can>
  );
}

function RowActions({ row, onDeleteClick }) {
  return (
    <>
      <Can permission='module.master-data.user.edit'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button className='cursor-pointer' size='icon-sm'>
              <Link href={`/admin/users/${row.uuid}`}>
                <Pencil size={14} />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent className='[&_svg]:hidden! bg-slate-700 text-white'>
            Edit
          </TooltipContent>
        </Tooltip>
      </Can>

      <Can permission='module.master-data.user.delete'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className='cursor-pointer'
              size='icon-sm'
              variant='destructive'
              onClick={() => onDeleteClick(row)}
            >
              <Trash2 size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent className='[&_svg]:hidden! bg-slate-700 text-white'>
            Delete
          </TooltipContent>
        </Tooltip>
      </Can>
    </>
  );
}

const tableColumns = [
  {
    accessorKey: 'name',
    header: ({ column }) => <SortHeader column={column} label='Name' />,
  },
  {
    accessorKey: 'email',
    header: ({ column }) => <SortHeader column={column} label='Email' />,
  },
  {
    accessorKey: 'age',
    header: ({ column }) => <SortHeader column={column} label='Age' />,
  },
  {
    accessorKey: 'uuid',
    header: ({ column }) => <SortHeader column={column} label='UUID' />,
  },
];

export default function ViewUsers() {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDelete = async (row) => {
    try {
      await userService.deleteUser(row.id);
      setRefreshKey((key) => key + 1);
      toast.success('Delete Successful', {
        description: `${row.name} has been removed.`,
      });
    } catch (error) {
      toast.error('Delete Failed', {
        description: `Failed to delete ${row.name}.`,
      });
    }
  };

  return (
    <div className='bg-white dark:bg-slate-800 rounded-lg p-4'>
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
