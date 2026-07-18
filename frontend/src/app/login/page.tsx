'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user: userData, accessToken } = res.data;
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      toast.success('Logged in successfully');
      
      // Redirect admin to admin dashboard, regular users to regular dashboard
      if (userData.role === 'ADMIN') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { message: string } } }).response?.data?.message
          : 'Login failed';
      toast.error(message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center bg-white px-4 py-12 dark:bg-[#0a192f]">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-2xl font-bold text-blue-900 dark:text-white">Sign in to your account</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-blue-200 bg-white p-8 shadow-sm dark:border-blue-200 dark:bg-white"
        >
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-blue-700 dark:text-blue-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-md border border-blue-300 px-3 py-2 text-sm text-blue-900 placeholder-blue-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-blue-300 dark:bg-white dark:text-blue-900"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-blue-700 dark:text-blue-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-md border border-blue-300 px-3 py-2 text-sm text-blue-900 placeholder-blue-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-blue-300 dark:bg-white dark:text-blue-900"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-md bg-blue-900 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50 dark:bg-blue-900 dark:text-white dark:hover:bg-blue-800"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="mt-4 text-center text-sm text-blue-600 dark:text-blue-600">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-blue-900 dark:text-blue-900">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
