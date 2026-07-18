'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function PricingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const handleUpgrade = () => {
    // For now, just show a toast. In production, this would integrate with a payment processor
    alert('Payment integration coming soon! Contact support to upgrade.');
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-zinc-900 dark:text-white">Choose Your Plan</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Select the perfect plan for your media processing needs
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Free Plan */}
        <div className="rounded-2xl border-2 border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-[#112240]">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Free</h2>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">Perfect for trying out the service</p>
            <div className="mt-4">
              <span className="text-4xl font-bold text-zinc-900 dark:text-white">$0</span>
              <span className="text-zinc-600 dark:text-zinc-400">/month</span>
            </div>
          </div>

          <ul className="mb-8 space-y-4">
            <li className="flex items-center text-zinc-700 dark:text-zinc-300">
              <svg className="mr-3 h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              25MB max for images/PDFs
            </li>
            <li className="flex items-center text-zinc-700 dark:text-zinc-300">
              <svg className="mr-3 h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              100MB max for videos
            </li>
            <li className="flex items-center text-zinc-700 dark:text-zinc-300">
              <svg className="mr-3 h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              50MB max for audio
            </li>
            <li className="flex items-center text-zinc-700 dark:text-zinc-300">
              <svg className="mr-3 h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Basic compression
            </li>
            <li className="flex items-center text-zinc-700 dark:text-zinc-300">
              <svg className="mr-3 h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Standard processing speed
            </li>
          </ul>

          <button
            disabled={user?.subscriptionTier === 'FREE'}
            className="w-full rounded-lg border-2 border-zinc-300 bg-white px-6 py-3 font-semibold text-zinc-900 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-[#0a192f] dark:text-white dark:hover:bg-zinc-800"
            onClick={() => router.push('/upload')}
          >
            {user?.subscriptionTier === 'FREE' ? 'Current Plan' : 'Downgrade to Free'}
          </button>
        </div>

        {/* Premium Plan */}
        <div className="relative rounded-2xl border-2 border-blue-500 bg-white p-8 shadow-lg dark:border-blue-400 dark:bg-[#112240]">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-4 py-1 text-sm font-semibold text-white dark:bg-blue-400">
            Most Popular
          </div>
          
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Premium</h2>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">For power users and professionals</p>
            <div className="mt-4">
              <span className="text-4xl font-bold text-zinc-900 dark:text-white">$9.99</span>
              <span className="text-zinc-600 dark:text-zinc-400">/month</span>
            </div>
          </div>

          <ul className="mb-8 space-y-4">
            <li className="flex items-center text-zinc-700 dark:text-zinc-300">
              <svg className="mr-3 h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              100MB max for images/PDFs
            </li>
            <li className="flex items-center text-zinc-700 dark:text-zinc-300">
              <svg className="mr-3 h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              500MB max for videos
            </li>
            <li className="flex items-center text-zinc-700 dark:text-zinc-300">
              <svg className="mr-3 h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              200MB max for audio
            </li>
            <li className="flex items-center text-zinc-700 dark:text-zinc-300">
              <svg className="mr-3 h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Advanced compression options
            </li>
            <li className="flex items-center text-zinc-700 dark:text-zinc-300">
              <svg className="mr-3 h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Priority processing speed
            </li>
            <li className="flex items-center text-zinc-700 dark:text-zinc-300">
              <svg className="mr-3 h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Priority support
            </li>
          </ul>

          <button
            disabled={user?.subscriptionTier === 'PREMIUM'}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-400"
            onClick={handleUpgrade}
          >
            {user?.subscriptionTier === 'PREMIUM' ? 'Current Plan' : 'Upgrade to Premium'}
          </button>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Need a custom enterprise solution?{' '}
          <a href="mailto:support@example.com" className="text-blue-600 hover:underline dark:text-blue-400">
            Contact us
          </a>
        </p>
      </div>
    </div>
  );
}
