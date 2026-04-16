import UserForm from '@/components/forms/admin/UserForm';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/Breadcrumb';
import Link from 'next/link';

export default function AdminUsersCreatePage() {
  return (
    <main className='space-y-1'>
      <h1 className='text-xl font-semibold text-slate-800'>Create User</h1>

      <Breadcrumb className='mb-4'>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                href='/admin'
                className='text-slate-400 hover:text-slate-600 text-sm transition-colors'
              >
                Dashboard
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator className='text-slate-300' />

          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                href='/admin/users'
                className='text-slate-400 hover:text-slate-600 text-sm transition-colors'
              >
                Users
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator className='text-slate-300' />

          <BreadcrumbItem>
            <BreadcrumbPage className='text-slate-600 text-sm'>
              Create User
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <UserForm />
    </main>
  );
}
