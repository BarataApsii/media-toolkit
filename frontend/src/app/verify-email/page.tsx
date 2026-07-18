'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { getAuthErrorMessage } from '@/lib/error-messages';

export default function VerifyEmailPage() {
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      if (!token) {
        toast.error('Invalid verification link. Please request a new verification email from the login page.');
        router.push('/login');
        return;
      }

      try {
        await api.get(`/auth/verify-email?token=${token}`);
        setVerified(true);
        toast.success('Email verified successfully!');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } catch (err: unknown) {
        const error = getAuthErrorMessage(err);
        toast.error(`${error.message}. ${error.suggestion}`);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="flex flex-1 items-center justify-center bg-white px-4 py-12 dark:bg-[#0a192f]">
      <div className="w-full max-w-md text-center">
        {loading ? (
          <div>
            <div className="mb-4 flex justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-900 border-t-transparent"></div>
            </div>
            <p className="text-lg text-blue-900 dark:text-white">Verifying your email...</p>
          </div>
        ) : verified ? (
          <div>
            <div className="mb-4 flex justify-center">
              <svg className="h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-blue-900 dark:text-white">Email Verified!</h2>
            <p className="text-blue-600 dark:text-blue-400">Redirecting to login...</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
