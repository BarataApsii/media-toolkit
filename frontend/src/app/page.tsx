import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero */}
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <span className="text-xl font-bold text-zinc-900 dark:text-white">Media Toolkit</span>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400">
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-6xl">
            Compress. Convert. Optimize.
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            A powerful media processing toolkit for freelancers, drone operators, and agencies.
            Upload your images and videos — we handle compression, conversion, and optimization in the background.
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
        <div className="mx-auto mt-24 grid max-w-5xl gap-8 px-4 sm:grid-cols-3">
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
            <div className="mb-3 text-2xl">⚡</div>
            <h3 className="font-semibold text-zinc-900 dark:text-white">Background Processing</h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              All processing happens in the background via job queues. Track progress in real-time.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-200 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800">
        Media Toolkit &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
