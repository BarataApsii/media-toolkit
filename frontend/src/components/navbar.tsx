'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-50">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src="/logo.png" alt="Media Toolkit" className="h-8 w-8" />
          <span className="text-xl font-bold text-blue-900 dark:text-blue-900">Media Toolkit</span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-blue-700 hover:text-blue-900 dark:text-blue-700 dark:hover:text-blue-900"
              >
                Dashboard
              </Link>
              <Link
                href="/upload"
                className="text-sm font-medium text-blue-700 hover:text-blue-900 dark:text-blue-700 dark:hover:text-blue-900"
              >
                Upload
              </Link>
              <Link
                href="/pricing"
                className="text-sm font-medium text-blue-700 hover:text-blue-900 dark:text-blue-700 dark:hover:text-blue-900"
              >
                Pricing
              </Link>
              <span className="text-sm text-blue-600">{user.name || user.email}</span>
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                user.subscriptionTier === 'PREMIUM'
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                  : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200'
              }`}>
                {user.subscriptionTier}
              </span>
              <button
                onClick={logout}
                className="rounded-md bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-800 hover:bg-blue-200 dark:bg-blue-100 dark:text-blue-800 dark:hover:bg-blue-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-blue-700 hover:text-blue-900 dark:text-blue-700 dark:hover:text-blue-900"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 dark:bg-blue-900 dark:text-white dark:hover:bg-blue-800"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
