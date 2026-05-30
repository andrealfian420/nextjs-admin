'use client';

import { useState } from 'react';
import { authService } from '@/services/authService';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import ThemeToggle from '@/components/frontend/ThemeToggle';
import { isAxiosError } from 'axios';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await authService.forgotPassword({ email });

      setSuccess(true);
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            'Something went wrong. Please try again.',
        );
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex bg-zinc-50 dark:bg-zinc-950 antialiased'>
      {/* Left branding panel */}
      <div className='hidden lg:flex lg:w-1/2 relative bg-zinc-900 dark:bg-zinc-900 items-center justify-center overflow-hidden'>
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,255,255,0.03)_0%,_transparent_60%)]' />
        <div className='relative z-10 px-12 max-w-md'>
          <div className='w-10 h-10 rounded-lg bg-white flex items-center justify-center mb-8'>
            <span className='text-sm font-bold text-zinc-900'>NA</span>
          </div>
          <h2 className='text-3xl font-bold text-white tracking-tight leading-tight'>
            No worries,
            <br />
            we&apos;ll get you back in.
          </h2>
          <p className='mt-4 text-zinc-400 leading-relaxed'>
            Enter your email and we&apos;ll send you a link to reset your
            password.
          </p>
        </div>
        <div className='absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-zinc-950/80 to-transparent' />
        <div
          className='absolute inset-0 opacity-[0.03]'
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none' stroke='white' stroke-width='.5'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      {/* Right form panel */}
      <div className='flex-1 flex flex-col'>
        <div className='flex justify-end p-4'>
          <ThemeToggle />
        </div>

        <div className='flex-1 flex items-center justify-center px-6 pb-12'>
          <div className='w-full max-w-sm'>
            {/* Mobile logo */}
            <div className='lg:hidden flex items-center gap-2 mb-8'>
              <div className='w-8 h-8 rounded-md bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center'>
                <span className='text-xs font-bold text-white dark:text-zinc-900'>
                  NA
                </span>
              </div>
              <span className='text-sm font-semibold text-zinc-900 dark:text-zinc-100'>
                nextjs-admin
              </span>
            </div>

            <div className='mb-8'>
              <h1 className='text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight'>
                Reset password
              </h1>
              <p className='mt-1 text-sm text-zinc-500 dark:text-zinc-400'>
                Enter your email and we&apos;ll send you a reset link
              </p>
            </div>

            {error && (
              <div className='mb-4'>
                <Alert variant='destructive' onDismiss={() => setError(null)}>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}

            {success && (
              <div className='mb-4'>
                <Alert variant='success' onDismiss={() => setSuccess(false)}>
                  <AlertDescription>
                    A password reset link has been sent to your email.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            <form onSubmit={handleForgotPassword} className='space-y-4'>
              <div className='space-y-1.5'>
                <label
                  htmlFor='email'
                  className='text-sm font-medium text-zinc-700 dark:text-zinc-300'
                >
                  Email
                </label>
                <Input
                  id='email'
                  type='email'
                  placeholder='you@example.com'
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button
                className='w-full mt-2 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors cursor-pointer'
                type='submit'
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner
                      size='sm'
                      className='text-white dark:text-zinc-900'
                    />
                    Sending...
                  </>
                ) : (
                  'Send reset link'
                )}
              </Button>
            </form>

            <div className='mt-6'>
              <Link
                href='/login'
                className='inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors'
              >
                <ArrowLeft size={14} />
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
