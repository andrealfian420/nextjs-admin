'use client';

import { useState } from 'react';
import { authService } from '@/services/authService';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import AuthSplitShell from '@/components/layout/auth/AuthSplitShell';
import { getApiErrorMessage } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

type ForgotPasswordValues = z.infer<typeof schema>;

/**
 * Asks the backend to email a reset link (POST /auth/request-password-reset). The answer is
 * the same whether or not the account exists, so the success notice says so too.
 */
export default function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await authService.forgotPassword(data);
      setSuccess(true);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Something went wrong. Please try again.'));
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
              If an account exists for that email, a reset link is on its way.
            </AlertDescription>
          </Alert>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className='space-y-4'>
        <div className='space-y-1.5'>
          <Label htmlFor='email' className='text-zinc-700 dark:text-zinc-300'>
            Email
          </Label>
          <Input
            id='email'
            type='email'
            placeholder='you@example.com'
            autoComplete='email'
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email')}
          />
          {errors.email && (
            <p id='email-error' className='text-xs text-red-600 dark:text-red-400'>
              {errors.email.message}
            </p>
          )}
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
          <ArrowLeft size={14} aria-hidden />
          Back to sign in
        </Link>
      </div>
    </AuthSplitShell>
  );
}
