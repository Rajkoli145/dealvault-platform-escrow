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
    else if (!isLoading && user && user.role === 'contributor') router.replace('/bounties');
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-white text-xs font-semibold capitalize">
              <UserIcon className="w-3 h-3" />
              {user.role}
            </span>
          </div>
        </div>

        {/* Social Links Form */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-1 tracking-tight">Complete your profile</h2>
          <p className="text-gray-400 text-sm mb-8">Add your social profiles so maintainers and contributors can verify your identity.</p>

          <form onSubmit={handleSave} className="space-y-5">
            {/* GitHub (read-only) */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">GitHub</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Github className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="url"
                  value={user.githubUsername ? `https://github.com/${user.githubUsername}` : ''}
                  readOnly
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                  placeholder="https://github.com/username"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Auto-filled from your GitHub account</p>
            </div>

            {/* LinkedIn */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">LinkedIn</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Linkedin className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={e => setLinkedinUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-colors"
                  placeholder="https://linkedin.com/in/yourname"
                />
              </div>
            </div>

            {/* Twitter / X */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Twitter / X</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Twitter className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="url"
                  value={twitterUrl}
                  onChange={e => setTwitterUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-colors"
                  placeholder="https://x.com/yourhandle"
                />
              </div>
            </div>

            {/* Portfolio */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Portfolio / Website</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Globe className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={e => setPortfolioUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-colors"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Bio</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={3}
                maxLength={500}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-colors resize-none"
                placeholder="Tell maintainers a little about yourself..."
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{bio.length}/500</p>
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
            )}

            <button
              type="submit"
              disabled={saving}
              className={`relative overflow-hidden w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                saved
                  ? 'bg-emerald-500 text-white'
                  : 'bg-black text-white hover:bg-gray-900 shadow-md'
              }`}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saved ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  Profile saved!
                </>
              ) : (
                'Save Profile'
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
