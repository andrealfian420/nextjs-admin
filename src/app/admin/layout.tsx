import ClientLayout from '@/components/layout/admin/ClientLayout';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
