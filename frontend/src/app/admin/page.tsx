'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

interface SystemStats {
  users: {
    total: number;
    active: number;
    deactivated: number;
    deleted: number;
  };
  files: number;
  jobs: number;
  storageUsed: number;
  jobStats: Record<string, number>;
  fileStats: Record<string, { count: number; totalSize: number }>;
  topUsers: Array<{
    id: string;
    email: string;
    name: string | null;
    fileCount: number;
    totalStorage: number;
  }>;
  usersPerMonth: Array<{
    month: string;
    count: number;
  }>;
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

  const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444'];

  const userStatusData = [
    { name: 'Active', value: stats.users.active },
    { name: 'Deactivated', value: stats.users.deactivated },
    { name: 'Deleted', value: stats.users.deleted },
  ].filter(item => item.value > 0);

  const fileTypeData = Object.entries(stats.fileStats || {}).map(([type, data]) => ({
    name: type,
    count: data.count,
    size: data.totalSize,
  }));

  const jobStatusData = Object.entries(stats.jobStats || {}).map(([status, count]) => ({
    name: status,
    value: count,
  }));

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-white">System Overview</h2>
      
      {/* User Statistics */}
      <div className="mb-8">
        <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">User Statistics</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#112240]">
            <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Users</div>
            <div className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">{stats.users.total}</div>
          </div>
          
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#112240]">
            <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Active Users</div>
            <div className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">{stats.users.active}</div>
          </div>
          
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#112240]">
            <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Deactivated Users</div>
            <div className="mt-2 text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.users.deactivated}</div>
          </div>
          
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#112240]">
            <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Deleted Users</div>
            <div className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">{stats.users.deleted}</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {/* User Status Pie Chart */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#112240]">
          <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">User Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {userStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Users Per Month Line Chart */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#112240]">
          <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">Users Per Month (Last 12 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.usersPerMonth || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" name="New Users" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* File Type Bar Chart */}
      <div className="mb-8">
        <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">File Type Usage</h3>
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#112240]">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={fileTypeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" name="File Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* File Statistics */}
      <div className="mb-8">
        <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">File Statistics</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#112240]">
            <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Files</div>
            <div className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">{stats.files}</div>
          </div>
          
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#112240]">
            <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Storage Used</div>
            <div className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">{formatBytes(stats.storageUsed)}</div>
          </div>
          
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#112240]">
            <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Transactions</div>
            <div className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">{stats.jobs}</div>
          </div>
        </div>
      </div>

      {/* File Type Breakdown */}
      <div className="mb-8">
        <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">File Usage by Type</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.fileStats && Object.keys(stats.fileStats).length > 0 ? (
            Object.entries(stats.fileStats).map(([fileType, data]) => (
              <div
                key={fileType}
                className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-[#112240]"
              >
                <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{fileType}</div>
                <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">{data.count} files</div>
                <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{formatBytes(data.totalSize)}</div>
              </div>
            ))
          ) : (
            <div className="col-span-4 text-zinc-500">No file data available</div>
          )}
        </div>
      </div>

      {/* Job Status Distribution */}
      <div className="mb-8">
        <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">Job Status Distribution</h3>
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#112240]">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={jobStatusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8b5cf6" name="Job Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Users by Storage */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">Top Users by Storage</h3>
        <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-[#112240]">
              <tr>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Email</th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Name</th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Files</th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Storage Used</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-[#0a192f]">
              {stats.topUsers && stats.topUsers.length > 0 ? (
                stats.topUsers.map((user, index) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white">
                      {index + 1}. {user.email}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{user.name || '-'}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{user.fileCount}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{formatBytes(user.totalStorage)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                    No user data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
