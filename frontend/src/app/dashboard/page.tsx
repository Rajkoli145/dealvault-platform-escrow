'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Linkedin, Twitter, Globe, Github, LogOut,
  Check, Loader2, User as UserIcon
} from 'lucide-react';
import Image from 'next/image';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export default function DashboardPage() {
  const { user, token, isLoading, logout, loginWithToken } = useAuth();
  const router = useRouter();

  const [linkedinUrl,  setLinkedinUrl]  = useState('');
  const [twitterUrl,   setTwitterUrl]   = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [bio,          setBio]          = useState('');
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState('');

  // Redirect logic
  useEffect(() => {
    if (!isLoading && !user) router.replace('/');
    else if (!isLoading && user && user.role === 'buyer') router.replace('/onboarding');
    else if (!isLoading && user && user.role === 'maintainer') router.replace('/maintainer-apply');
  }, [user, isLoading, router]);

  // Pre-fill fields from user object
  useEffect(() => {
    if (user) {
      setLinkedinUrl( user.linkedinUrl  || '');
      setTwitterUrl(  user.twitterUrl   || '');
      setPortfolioUrl(user.portfolioUrl || '');
      setBio(         user.bio           || '');
    }
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-gray-100 border-t-black animate-spin" />
      </div>
    );
  }

  const avatarSrc = user.githubAvatar || user.avatar;
  const initial   = user.name?.[0]?.toUpperCase() || 'U';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${API}/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ linkedinUrl, twitterUrl, portfolioUrl, bio }),
      });
      if (!res.ok) throw new Error('Failed to save profile');
      loginWithToken(token);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    logout();
    router.replace('/');
  };

  const handleRoleSwitch = async (newRole: 'maintainer' | 'contributor') => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/auth/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        loginWithToken(token);
        // Maintainer → go to the maintainer application flow
        // Contributor → go to the bounties explorer
        if (newRole === 'maintainer') {
          router.replace('/maintainer-apply');
        } else {
          router.replace('/bounties');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Nav ─────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-30 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Image src="/favicon.png" alt="DealVault" width={30} height={30} className="rounded-lg" />
          <span className="font-bold text-gray-900 tracking-tight">DealVault</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </header>

      {/* ── Body ─────────────────────────────────────────────────── */}
      <main className="max-w-2xl mx-auto px-4 py-12">

        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-8">
          {/* Banner */}
          <div className="h-28 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 relative">
            <div className="absolute inset-0 opacity-30"
              style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
            />
          </div>

          {/* Avatar row */}
          <div className="px-8 pb-6">
            <div className="flex items-end gap-5 -mt-12 mb-5">
              <div className="relative shrink-0">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-gray-100">
                  {avatarSrc ? (
                    <Image src={avatarSrc} alt={user.name} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="w-full h-full bg-black flex items-center justify-center text-white text-3xl font-bold">
                      {initial}
                    </div>
                  )}
                </div>
              </div>
              <div className="pb-1">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{user.name}</h1>
                {user.githubUsername && (
                  <a
                    href={`https://github.com/${user.githubUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm transition-colors mt-0.5"
                  >
                    <Github className="w-3.5 h-3.5" />
                    @{user.githubUsername}
                  </a>
                )}
              </div>
            </div>

            {/* Role badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-white text-xs font-semibold capitalize">
                <UserIcon className="w-3 h-3" />
                {user.role}
              </span>
              {user.role === 'contributor' && (
                <button
                  onClick={() => handleRoleSwitch('maintainer')}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-medium transition-colors"
                >
                  Switch to Maintainer
                </button>
              )}
              {user.role === 'maintainer' && (
                <>
                  <button
                    onClick={() => handleRoleSwitch('contributor')}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-medium transition-colors"
                  >
                    Switch to Contributor
                  </button>
                  <button
                    onClick={() => router.push('/bounties')}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-medium transition-colors"
                  >
                    Explore Bounties
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
