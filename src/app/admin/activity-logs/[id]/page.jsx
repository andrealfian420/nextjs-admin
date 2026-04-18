import PageHeader from '@/components/ui/PageHeader';
import PermissionGuard from '@/components/layout/admin/PermissionGuard';
import DetailActivityLog from '@/components/admin/activity-logs/DetailView';

export const metadata = {
  title: 'Detail Activity Log - Admin Dashboard',
};

export default function AdminActivityLogsDetailPage() {
  return (
    <PermissionGuard permission='module.activity-log.detail'>
      <PageHeader
        title='Detail Activity Log'
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Activity Logs', href: '/admin/activity-logs' },
          { label: 'Detail Activity Log' },
        ]}
      />

      <DetailActivityLog />
    </PermissionGuard>
  );
}
