import UserForm from '@/components/forms/admin/UserForm';
import PageHeader from '@/components/ui/PageHeader';

export default function AdminUsersCreatePage() {
  return (
    <main>
      <PageHeader
        title='Create User'
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Users', href: '/admin/users' },
          { label: 'Create User' },
        ]}
      />
      <UserForm />
    </main>
  );
}
