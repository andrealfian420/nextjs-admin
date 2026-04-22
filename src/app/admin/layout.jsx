import ClientLayout from '@/components/layout/admin/ClientLayout';

export default async function AdminLayout({ children }) {
  return <ClientLayout>{children}</ClientLayout>;
}
