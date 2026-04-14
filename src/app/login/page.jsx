'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();

  const setAuth = useAuthStore((state) => state.setAuth);

  // State for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await authService.login({
        email,
        password,
      });

      setAuth(res.user, res.token);
      router.push('/admin');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen bg-slate-50'>
      <form
        onSubmit={handleLogin}
        className='bg-white p-8 rounded-xl shadow w-96 space-y-4'
      >
        <h1 className='text-xl font-bold'>Login</h1>

        <input
          className='w-full border p-2 rounded'
          placeholder='Email'
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type='password'
          className='w-full border p-2 rounded'
          placeholder='Password'
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className='w-full bg-black text-white p-2 rounded'
          type='submit'
        >
          Login
        </button>
      </form>
    </div>
  );
}
