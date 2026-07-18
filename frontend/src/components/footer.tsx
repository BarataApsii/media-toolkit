import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 py-8 text-sm text-zinc-500 dark:border-zinc-800">
      <div className="mx-auto flex max-w-7xl items-center justify-center px-4 sm:px-6">
        <Link
          href="https://nextdev-png.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          &copy; {new Date().getFullYear()} NextDev-png. All rights reserved.
        </Link>
      </div>
    </footer>
  );
}
