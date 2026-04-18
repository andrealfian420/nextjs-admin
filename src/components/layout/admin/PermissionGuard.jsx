'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { hasAccess } from '@/lib/permission';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PermissionGuard({
  permission,
  fallback = '/admin',
  children,
}) {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    // Check if user has access to the required permission
    if (!hasAccess(user, permission)) {
      router.replace(fallback);
    }
  }, [user, permission]);

  if (!user) {
    return null;
  }

  if (!hasAccess(user, permission)) {
    return null;
  }

  return children;
}
