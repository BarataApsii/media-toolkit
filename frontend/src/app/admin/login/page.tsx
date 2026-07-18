'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { getAuthErrorMessage } from '@/lib/error-messages';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user: userData, accessToken } = res.data;
      
      if (userData.role !== 'ADMIN') {
        toast.error('Access denied. Admin privileges required.');
        setLoading(false);
        return;
      }
      
      // Set localStorage directly
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      toast.success('Admin login successful');
      
      // Force hard redirect to admin dashboard
      window.location.href = '/admin';
    } catch (err: unknown) {
      const error = getAuthErrorMessage(err);
      toast.error(`${error.message}. ${error.suggestion}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-purple-500/20 p-4">
            <svg className="h-8 w-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">Admin Portal</h1>
          <p className="mt-2 text-purple-300">Sign in to access admin dashboard</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-purple-500/30 bg-white/10 backdrop-blur-lg p-8 shadow-2xl"
        >
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-purple-200">
                Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-purple-500/30 bg-white/5 px-4 py-3 text-sm text-white placeholder-purple-300/50 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 backdrop-blur-sm"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-purple-200">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-purple-500/30 bg-white/5 px-4 py-3 text-sm text-white placeholder-purple-300/50 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 backdrop-blur-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200"
          >
            {loading ? 'Authenticating...' : 'Access Admin Dashboard'}
          </button>

          <div className="mt-6 border-t border-purple-500/30 pt-6">
            <Link
              href="/login"
              className="block w-full text-center text-sm text-purple-300 hover:text-white transition-colors"
            >
              ← Back to User Login
            </Link>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-purple-400/60">
          Restricted access. Authorized personnel only.
        </p>
      </div>
    </div>
  );
}
