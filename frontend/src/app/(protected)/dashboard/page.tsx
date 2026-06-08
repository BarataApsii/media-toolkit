'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface FileRecord {
  id: string;
  originalName: string;
  fileType: string;
  size: number;
  createdAt: string;
  jobs: JobRecord[];
}

interface JobRecord {
  id: string;
  status: string;
  operation: string;
  outputSize: number | null;
  createdAt: string;
  completedAt: string | null;
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    PROCESSING: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    FAILED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] || 'bg-zinc-100 text-zinc-800'}`}>
      {status}
    </span>
  );
}

export default function DashboardPage() {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFiles = async () => {
    try {
      const res = await api.get('/files/user/me');
      setFiles(res.data);
    } catch {
      // silently fail on first load if backend is not running
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
    const interval = setInterval(fetchFiles, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalFiles = files.length;
  const totalJobs = files.reduce((sum, f) => sum + f.jobs.length, 0);
  const completedJobs = files.reduce(
    (sum, f) => sum + f.jobs.filter((j) => j.status === 'COMPLETED').length,
    0,
  );
  const totalSaved = files.reduce(
    (sum, f) =>
      sum +
      f.jobs
        .filter((j) => j.status === 'COMPLETED' && j.outputSize !== null)
        .reduce((s, j) => s + (f.size - (j.outputSize ?? 0)), 0),
    0,
  );

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Dashboard</h1>
        <Link
          href="/upload"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
        >
          Upload File
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500">Total Files</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">{totalFiles}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500">Total Jobs</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">{totalJobs}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500">Completed</p>
          <p className="mt-1 text-2xl font-bold text-green-600">{completedJobs}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500">Space Saved</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
            {totalSaved > 0 ? formatBytes(totalSaved) : '—'}
          </p>
        </div>
      </div>

      {/* Files table */}
      {loading ? (
        <div className="py-12 text-center text-zinc-500">Loading files...</div>
      ) : files.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500">No files uploaded yet.</p>
          <Link
            href="/upload"
            className="mt-4 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
          >
            Upload your first file
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">File</th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Type</th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Size</th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Jobs</th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
              {files.map((file) => (
                <tr key={file.id}>
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white">
                    {file.originalName}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{file.fileType}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{formatBytes(file.size)}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{file.jobs.length}</td>
                  <td className="px-4 py-3">
                    {file.jobs.length > 0
                      ? statusBadge(file.jobs[0].status)
                      : <span className="text-zinc-400">No jobs</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
