'use client';

import { useState } from 'react';
import { authService } from '@/services/authService';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import AuthSplitShell from '@/components/layout/auth/AuthSplitShell';
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
    <AuthSplitShell
      title='Reset password'
      subtitle="Enter your email and we'll send you a reset link"
      panel={{
        title: (
          <>
            No worries,
            <br />
            we&apos;ll get you back in.
          </>
        ),
        text: "Enter your email and we'll send you a link to reset your password.",
      }}
    >
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
              <Spinner size='sm' className='text-white dark:text-zinc-900' />
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
    </AuthSplitShell>
  );
}
