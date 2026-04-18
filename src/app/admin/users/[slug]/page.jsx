import UserForm from '@/components/forms/admin/UserForm';
import PageHeader from '@/components/ui/PageHeader';
import PermissionGuard from '@/components/layout/admin/PermissionGuard';

export const metadata = {
  title: 'Edit User - Admin Dashboard',
};

export default function AdminUsersEditPage() {
  return (
    <PermissionGuard permission='module.master-data.user.edit'>
      <PageHeader
        title='Edit User'
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Users', href: '/admin/users' },
          { label: 'Edit User' },
        ]}
      />

      <UserForm isEdit />
    </PermissionGuard>
  );
}
