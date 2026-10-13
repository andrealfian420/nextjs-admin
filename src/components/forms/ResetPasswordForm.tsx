'use client';

import { useState } from 'react';
import { authService } from '@/services/authService';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { toast } from '@/components/ui/Toast';
import AuthSplitShell from '@/components/layout/auth/AuthSplitShell';
import { applyApiFieldErrors } from '@/lib/api-errors';
import { getApiErrorMessage } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

// Same rule as the backend: min 8, an uppercase letter, a number and a special character.
const STRONG_PASSWORD = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const schema = z
  .object({
    newPassword: z
      .string()
      .regex(
        STRONG_PASSWORD,
        'Password must be at least 8 characters long and include an uppercase letter, a number, and a special character',
      ),
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

type ResetPasswordValues = z.infer<typeof schema>;

const requestNewLink = (
  <Link href='/forgot-password' className='font-medium underline underline-offset-4'>
    Request a new link
  </Link>
);

/**
 * Sets a new password with the token from the emailed link (POST /auth/reset-password). The
 * backend ends every session of that account; on success the user goes to the login page.
 */
export default function ResetPasswordForm({ token }: { token: string | null }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const {
    register,
    handleSubmit,
    setError: setFieldError,
    getValues,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async ({ newPassword }: ResetPasswordValues) => {
    if (!token) return;
    setIsLoading(true);
    setError(null);

    try {
      await authService.resetPassword({ token, newPassword });
      toast.success('Password updated', {
        description: 'Sign in with your new password.',
      });
      // Stays loading until the login page replaces this one.
      router.replace('/login');
    } catch (err: unknown) {
      // A bad, expired or used token comes back as a message, not a field error.
      const { applied, unmatched, description } = applyApiFieldErrors(err, {
        setError: setFieldError,
        getValues,
      });
      if (unmatched.length) setError(description);
      else if (!applied.length) {
        setError(getApiErrorMessage(err, 'Something went wrong. Please try again.'));
      }
      setIsLoading(false);
    }
  };

  const fieldError = (id: string, message?: string) =>
    message && (
      <p id={`${id}-error`} className='text-xs text-red-600 dark:text-red-400'>
        {message}
      </p>
    );

  return (
    <AuthSplitShell
      title='Choose a new password'
      subtitle="You'll need to sign in again on every device"
      panel={{
        title: (
          <>
            Almost there,
            <br />
            pick a new password.
          </>
        ),
        text: 'Use at least 8 characters with an uppercase letter, a number and a special character.',
      }}
    >
      {!token ? (
        <Alert variant='destructive'>
          <AlertDescription>
            This reset link is incomplete. {requestNewLink}.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {error && (
            <div className='mb-4'>
              <Alert variant='destructive' onDismiss={() => setError(null)}>
                <AlertDescription>
                  {error} {requestNewLink} if this one no longer works.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className='space-y-4'>
            <div className='space-y-1.5'>
              <Label htmlFor='newPassword' className='text-zinc-700 dark:text-zinc-300'>
                New password
              </Label>
              <div className='relative'>
                <Input
                  id='newPassword'
                  type={isPasswordVisible ? 'text' : 'password'}
                  placeholder='••••••••'
                  autoComplete='new-password'
                  aria-invalid={!!errors.newPassword}
                  aria-describedby={errors.newPassword ? 'newPassword-error' : undefined}
                  {...register('newPassword')}
                />
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  aria-label={isPasswordVisible ? 'Hide passwords' : 'Show passwords'}
                  className='absolute right-1.5 top-1/2 -translate-y-1/2 size-7 cursor-pointer text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-transparent'
                  onClick={() => setIsPasswordVisible((v) => !v)}
                >
                  {isPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
              {fieldError('newPassword', errors.newPassword?.message)}
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='confirmPassword' className='text-zinc-700 dark:text-zinc-300'>
                Confirm new password
              </Label>
              <Input
                id='confirmPassword'
                type={isPasswordVisible ? 'text' : 'password'}
                placeholder='••••••••'
                autoComplete='new-password'
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={
                  errors.confirmPassword ? 'confirmPassword-error' : undefined
                }
                {...register('confirmPassword')}
              />
              {fieldError('confirmPassword', errors.confirmPassword?.message)}
            </div>

            <Button
              className='w-full mt-2 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors cursor-pointer'
              type='submit'
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner size='sm' className='text-white dark:text-zinc-900' />
                  Saving...
                </>
              ) : (
                'Set new password'
              )}
            </Button>
          </form>
        </>
      )}

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
