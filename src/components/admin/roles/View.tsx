'use client';

import { useState } from 'react';
import { roleService } from '@/services/roleService';
import DataTable from '@/components/ui/DataTable/DataTable';
import DeleteDialog from '@/components/ui/DeleteDialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/Tooltip';
import { toast } from '@/components/ui/Toast';
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
import type { RoleRow } from '@/types';

function SortHeader({
  column,
  label,
}: {
  column: Column<RoleRow, unknown>;
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
    <Can permission='module.master-data.role.create'>
      <Link
        href='/admin/roles/create'
        className='inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-zinc-900 text-white text-sm font-medium shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors'
      >
        <Plus size={14} />
        Add Role
      </Link>
    </Can>
  );
}

function RowActions({
  row,
  onDeleteClick,
}: {
  row: RoleRow;
  onDeleteClick: (row: RoleRow) => void;
}) {
  return (
    <div className='flex gap-2'>
      <Can permission='module.master-data.role.edit'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/admin/roles/${row.slug}`}>
              <Pencil size={14} />
            </Link>
          </TooltipTrigger>
          <TooltipContent className='[&_svg]:hidden! bg-zinc-700 text-white hover:text-zinc-200'>
            Edit
          </TooltipContent>
        </Tooltip>
      </Can>

      <Can permission='module.master-data.role.delete'>
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

const tableColumns: ColumnDef<RoleRow, unknown>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
    // header: ({ column }) => <SortHeader column={column} label='Title' />, // if you need to sort
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
];

export default function ViewRoles() {
  const [deleteTarget, setDeleteTarget] = useState<RoleRow | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDelete = async (row: unknown) => {
    const roleRow = row as RoleRow;
    try {
      await roleService.deleteRole(roleRow.slug);
      setRefreshKey((key) => key + 1);
      toast.success('Delete Successful', {
        description: `${roleRow.name} has been removed.`,
      });
    } catch (error: unknown) {
      let msg = 'An error occurred while deleting the role.';
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosErr = error as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        if (axiosErr.response?.data?.message) {
          msg = axiosErr.response.data.message;
        } else if (axiosErr.message) {
          msg = axiosErr.message;
        }
      }

      toast.error('Delete Failed', {
        description: msg,
        duration: 5000,
      });
    }
  };

  return (
    <div className='bg-white dark:bg-zinc-800 rounded-lg p-4'>
      <DataTable
        columns={tableColumns}
        fetchData={roleService.getRoles}
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
