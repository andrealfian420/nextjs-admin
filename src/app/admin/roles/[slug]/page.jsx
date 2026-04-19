import PageHeader from '@/components/ui/PageHeader';
import PermissionGuard from '@/components/layout/admin/PermissionGuard';
import RoleForm from '@/components/forms/admin/RoleForm';

export const metadata = {
  title: 'Edit Role - Admin Dashboard',
};

export default function AdminRolesEditPage() {
  return (
    <PermissionGuard permission='module.master-data.role.edit'>
      <PageHeader
        title='Edit Role'
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Roles', href: '/admin/roles' },
          { label: 'Edit Role' },
        ]}
      />

      <RoleForm isEdit />
    </PermissionGuard>
  );
}
