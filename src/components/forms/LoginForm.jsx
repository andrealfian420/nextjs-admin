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
import { useEffect, useState } from 'react';

export default function LoginForm() {
  const token = useAuthStore((state) => state.token);
  const router = useRouter();

  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  const togglePassword = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await authService.login({ email, password });

      setAuth(res.token, res.user);
      router.push('/admin');
    } catch (error) {
      setError(
        error?.message || 'Login failed. Please check your credentials.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect(() => {
  //   setHydrated(useAuthStore.persist.hasHydrated());

  //   const unsub = useAuthStore.persist.onFinishHydration(() => {
  //     setHydrated(true);
  //   });

  //   return () => unsub();
  // }, []);

  // useEffect(() => {
  //   if (hydrated && token) {
  //     router.replace('/admin');
  //   }
  // }, [hydrated, token]);

  // if (!hydrated) {
  //   return null;
  // }

  // if (token) {
  //   return null;
  // }

  return (
    <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-slate-200'>
      <form
        onSubmit={handleLogin}
        className='bg-white p-10 rounded-2xl shadow-xl w-96 '
      >
        <div className='space-y-6'>
          <div className='text-center space-y-1'>
            <h1 className='text-2xl font-bold text-slate-800'>Welcome Back</h1>
            <p className='text-sm text-slate-500'>Sign in to your account</p>
          </div>

          {error && (
            <Alert variant='destructive' onDismiss={() => setError(null)}>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Input
            type='email'
            placeholder='Email'
            className='focus:ring-2 focus:ring-black'
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className='relative'>
            <Input
              type={isPasswordVisible ? 'text' : 'password'}
              placeholder='Password'
              className='focus:ring-2 focus:ring-black'
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              onClick={togglePassword}
              type='button'
              className='absolute right-2 p-1 rounded cursor-pointer'
            >
              {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
            </Button>
          </div>

          <Button
            className='w-full bg-black text-white p-2.5 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-slate-800 transition disabled:opacity-70 cursor-pointer'
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
