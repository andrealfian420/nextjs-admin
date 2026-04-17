'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/useAuthStore';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from '@/components/ui/Toast';

export default function LoginForm() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState({}); // field error

  const togglePassword = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setErrors({});

    try {
      const res = await authService.login({ email, password });

      if (res?.data?.user) {
        setUser(res.data.user);
      }

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
      if (err.errors) {
        const formatted = {};
        err.errors.forEach((e) => {
          formatted[e.field] = e.message;
        });
        setErrors(formatted);
      } else {
        toast.error(
          err?.message || 'Login failed. Please check your credentials.',
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
        onSubmit={handleLogin}
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
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: null }));
              }}
              required
            />
            {errors.email && (
              <p className='text-xs text-red-500'>{errors.email}</p>
            )}
          </div>

          <div className='space-y-1'>
            <div className='relative'>
              <Input
                type={isPasswordVisible ? 'text' : 'password'}
                placeholder='Password'
                className='focus:ring-2 focus:ring-black'
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, password: null }));
                }}
                required
              />

              <Button
                onClick={togglePassword}
                type='button'
                className='absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded cursor-pointer'
              >
                {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
              </Button>
            </div>

            {errors.password && (
              <p className='text-xs text-red-500'>{errors.password}</p>
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
