import UserForm from '@/components/forms/admin/UserForm';
import PageHeader from '@/components/ui/PageHeader';
import PermissionGuard from '@/components/layout/admin/PermissionGuard';

export default function AdminUsersCreatePage() {
  return (
    <PermissionGuard permission='module.master-data.user.create'>
      <PageHeader
        title='Create User'
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Users', href: '/admin/users' },
          { label: 'Create User' },
        ]}
      />
      <UserForm />
    </PermissionGuard>
  );
}
