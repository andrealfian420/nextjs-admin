import ViewDashboard from '@/components/admin/dashboard/View';

// set metadata for this page
export const metadata = {
  title: 'Dashboard - Admin Dashboard',
  description: 'Overview of the admin dashboard',
};

export default function AdminPage() {
  return (
    <main>
      <ViewDashboard />
    </main>
  );
}
