'use client';

import { useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';
import { SunIcon, MoonIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const noopSubscribe = () => () => {};

// The theme is only known in the browser: render a same-size placeholder on the server and
// during hydration, the real button afterwards.
export default function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  if (!mounted) {
    return <div className='w-9 h-9' />;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type='button'
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={cn(
        'p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
        className,
      )}
    >
      {isDark ? (
        <SunIcon size={18} className='text-zinc-400' aria-hidden />
      ) : (
        <MoonIcon size={18} className='text-zinc-600' aria-hidden />
      )}
    </button>
  );
}
