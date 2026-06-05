'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';

export default function AuthCallbackInner() {
  const { loginWithToken } = useAuth();
  const router             = useRouter();
  const searchParams       = useSearchParams();
  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      // No token — OAuth failed, go home
      router.replace('/?auth=error');
      return;
    }

    // Store token + fetch /api/auth/me, then navigate to dashboard
    loginWithToken(token);
    const timer = setTimeout(() => {
      router.replace('/dashboard');
    }, 800);

    return () => clearTimeout(timer);
  }, [loginWithToken, router, searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6">
      {/* Branded logo mark */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 animate-pulse" />
        <div className="absolute inset-1 rounded-xl bg-white flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-violet-600" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
      </div>

      {/* Spinner */}
      <div className="w-10 h-10 rounded-full border-2 border-gray-200 border-t-violet-600 animate-spin" />

      <div className="text-center">
        <p className="text-gray-900 font-semibold text-lg tracking-tight">Signing you in…</p>
        <p className="text-gray-500 text-sm mt-1">Fetching your GitHub profile</p>
      </div>
    </div>
  );
}
