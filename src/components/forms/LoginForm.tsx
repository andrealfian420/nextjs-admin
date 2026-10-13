'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import AuthSplitShell from '@/components/layout/auth/AuthSplitShell';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/useAuthStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from '@/components/ui/Toast';
import { isAxiosError } from 'axios';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginForm() {
  const router = useRouter();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setUser = useAuthStore((state) => state.setUser);

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const togglePassword = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setIsLoading(true);

    try {
      const res = await authService.login(data);

      setAccessToken(res.data.data.accessToken);

      const user = await authService.profile();
      setUser(user.data.data);

      const duration = 2000;

      toast.success('Login successful!', {
        position: 'top-center',
        duration,
      });

      setTimeout(() => {
        setIsLoading(false);
        router.push('/admin');
      }, duration);
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const apiErrors = err.response?.data?.errors;
        const apiMessage = err.response?.data?.message;

        if (apiErrors) {
          apiErrors.forEach((e: { field: string; message: string }) => {
            setError(e.field as 'email' | 'password', { message: e.message });
          });
        } else {
          toast.error(
            apiMessage || 'Login failed. Please check your credentials.',
            {
              position: 'top-center',
              duration: 10000,
            },
          );
        }
      } else {
        toast.error('Login failed. Please check your credentials.', {
          position: 'top-center',
          duration: 10000,
        });
      }

      setIsLoading(false);
    }
  };

  return (
    <AuthSplitShell
      title='Welcome back'
      subtitle='Sign in to your account to continue'
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className='space-y-4'>
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
            aria-invalid={!!errors.email}
            {...register('email')}
          />
          {errors.email && (
            <p className='text-xs text-red-600 dark:text-red-400'>
              {errors.email.message}
            </p>
          )}
        </div>

        <div className='space-y-1.5'>
          <div className='flex items-center justify-between'>
            <label
              htmlFor='password'
              className='text-sm font-medium text-zinc-700 dark:text-zinc-300'
            >
              Password
            </label>
            <Link
              href='/forgot-password'
              className='text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors'
            >
              Forgot password?
            </Link>
          </div>
          <div className='relative'>
            <Input
              id='password'
              type={isPasswordVisible ? 'text' : 'password'}
              placeholder='••••••••'
              aria-invalid={!!errors.password}
              {...register('password')}
            />
            <Button
              onClick={togglePassword}
              type='button'
              variant='ghost'
              size='icon'
              className='absolute right-1.5 top-1/2 -translate-y-1/2 size-7 cursor-pointer text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-transparent'
            >
              {isPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
          </div>
          {errors.password && (
            <p className='text-xs text-red-600 dark:text-red-400'>
              {errors.password.message}
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
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>
    </AuthSplitShell>
  );
}
