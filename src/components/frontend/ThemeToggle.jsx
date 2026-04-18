'use client';

import { useTheme } from 'next-themes';
import { SunIcon, MoonIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className='w-9 h-9' />;
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-label='Toggle theme'
      className='p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer'
    >
      {resolvedTheme === 'dark' ? (
        <SunIcon size={18} className='text-slate-400' />
      ) : (
        <MoonIcon size={18} className='text-slate-600' />
      )}
    </button>
  );
}
