'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [localUser, setLocalUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check localStorage only on client side
    try {
      const userStr = localStorage.getItem('user');
      setLocalUser(userStr ? JSON.parse(userStr) : null);
    } catch {
      setLocalUser(null);
    }
  }, []);

  useEffect(() => {
    // Don't redirect on the login page
    if (pathname === '/admin/login') return;
    
    // Only check localStorage after mounted
    if (mounted) {
      if (!localUser) {
        router.push('/admin/login');
      } else if (localUser.role !== 'ADMIN') {
        router.push('/dashboard');
      }
    }
  }, [router, pathname, localUser, mounted]);

  // Don't check auth on login page
  if (pathname === '/admin/login') return <>{children}</>;

  // Show loading while checking auth
  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-zinc-500">Loading...</div>
      </div>
    );
  }

  // Only check localStorage for auth after mounted
  if (!localUser) {
    return null;
  }
  
  if (localUser.role !== 'ADMIN') {
    return null;
  }

  const navItems = [
    { href: '/admin', label: 'Overview', icon: '📊' },
    { href: '/admin/users', label: 'Users', icon: '👥' },
    { href: '/admin/jobs', label: 'Jobs', icon: '⚙️' },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-[#0a192f]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#112240]">
        <div className="p-6">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Admin Dashboard</h1>
        </div>
        <nav className="px-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`mb-2 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                pathname === item.href
                  ? 'bg-blue-50 text-blue-900 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <Link
            href="/dashboard"
            className="mt-4 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
          >
            <span className="text-lg">🏠</span>
            Back to App
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
