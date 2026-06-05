'use client';

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Search, ChevronDown, SlidersHorizontal,
  GitBranch, Clock, LogOut, LayoutDashboard, Inbox
} from 'lucide-react';
import Image from 'next/image';

const LABEL_OPTIONS = ['All Labels', 'bug', 'enhancement', 'documentation', 'good first issue', 'help wanted'];
const STACK_OPTIONS = ['All Tech Stack', 'TypeScript', 'Rust', 'Python', 'Solidity', 'Go'];
const SORT_OPTIONS = ['Most Recent', 'Oldest', 'Most Applicants'];

export default function BountiesPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [labelFilter, setLabelFilter] = useState('All Labels');
  const [stackFilter, setStackFilter] = useState('All Tech Stack');
  const [sortFilter, setSortFilter] = useState('Most Recent');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-gray-100 border-t-black animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.replace('/');
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const avatarSrc = user.githubAvatar || user.avatar;
  const initial = user.name?.[0]?.toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ─── Top Nav ──────────────────────────────────────────── */}
      <header className="border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-sm z-30">
        <div className="flex items-center gap-3">
          <Image src="/favicon.png" alt="DealVault" width={32} height={32} className="rounded-lg" />
          <span className="font-bold text-gray-900 text-lg tracking-tight">DealVault</span>
        </div>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { label: 'Profile', icon: LayoutDashboard, href: '/dashboard' },
            { label: 'Explore Issues', icon: GitBranch, href: '/bounties', active: true },
            { label: 'My Applications', icon: Inbox, href: '/bounties/my' },
          ].map(({ label, icon: Icon, href, active }) => (
            <button
              key={label}
              onClick={() => router.push(href)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-gray-900">{user.name}</p>
            {user.githubUsername && (
              <p className="text-xs text-gray-400">@{user.githubUsername}</p>
            )}
          </div>
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-gray-200 shrink-0">
            {avatarSrc ? (
              <Image src={avatarSrc} alt={user.name} width={36} height={36} className="object-cover" unoptimized />
            ) : (
              <div className="w-full h-full bg-black flex items-center justify-center text-white text-sm font-medium">{initial}</div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ─── Page Body ────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-2">Find projects</h1>
            <p className="text-gray-500 text-sm max-w-md leading-relaxed">
              Find your next contribution. All issues are unassigned and ready for you to tackle.
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-0.5">Total Issues</p>
            <p className="text-5xl font-bold text-gray-900 tracking-tight">0</p>
          </div>
        </div>

        {/* ─── Filter Bar ─────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3 mb-10">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-colors"
            />
          </div>

          {/* Dropdowns */}
          {[
            { value: labelFilter, options: LABEL_OPTIONS, setValue: setLabelFilter },
            { value: stackFilter, options: STACK_OPTIONS, setValue: setStackFilter },
            { value: sortFilter,  options: SORT_OPTIONS,  setValue: setSortFilter },
          ].map(({ value, options, setValue }) => (
            <div key={value} className="relative">
              <select
                value={value}
                onChange={e => setValue(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-colors cursor-pointer"
              >
                {options.map(opt => <option key={opt}>{opt}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          ))}

          {/* Filter Icon Button */}
          <button className="px-3 py-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* ─── Empty State ────────────────────────────────────── */}
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <div className="w-16 h-16 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center mb-5">
            <GitBranch className="w-8 h-8 text-gray-300" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No issues found</h2>
          <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
            There are no open bounties at the moment. Check back soon — funded issues will appear here.
          </p>
        </div>
      </main>
    </div>
  );
}
