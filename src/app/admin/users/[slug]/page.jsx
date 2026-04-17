import UserForm from '@/components/forms/admin/UserForm';
import PageHeader from '@/components/ui/PageHeader';

// Dummy data for demonstration. Replace with actual API data fetching.
const dummy = {
  id: '123',
  full_name: 'John Doe',
  email: 'john.doe@example.com',
  role_id: '2',
  avatar: 'https://i.pravatar.cc/150?img=17',
};

export default function AdminUsersEditPage() {
  return (
    <main>
      <PageHeader
        title={`Edit User ${dummy.full_name}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Users', href: '/admin/users' },
          { label: `Edit User ${dummy.full_name}` },
        ]}
      />
      {/* Pass data from your API fetch here */}
      <UserForm data={dummy} />
    </main>
  );
}
