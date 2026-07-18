'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface Job {
  id: string;
  status: string;
  operation: string;
  outputPath: string | null;
  outputSize: number | null;
  completedAt: string | null;
}

interface FileRecord {
  id: string;
  originalName: string;
  fileType: string;
  size: number;
  createdAt: string;
  jobs: Job[];
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
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

  const handleDownload = async (jobId: string) => {
    try {
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/files/download/${jobId}`;
      // Refresh files after download to remove the downloaded entry
      setTimeout(() => fetchFiles(), 1500);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  useEffect(() => {
    fetchFiles();
    const interval = setInterval(fetchFiles, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalFiles = files.length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-blue-900">Dashboard</h1>
      </div>

      {/* Media type selection */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-blue-900">Upload New File</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/upload?type=image"
            className="rounded-xl border border-zinc-200 bg-white p-6 transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-blue-200 dark:bg-white dark:hover:border-blue-400 dark:hover:bg-blue-50"
          >
            <div className="mb-3 text-2xl">🖼️</div>
            <h3 className="font-semibold text-zinc-900 dark:text-blue-900">Image</h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-blue-600">
              Compress images
            </p>
          </Link>
          <Link
            href="/upload?type=video"
            className="rounded-xl border border-zinc-200 bg-white p-6 transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-blue-200 dark:bg-white dark:hover:border-blue-400 dark:hover:bg-blue-50"
          >
            <div className="mb-3 text-2xl">🎬</div>
            <h3 className="font-semibold text-zinc-900 dark:text-blue-900">Video</h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-blue-600">
              Compress videos
            </p>
          </Link>
          <Link
            href="/upload?type=audio"
            className="rounded-xl border border-zinc-200 bg-white p-6 transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-blue-200 dark:bg-white dark:hover:border-blue-400 dark:hover:bg-blue-50"
          >
            <div className="mb-3 text-2xl">🎵</div>
            <h3 className="font-semibold text-zinc-900 dark:text-blue-900">Audio</h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-blue-600">
              Compress audio files
            </p>
          </Link>
          <Link
            href="/upload?type=pdf"
            className="rounded-xl border border-zinc-200 bg-white p-6 transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-blue-200 dark:bg-white dark:hover:border-blue-400 dark:hover:bg-blue-50"
          >
            <div className="mb-3 flex items-center justify-center">
              <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="2" width="16" height="20" rx="2" fill="#EF4444" />
                <path d="M8 7h8M8 11h8M8 15h5" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="font-semibold text-zinc-900 dark:text-blue-900">PDF</h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-blue-600">
              Compress PDF files
            </p>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-blue-200 dark:bg-white">
          <p className="text-sm text-zinc-500 dark:text-blue-600">Total Files</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-blue-900">{totalFiles}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-blue-200 dark:bg-white">
          <p className="text-sm text-zinc-500 dark:text-blue-600">Total Size</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-blue-900">
            {formatBytes(files.reduce((sum, f) => sum + f.size, 0))}
          </p>
        </div>
      </div>

      {/* Files table */}
      {loading ? (
        <div className="py-12 text-center text-zinc-500">Loading files...</div>
      ) : files.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-blue-200 dark:bg-white">
          <p className="text-zinc-500 dark:text-blue-600">No files uploaded yet.</p>
          <Link
            href="/upload"
            className="mt-4 inline-block rounded-md bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 dark:bg-blue-900 dark:text-white dark:hover:bg-blue-800"
          >
            Upload your first file
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-blue-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-blue-200 dark:bg-blue-50">
              <tr>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-blue-700">File</th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-blue-700">Type</th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-blue-700">Size</th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-blue-700">Status</th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-blue-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white dark:divide-blue-200 dark:bg-white">
              {files.map((file) => {
                const latestJob = file.jobs[0];
                return (
                  <tr key={file.id}>
                    <td className="px-4 py-3 font-medium text-zinc-900 dark:text-blue-900">
                      {file.originalName}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-blue-600">{file.fileType}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-blue-600">{formatBytes(file.size)}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-blue-600">
                      {latestJob ? (
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            latestJob.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : latestJob.status === 'FAILED'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}
                        >
                          {latestJob.status}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {latestJob?.status === 'COMPLETED' && latestJob.id ? (
                        <button
                          onClick={() => handleDownload(latestJob.id)}
                          className="rounded-md bg-blue-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-800 dark:bg-blue-900 dark:text-white dark:hover:bg-blue-800"
                        >
                          Download
                        </button>
                      ) : latestJob?.status === 'FAILED' ? (
                        <span className="text-xs text-red-600 dark:text-red-400">Failed</span>
                      ) : (
                        <span className="text-xs text-zinc-500 dark:text-blue-600">Processing...</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
