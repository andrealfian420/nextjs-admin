import ViewUsers from '@/components/admin/users/View';
import PageHeader from '@/components/ui/PageHeader';

export default function AdminUsersPage() {
  return (
    <main>
      <PageHeader
        title='Users'
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Users' },
        ]}
      />
      <ViewUsers />
    </main>
  );
}
