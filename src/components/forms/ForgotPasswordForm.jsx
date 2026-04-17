'use client';

import { useState } from 'react';
import { authService } from '@/services/authService';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import Link from 'next/link';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await authService.forgotPassword({ email });

      setSuccess(true);
    } catch (error) {
      setError(error?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-slate-200'>
      <form
        onSubmit={handleForgotPassword}
        className='bg-white p-10 rounded-2xl shadow-xl w-96'
      >
        <div className='space-y-6'>
          <div className='text-center space-y-1'>
            <h1 className='text-2xl font-bold text-slate-800'>
              Forgot Password
            </h1>
            <p className='text-sm text-slate-500'>
              Enter your email and we will send you a reset link
            </p>
          </div>

          {error && (
            <Alert variant='destructive' onDismiss={() => setError(null)}>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert variant='success' onDismiss={() => setSuccess(false)}>
              <AlertDescription>
                A password reset link has been sent to your email.
              </AlertDescription>
            </Alert>
          )}

          <Input
            type='email'
            placeholder='Email address'
            className='focus:ring-2 focus:ring-black'
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Button
            className='w-full bg-black text-white p-2.5 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-slate-800 transition disabled:opacity-70 cursor-pointer'
            type='submit'
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner size='sm' className='text-white' />
                Sending...
              </>
            ) : (
              'Send Reset Link'
            )}
          </Button>
        </div>

        <div className='flex justify-center mt-6'>
          <Link
            href='/login'
            className='text-sm text-slate-600 hover:underline'
          >
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
}
