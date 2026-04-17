import ViewUsers from '@/components/admin/users/View';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/Breadcrumb';
import Link from 'next/link';

export default function AdminUsersPage() {
  return (
    <main className='space-y-1'>
      <h1 className='text-xl font-semibold text-slate-800 dark:text-slate-100'>
        Users
      </h1>

      <Breadcrumb className='mb-4'>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                href='/admin'
                className='text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 text-sm transition-colors'
              >
                Dashboard
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator className='text-slate-300 dark:text-slate-600' />

          <BreadcrumbItem>
            <BreadcrumbPage className='text-slate-600 dark:text-slate-400 text-sm'>
              Users
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <ViewUsers />
    </main>
  );
}
