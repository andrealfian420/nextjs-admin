'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { hasAccess } from '@/lib/permission';

export default function Can({ permission, children, fallback = null }) {
  const user = useAuthStore((state) => state.user);

  if (!user) return null;

  if (!hasAccess(user, permission)) {
    return fallback; // default null (hidden)
  }

  return children;
}
