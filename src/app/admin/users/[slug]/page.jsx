import UserForm from '@/components/forms/admin/UserForm';
import PageHeader from '@/components/ui/PageHeader';
import PermissionGuard from '@/components/layout/admin/PermissionGuard';

// Dummy data for demonstration. Replace with actual API data fetching.
const dummy = {
  id: '123',
  full_name: 'John Doe',
  email: 'john.doe@example.com',
  role_id: '2',
  avatar: 'https://i.pravatar.cc/150?img=17',
};

export const metadata = {
  title: `Edit User ${dummy.full_name} - Admin Dashboard`,
  description: `Edit details of user ${dummy.full_name} in the admin dashboard`,
};

export default function AdminUsersEditPage() {
  return (
    <PermissionGuard permission='module.master-data.user.edit'>
      <PageHeader
        title={`Edit User ${dummy.full_name}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Users', href: '/admin/users' },
          { label: `Edit User ${dummy.full_name}` },
        ]}
      />

      <UserForm data={dummy} />
    </PermissionGuard>
  );
}
