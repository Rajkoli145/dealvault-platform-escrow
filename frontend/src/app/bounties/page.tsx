'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { Search, ChevronDown, SlidersHorizontal,
  GitBranch, Clock, LogOut, LayoutDashboard, Inbox,
  Wallet, User, HelpCircle, Newspaper, ExternalLink, DollarSign, Send
} from 'lucide-react';
import Image from 'next/image';
import { SkeletonIssues } from '../../components/SkeletonLoader';
import { applyToDemoBounty, demoBounties, readDemoApplications } from '../../lib/demoFlow';

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
  const [profileOpen, setProfileOpen] = useState(false);
  const [appliedIds, setAppliedIds] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setAppliedIds(readDemoApplications().map((application) => application.id));
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <header className="border-b border-gray-100 px-8 h-16 grid grid-cols-3 items-center sticky top-0 bg-white/90 backdrop-blur-sm z-30">
          <div className="flex items-center gap-2 cursor-pointer -ml-2">
            <Image src="/images/DbLogo.png" alt="DealVault" width={160} height={64} className="h-16 w-auto object-contain object-left scale-[1.3] origin-left" />
          </div>
        </header>
        <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
          <SkeletonIssues />
        </main>
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

  const handleApply = (bounty: (typeof demoBounties)[number]) => {
    router.push(`/bounties/${bounty.id}`);
  };

  const avatarSrc = user.githubAvatar || user.avatar;
  const initial = user.name?.[0]?.toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ─── Top Nav ──────────────────────────────────────────── */}
      <header className="border-b border-gray-100 px-8 h-16 grid grid-cols-3 items-center sticky top-0 bg-white/90 backdrop-blur-sm z-30">
        <div className="flex items-center gap-2 cursor-pointer -ml-2" onClick={() => router.push('/')}>
          <Image src="/images/DbLogo.png" alt="DealVault" width={160} height={64} className="h-16 w-auto object-contain object-left scale-[1.3] origin-left hover:opacity-80 transition-opacity" />
        </div>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center justify-center gap-1">
          {[
            { label: 'Financial', icon: Wallet, href: '/financial' },
            { label: 'Explore Issues', icon: GitBranch, href: '/bounties', active: true },
            { label: 'My Applications', icon: Inbox, href: '/bounties/my' },
          ].map(({ label, icon: Icon, href, active }) => (
            <button
              key={label}
              onClick={() => router.push(href)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
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

        {/* User with Dropdown */}
        <div className="flex items-center justify-end gap-3">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              {avatarSrc ? (
                <Image
                  src={avatarSrc}
                  alt={user.name}
                  width={32}
                  height={32}
                  className="rounded-full ring-2 ring-gray-200 hover:ring-gray-300 transition-all"
                  unoptimized
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-xs text-white font-bold">
                  {initial}
                </div>
              )}
              <span className="hidden lg:block">{user.name.split(' ')[0]}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-fade-in">
                {/* Profile Section */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    {avatarSrc ? (
                      <Image
                        src={avatarSrc}
                        alt={user.name}
                        width={48}
                        height={48}
                        className="rounded-full ring-2 ring-gray-200"
                        unoptimized
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-sm text-white font-bold">
                        {initial}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">@{user.githubUsername || user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { router.push('/profile'); setProfileOpen(false); }}
                    className="mt-3 w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 py-2 rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4" />
                    View Profile
                  </button>
                </div>

                {/* Account Links */}
                <div className="p-2 border-b border-gray-100">
                  <button
                    onClick={() => { router.push('/financial'); setProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Wallet className="w-4 h-4 text-gray-500" />
                    <span>Financial</span>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400 ml-auto" />
                  </button>
                  <button
                    onClick={() => { router.push('/maintainer-apply'); setProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-gray-500" />
                    <span>Maintainer App</span>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400 ml-auto" />
                  </button>
                </div>

                {/* Resources Section */}
                <div className="p-2 border-b border-gray-100">
                  <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Resources</p>
                  <button
                    onClick={() => { setProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 text-gray-500" />
                    <span>FAQ</span>
                  </button>
                  <button
                    onClick={() => { setProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Newspaper className="w-4 h-4 text-gray-500" />
                    <span>News</span>
                  </button>
                </div>

                {/* Account Section */}
                <div className="p-2">
                  <button
                    onClick={() => { logout(); router.push('/'); setProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
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
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-0.5">Funded Issues</p>
            <p className="text-5xl font-bold text-gray-900 tracking-tight">{demoBounties.length}</p>
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

        {/* ─── Funded Issues ──────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4">
          {demoBounties.map((bounty) => {
            const applied = appliedIds.includes(bounty.id);

            return (
              <div key={bounty.id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                        <DollarSign className="h-3.5 w-3.5" />
                        ${bounty.reward.toFixed(2)}
                      </span>
                      <span className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600">{bounty.label}</span>
                      <span className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600">{bounty.stack}</span>
                    </div>
                    <h2 className="truncate text-lg font-bold text-gray-900">{bounty.title}</h2>
                    <p className="mt-1 text-sm text-gray-500">{bounty.repo}</p>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">{bounty.description}</p>
                    <div className="mt-4 flex items-center gap-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                      <span>{bounty.applicants + (applied ? 1 : 0)} applicants</span>
                      <span>{bounty.posted}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => applied ? router.push('/bounties/my') : handleApply(bounty)}
                    className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${
                      applied
                        ? 'border border-gray-300 bg-white text-gray-800 hover:bg-gray-100'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {applied ? (
                      <>
                        <Inbox className="h-4 w-4" />
                        View application
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Apply
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
