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
  return (
    <Can permission='module.master-data.role.create'>
      <Link
        href='/admin/roles/create'
        className='inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-slate-700 text-white text-sm font-medium shadow-sm hover:bg-slate-800 transition-colors'
      >
        <Plus size={14} />
        Add Role
      </Link>
    </Can>
  );
}

function RowActions({ row, onDeleteClick }) {
  return (
    <div className='flex gap-2'>
      <Can permission='module.master-data.role.edit'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/admin/roles/${row.slug}`}>
              <Pencil size={14} />
            </Link>
          </TooltipTrigger>
          <TooltipContent className='[&_svg]:hidden! bg-slate-700 text-white hover:text-slate-200'>
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
              size='icon-sm'
              variant='destructive'
              onClick={() => onDeleteClick(row)}
            >
              <Trash2 size={14} />
            </Link>
          </TooltipTrigger>
          <TooltipContent className='[&_svg]:hidden! bg-slate-700 text-white'>
            Delete
          </TooltipContent>
        </Tooltip>
      </Can>
    </div>
  );
}

const tableColumns = [
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
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDelete = async (row) => {
    try {
      await roleService.deleteRole(row.slug);
      setRefreshKey((key) => key + 1);
      toast.success('Delete Successful', {
        description: `${row.name} has been removed.`,
      });
    } catch (error) {
      let msg = 'An error occurred while deleting the role.';
      if (error.response?.data?.message) {
        msg = error.response.data.message;
      } else if (error.message) {
        msg = error.message;
      }

      toast.error('Delete Failed', {
        description: msg,
        duration: 5000
      });
    }
  };

  return (
    <div className='bg-white dark:bg-slate-800 rounded-lg p-4'>
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
