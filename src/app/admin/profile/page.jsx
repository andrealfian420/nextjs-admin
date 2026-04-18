import ProfileForm from '@/components/forms/admin/ProfileForm';
import PageHeader from '@/components/ui/PageHeader';

export const metadata = {
  title: 'Profile - Admin Dashboard',
};

export default function AdminProfilePage() {
  return (
    <>
      <PageHeader
        title='Profile'
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Profile' },
        ]}
      />

      <ProfileForm />
    </>
  );
}
