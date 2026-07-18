import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-6xl">
            Compres & Optimize
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            A powerful media processing toolkit for freelancers, drone operators, and agencies.
            Upload your images, videos, audio, and PDFs — we handle compression and optimization.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-md bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
            >
              Start Free
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Feature cards */}
        <div className="mx-auto mt-24 grid max-w-5xl gap-8 px-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
            <div className="mb-3 text-2xl">🖼️</div>
            <h3 className="font-semibold text-zinc-900 dark:text-white">Image Compression</h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Compress JPEG, PNG, WebP images with Smart quality preservation using Sharp.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
            <div className="mb-3 text-2xl">🎬</div>
            <h3 className="font-semibold text-zinc-900 dark:text-white">Video Compression</h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Reduce video file sizes with FFmpeg while maintaining visual quality.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
            <div className="mb-3 text-2xl">🎵</div>
            <h3 className="font-semibold text-zinc-900 dark:text-white">Audio Compression</h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Compress MP3, WAV, OGG, M4A, FLAC, AAC files with FFmpeg.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
            <div className="mb-3 flex items-center justify-center">
              <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="2" width="16" height="20" rx="2" fill="#EF4444" />
                <path d="M8 7h8M8 11h8M8 15h5" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="font-semibold text-zinc-900 dark:text-white">PDF Compression</h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Optimize PDF files by removing unused objects and compressing streams.
            </p>
          </div>
        </div>
      </main>
  );
}
