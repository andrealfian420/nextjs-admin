import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ClientLayout from '@/components/layout/admin/ClientLayout';

export default async function AdminLayout({ children }) {
  return <ClientLayout>{children}</ClientLayout>;
}
