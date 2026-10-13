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
import { getApiErrorMessage } from '@/lib/utils';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Can from '@/components/layout/admin/Can';
import type { ColumnDef } from '@tanstack/react-table';
import type { RoleRow } from '@/types';

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
            <Link href={`/admin/roles/${row.slug}`} aria-label='Edit role'>
              <Pencil size={14} aria-hidden />
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
            <button
              type='button'
              aria-label='Delete role'
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

const tableColumns: ColumnDef<RoleRow, unknown>[] = [
  {
    accessorKey: 'title',
    // Sortable columns use SortHeader from '@/components/ui/DataTable/SortHeader'.
    header: 'Title',
  },
  {
    accessorKey: 'userType',
    header: 'User Type',
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
];

export default function ViewRoles() {
  const [deleteTarget, setDeleteTarget] = useState<RoleRow | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // A failure is reported, then rethrown so the dialog stays open for a retry.
  const handleDelete = async (row: RoleRow) => {
    try {
      await roleService.deleteRole(row.slug);
    } catch (err: unknown) {
      toast.error('Delete Failed', {
        description: getApiErrorMessage(err, `Failed to delete ${row.title}.`),
      });
      throw err;
    }
    setRefreshKey((key) => key + 1);
    toast.success('Delete Successful', {
      description: `${row.title} has been removed.`,
    });
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
