import PageHeader from '@/components/ui/PageHeader';
import PermissionGuard from '@/components/layout/admin/PermissionGuard';
import ViewRoles from '@/components/admin/roles/View';

// set metadata for this page
export const metadata = {
  title: 'Roles - Admin Dashboard',
  description: 'Manage roles in the admin dashboard',
};

export default function AdminRolesPage() {
  return (
    <PermissionGuard permission='module.master-data.role.index'>
      <PageHeader
        title='Roles'
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Roles' },
        ]}
      />

      <ViewRoles />
    </PermissionGuard>
  );
}
