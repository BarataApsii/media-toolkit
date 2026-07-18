'use client';

import { useState, useCallback, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

type FileType = 'image' | 'video' | 'pdf' | 'audio';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<FileType | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam && ['image', 'video', 'audio', 'pdf'].includes(typeParam)) {
      setFileType(typeParam as FileType);
    }
  }, [searchParams]);

  const getAcceptTypes = (type: FileType): string => {
    switch (type) {
      case 'image':
        return 'image/*';
      case 'video':
        return 'video/*';
      case 'pdf':
        return '.pdf';
      case 'audio':
        return 'audio/*';
    }
  };


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

  const handleFileTypeChange = (type: FileType) => {
    setFileType(type);
    setFile(null);
  };

  const getAcceptTypesSafe = (type: FileType | null): string => {
    if (!type) return '';
    return getAcceptTypes(type);
  };


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
        operation: 'compress',
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
      <h1 className="mb-8 text-2xl font-bold text-zinc-900 dark:text-blue-900">Upload Media</h1>

      {/* Upgrade prompt for free users */}
      {user?.subscriptionTier === 'FREE' && (
        <div className="mb-6 rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Upgrade to Premium</h3>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                Get larger file limits: 500MB videos, 200MB audio, 100MB images/PDFs
              </p>
            </div>
            <button
              onClick={() => router.push('/pricing')}
              className="rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700 dark:bg-yellow-500 dark:text-yellow-900 dark:hover:bg-yellow-400"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* File type selector */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-blue-700">
            File Type <span className="text-red-500">*</span>
          </label>
          <select
            value={fileType || ''}
            onChange={(e) => handleFileTypeChange(e.target.value as FileType)}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-blue-300 dark:bg-white dark:text-blue-900"
          >
            <option value="">Select a file type</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="audio">Audio</option>
            <option value="pdf">PDF</option>
          </select>
        </div>

        {/* Drop zone */}
        <div
          onDragEnter={fileType ? handleDrag : undefined}
          onDragLeave={fileType ? handleDrag : undefined}
          onDragOver={fileType ? handleDrag : undefined}
          onDrop={fileType ? handleDrop : undefined}
          className={`rounded-xl border-2 border-dashed p-12 text-center transition-colors ${
            !fileType
              ? 'border-zinc-200 bg-zinc-50 opacity-50 dark:border-zinc-700 dark:bg-zinc-800'
              : dragActive
              ? 'border-blue-500 bg-blue-100 dark:border-blue-400 dark:bg-blue-50'
              : 'border-zinc-300 bg-white dark:border-blue-300 dark:bg-white'
          }`}
        >
          {file ? (
            <div>
              <p className="font-medium text-zinc-900 dark:text-blue-900">{file.name}</p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-blue-600">
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
              <p className="text-zinc-600 dark:text-blue-600">
                {!fileType ? (
                  'Please select a file type first'
                ) : (
                  <>
                    Drag and drop your file here, or{' '}
                    <label className="cursor-pointer font-medium text-zinc-900 underline dark:text-blue-900">
                      browse
                      <input
                        type="file"
                        className="hidden"
                        accept={getAcceptTypesSafe(fileType)}
                        onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                      />
                    </label>
                  </>
                )}
              </p>
              <p className="mt-2 text-xs text-zinc-400 dark:text-blue-500">
                {fileType === 'image' && (
                  user?.subscriptionTier === 'FREE' 
                    ? 'Supports JPEG, PNG, WebP, GIF (max 25MB)' 
                    : 'Supports JPEG, PNG, WebP, GIF (max 100MB)'
                )}
                {fileType === 'video' && (
                  user?.subscriptionTier === 'FREE' 
                    ? 'Supports MP4, AVI, MOV, MKV (max 100MB)' 
                    : 'Supports MP4, AVI, MOV, MKV (max 500MB)'
                )}
                {fileType === 'audio' && (
                  user?.subscriptionTier === 'FREE' 
                    ? 'Supports MP3, WAV, OGG, M4A, FLAC, AAC (max 50MB)' 
                    : 'Supports MP3, WAV, OGG, M4A, FLAC, AAC (max 200MB)'
                )}
                {fileType === 'pdf' && (
                  user?.subscriptionTier === 'FREE' 
                    ? 'Supports PDF files (max 25MB)' 
                    : 'Supports PDF files (max 100MB)'
                )}
              </p>
            </div>
          )}
        </div>


        <button
          type="submit"
          disabled={!file || uploading || !fileType}
          className="mt-6 w-full rounded-md bg-blue-900 py-3 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50 dark:bg-blue-900 dark:text-white dark:hover:bg-blue-800"
        >
          {uploading ? 'Uploading & Processing...' : 'Upload & Process'}
        </button>
      </form>
    </div>
  );
}
