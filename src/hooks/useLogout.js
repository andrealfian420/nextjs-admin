'use client';

import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';

export function useLogout() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    try {
      await authService.logout();
      logout();
      router.replace('/login'); // Use replace to prevent going back to the protected page
    } catch (error) {
      toast.error('Logout failed. Please try again.', {
        position: 'top-center',
      });
    }
  };

  return { handleLogout };
}
