import ViewUsers from '@/components/admin/users/View';
import PageHeader from '@/components/ui/PageHeader';
import PermissionGuard from '@/components/layout/admin/PermissionGuard';

// set metadata for this page
export const metadata = {
  title: 'Users - Admin Dashboard',
  description: 'Manage users in the admin dashboard',
};

export default function AdminUsersPage() {
  return (
    <PermissionGuard permission='module.master-data.user.index'>
      <PageHeader
        title='Users'
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Users' },
        ]}
      />
      <ViewUsers />
    </PermissionGuard>
  );
}
