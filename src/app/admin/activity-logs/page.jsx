import PageHeader from '@/components/ui/PageHeader';
import PermissionGuard from '@/components/layout/admin/PermissionGuard';
import ViewActivityLogs from '@/components/admin/activity-logs/View';

// set metadata for this page
export const metadata = {
  title: 'Activity Logs - Admin Dashboard',
  description: 'View and manage user log activities in the admin dashboard.',
};

export default function AdminActivityLogsPage() {
  return (
    <PermissionGuard permission='module.activity-log.index'>
      <PageHeader
        title='Activity Logs'
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Activity Logs' },
        ]}
      />
      <ViewActivityLogs />
    </PermissionGuard>
  );
}
