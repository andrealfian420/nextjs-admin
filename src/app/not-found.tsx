'use client';

import Link from 'next/link';
import ThemeToggle from '@/components/frontend/ThemeToggle';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  const handleGoBack = () => {
    const path = window.location.pathname;

    // if the path is /route/subroute, we want to go back to /route
    // otherswise, if we are at the root level, we can just go back to the home page
    const parentPath = path.split('/').slice(0, -1).join('/') || '/';
    window.location.href = parentPath;
  };

  return (
    <div className='min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 antialiased'>
      <div className='flex justify-end p-4'>
        <ThemeToggle />
      </div>

      <div className='flex-1 flex items-center justify-center px-6 pb-12'>
        <div className='w-full max-w-sm text-center'>
          <div className='flex items-center justify-center mb-6'>
            <div className='w-10 h-10 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center'>
              <span className='text-sm font-bold text-white dark:text-zinc-900'>
                NA
              </span>
            </div>
          </div>

          <div className='text-[6rem] font-bold text-zinc-200 dark:text-zinc-800 leading-none select-none'>
            404
          </div>

          <div className='mt-6 mb-8'>
            <h1 className='text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight'>
              Page not found
            </h1>
            <p className='mt-2 text-sm text-zinc-500 dark:text-zinc-400'>
              The page you&apos;re looking for doesn&apos;t exist or has been
              moved.
            </p>
          </div>

          <div className='space-y-3'>
            <Link href='/'>
              <Button className='w-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors cursor-pointer'>
                Go back home
              </Button>
            </Link>

            <div className='mt-4'>
              <button
                onClick={handleGoBack}
                className='inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer'
              >
                <ArrowLeft size={14} />
                Go back to previous page
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
