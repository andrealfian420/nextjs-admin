import { Toaster } from '@/components/ui/Sonner';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AuthLayout({ children }) {
  const cookiesStore = await cookies();
  const token = cookiesStore.get('accessToken')?.value;

  if (token) {
    redirect('/admin');
  }

  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
