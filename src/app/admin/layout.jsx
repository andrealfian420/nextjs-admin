import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ClientLayout from '@/components/layout/admin/ClientLayout';

export default async function AdminLayout({ children }) {
  const cookiesStore = await cookies();
  const token = cookiesStore.get('accessToken')?.value;

  if (!token) {
    redirect('/login');
  }

  return <ClientLayout>{children}</ClientLayout>;
}
