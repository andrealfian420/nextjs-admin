import PageHeader from '@/components/ui/PageHeader';
import PermissionGuard from '@/components/layout/admin/PermissionGuard';
import RoleForm from '@/components/forms/admin/RoleForm';

export default function AdminRolesCreatePage() {
  return (
    <PermissionGuard permission='module.master-data.role.create'>
      <PageHeader
        title='Create Role'
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Roles', href: '/admin/roles' },
          { label: 'Create Role' },
        ]}
      />
      <RoleForm />
    </PermissionGuard>
  );
}
