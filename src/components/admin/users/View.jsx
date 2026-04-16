'use client';

import { Button } from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable/DataTable';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/Tooltip';
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

function SortHeader({ column, label }) {
  const sorted = column.getIsSorted();
  return (
    <button
      onClick={() => column.toggleSorting()}
      className='flex items-center gap-1 hover:text-slate-700 transition-colors'
    >
      {label}
      {sorted === 'asc' ? (
        <ArrowUp size={12} className='text-slate-700' />
      ) : sorted === 'desc' ? (
        <ArrowDown size={12} className='text-slate-700' />
      ) : (
        <ArrowUpDown size={12} className='text-slate-400' />
      )}
    </button>
  );
}

function PageActions() {
  return (
    <Link
      href='/admin/users/create'
      className='inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-slate-700 text-white text-sm font-medium shadow-sm hover:bg-slate-800 transition-colors'
    >
      <Plus size={14} />
      Add User
    </Link>
  );
}

function RowActions({ row }) {
  return (
    <>
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

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className='cursor-pointer'
            size='icon-sm'
            variant='destructive'
            onClick={() => console.log('delete', row)}
          >
            <Trash2 size={14} />
          </Button>
        </TooltipTrigger>
        <TooltipContent className='[&_svg]:hidden! bg-slate-700 text-white'>
          Delete
        </TooltipContent>
      </Tooltip>
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
  return (
    <div className='bg-white rounded-lg p-4'>
      <DataTable
        columns={tableColumns}
        fetchData={userService.getUsers}
        showNumbers
        actions={<PageActions />}
        rowActions={(row) => <RowActions row={row} />}
      />
    </div>
  );
}