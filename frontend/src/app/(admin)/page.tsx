'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface SystemStats {
  users: number;
  files: number;
  jobs: number;
  storageUsed: number;
  jobStats: Record<string, number>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-zinc-500">Loading...</div>;
  }

  if (!stats) {
    return <div className="text-red-500">Failed to load stats</div>;
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-white">System Overview</h2>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#112240]">
          <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Users</div>
          <div className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">{stats.users}</div>
        </div>
        
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#112240]">
          <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Files</div>
          <div className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">{stats.files}</div>
        </div>
        
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#112240]">
          <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Jobs</div>
          <div className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">{stats.jobs}</div>
        </div>
        
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#112240]">
          <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Storage Used</div>
          <div className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">{formatBytes(stats.storageUsed)}</div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">Job Status Distribution</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(stats.jobStats).map(([status, count]) => (
            <div
              key={status}
              className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-[#112240]"
            >
              <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{status}</div>
              <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">{count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
