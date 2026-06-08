'use client';

import { useState, useCallback } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [operation, setOperation] = useState('compress');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const router = useRouter();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      await api.post('/jobs/create', {
        fileId: uploadRes.data.id,
        operation,
      });

      toast.success('File uploaded and job queued!');
      router.push('/dashboard');
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { message: string } } }).response?.data?.message
          : 'Upload failed';
      toast.error(message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-8 text-2xl font-bold text-zinc-900 dark:text-white">Upload Media</h1>

      <form onSubmit={handleSubmit}>
        {/* Drop zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`rounded-xl border-2 border-dashed p-12 text-center transition-colors ${
            dragActive
              ? 'border-zinc-500 bg-zinc-100 dark:border-zinc-400 dark:bg-zinc-900'
              : 'border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900'
          }`}
        >
          {file ? (
            <div>
              <p className="font-medium text-zinc-900 dark:text-white">{file.name}</p>
              <p className="mt-1 text-sm text-zinc-500">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="mt-3 text-sm text-red-600 hover:text-red-500"
              >
                Remove
              </button>
            </div>
          ) : (
            <div>
              <p className="text-zinc-600 dark:text-zinc-400">
                Drag and drop your file here, or{' '}
                <label className="cursor-pointer font-medium text-zinc-900 underline dark:text-white">
                  browse
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,video/*"
                    onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                  />
                </label>
              </p>
              <p className="mt-2 text-xs text-zinc-400">
                Supports JPEG, PNG, WebP, GIF, MP4, AVI, MOV, MKV (max 100MB)
              </p>
            </div>
          )}
        </div>

        {/* Operation selector */}
        <div className="mt-6">
          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Operation
          </label>
          <select
            value={operation}
            onChange={(e) => setOperation(e.target.value)}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          >
            <option value="compress">Compress</option>
            <option value="resize">Resize (1920×1080 max)</option>
            <option value="webp">Convert to WebP</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={!file || uploading}
          className="mt-6 w-full rounded-md bg-zinc-900 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
        >
          {uploading ? 'Uploading & Processing...' : 'Upload & Process'}
        </button>
      </form>
    </div>
  );
}
