'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/useAuthStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from '@/components/ui/Toast';
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

  const onSubmit = async (data) => {
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
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      const apiMessage = err.response?.data?.message;

      if (apiErrors) {
        apiErrors.forEach((e) => {
          setError(e.field, { message: e.message });
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

      setIsLoading(false);
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800'>
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className='bg-white p-10 rounded-2xl shadow-xl w-96 dark:bg-slate-800 dark:shadow-slate-900/50'
      >
        <div className='space-y-6'>
          <div className='text-center space-y-1'>
            <h1 className='text-2xl font-bold text-slate-800 dark:text-slate-100'>
              Welcome Back
            </h1>
            <p className='text-sm text-slate-500 dark:text-slate-400'>
              Sign in to your account
            </p>
          </div>

          <div className='space-y-1'>
            <Input
              type='email'
              placeholder='Email'
              className='focus:ring-2 focus:ring-black'
              aria-invalid={!!errors.email}
              {...register('email')}
            />
            {errors.email && (
              <p className='text-xs text-red-500'>{errors.email.message}</p>
            )}
          </div>

          <div className='space-y-1'>
            <div className='relative'>
              <Input
                type={isPasswordVisible ? 'text' : 'password'}
                placeholder='Password'
                className='focus:ring-2 focus:ring-black'
                aria-invalid={!!errors.password}
                {...register('password')}
              />

              <Button
                onClick={togglePassword}
                type='button'
                variant='ghost'
                size='icon'
                className='absolute right-2 top-1/2 -translate-y-1/2 size-7 cursor-pointer text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-transparent'
              >
                {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
              </Button>
            </div>

            {errors.password && (
              <p className='text-xs text-red-500'>{errors.password.message}</p>
            )}
          </div>

          <Button
            className='w-full bg-black text-white p-2.5 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-slate-800 transition disabled:opacity-70 cursor-pointer dark:bg-slate-700 dark:hover:bg-slate-600'
            type='submit'
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner size='sm' className='text-white' />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </div>

        <div className='flex justify-center mt-4'>
          <Link
            href='/forgot-password'
            className='text-sm text-center hover:underline'
          >
            Forgot your password?
          </Link>
        </div>
      </form>
    </div>
  );
}
