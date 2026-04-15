'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';

export default function ForgotPasswordForm() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authService.forgotPassword({ email });

      alert('Password reset link has been sent to your email.');
      router.push('/login');
    } catch (error) {
      alert(error.message);
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
              Enter your email and we'll send you a reset link
            </p>
          </div>

          <Input
            type='email'
            placeholder='Email address'
            className='focus:ring-2 focus:ring-black'
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            className='w-full bg-black text-white p-2.5 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-slate-800 transition disabled:opacity-70 cursor-pointer'
            type='submit'
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></span>
                Sending...
              </>
            ) : (
              'Send Reset Link'
            )}
          </button>
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
