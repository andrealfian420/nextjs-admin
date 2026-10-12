'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { Spinner } from '@/components/ui/Spinner';

// Holds the admin shell until AuthProvider has loaded the signed-in profile, so the sidebar,
// navbar and page guards never render against a missing user. AuthProvider ends the wait:
// it loads the profile, redirects a rejected session to /login, or shows a retry screen.
// Authorization stays per page (PermissionGuard) and on the backend.
export default function AdminAccessGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950'>
        <Spinner />
      </div>
    );
  }

  return children;
}
