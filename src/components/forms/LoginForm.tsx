'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import ThemeToggle from '@/components/frontend/ThemeToggle';
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
    <div className='min-h-screen flex bg-zinc-50 dark:bg-zinc-950 antialiased'>
      {/* Left branding panel */}
      <div className='hidden lg:flex lg:w-1/2 relative bg-zinc-900 dark:bg-zinc-900 items-center justify-center overflow-hidden'>
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.03)_0%,_transparent_60%)]' />
        <div className='relative z-10 px-12 max-w-md'>
          <div className='w-10 h-10 rounded-lg bg-white flex items-center justify-center mb-8'>
            <span className='text-sm font-bold text-zinc-900'>NA</span>
          </div>
          <h2 className='text-3xl font-bold text-white tracking-tight leading-tight'>
            Manage everything
            <br />
            from one place.
          </h2>
          <p className='mt-4 text-zinc-400 leading-relaxed'>
            Roles, permissions, users, and activity logs — your full admin
            toolkit, ready to go.
          </p>
        </div>
        {/* Decorative grid */}
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
                Welcome back
              </h1>
              <p className='mt-1 text-sm text-zinc-500 dark:text-zinc-400'>
                Sign in to your account to continue
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className='space-y-4'
            >
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
                    {isPasswordVisible ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
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
                    <Spinner
                      size='sm'
                      className='text-white dark:text-zinc-900'
                    />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
