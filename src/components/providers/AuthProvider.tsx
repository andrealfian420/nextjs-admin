'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { refreshProfile, restoreSession, type RestoreResult } from '@/lib/auth';
import { clearSessionCookie } from '@/lib/force-logout';
import { useAuthStore } from '@/store/useAuthStore';

type Problem = 'unreachable' | 'cleanup-failed';

const isAdminPath = (path: string) =>
  path === '/admin' || path.startsWith('/admin/');

const MESSAGES: Record<Problem, string> = {
  unreachable: "We couldn't reach the server. Check your connection and try again.",
  'cleanup-failed': "We couldn't end your session. Please try again.",
};

// Restores the session on load (refresh cookie → access token → profile) and keeps the
// profile fresh on navigation. On admin pages a rejected session is cleared and sent to
// /login; a failure that leaves no way forward shows a retry screen instead of a spinner.
export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [problem, setProblem] = useState<Problem | null>(null);

  // The cookie must be gone before navigating, or the proxy sends the browser back to /admin.
  const endSession = useCallback(async () => {
    useAuthStore.getState().logout();
    try {
      await clearSessionCookie();
      setProblem(null);
      router.replace('/login');
    } catch {
      setProblem('cleanup-failed');
    }
  }, [router]);

  const applyResult = useCallback(
    (result: RestoreResult) => {
      // Public pages work without a session, whatever the outcome.
      if (result === 'authenticated' || !isAdminPath(window.location.pathname)) {
        setProblem(null);
      } else if (result === 'unreachable') {
        setProblem('unreachable');
      } else {
        return endSession();
      }
    },
    [endSession],
  );

  useEffect(() => {
    // StrictMode runs this twice; both share one restore, but only the live run acts on it.
    let active = true;
    void restoreSession().then((result) => {
      if (active) return applyResult(result);
    });
    return () => {
      active = false;
    };
  }, [applyResult]);

  // Re-read the profile on navigation so permission changes apply without a reload. Skipped
  // until the session is restored (restore loads the profile itself).
  useEffect(() => {
    if (useAuthStore.getState().user) void refreshProfile();
  }, [pathname]);

  if (problem && isAdminPath(pathname)) {
    const retry = () => {
      setProblem(null);
      void (problem === 'unreachable'
        ? restoreSession().then(applyResult)
        : endSession());
    };

    return (
      <div className='flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 px-4 text-center text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100'>
        <p role='alert'>{MESSAGES[problem]}</p>
        <Button type='button' onClick={retry}>
          Try again
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
