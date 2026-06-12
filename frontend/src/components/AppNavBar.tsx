'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ChevronDown, Briefcase, GitBranch, LogOut, User, Wallet, Lock, HelpCircle, Clock, Newspaper, ExternalLink, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';

interface AppNavBarProps {
  showNavItems?: boolean;
}

export default function AppNavBar({ showNavItems = true }: AppNavBarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
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

  const avatarSrc = user?.githubAvatar || user?.avatar;
  const navItems = [
    { id: 'financial', label: 'Financial', icon: Wallet, href: '/financial' },
    { id: 'explore', label: 'Explore Issues', icon: GitBranch, href: '/bounties' },
    { id: 'applications', label: 'My Applications', icon: Briefcase, href: '/bounties/my' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-8 h-16 flex items-center">
        {/* LEFT — Logo */}
        <div className="flex-1 flex items-center">
          <div className="flex items-center gap-2 -ml-2 cursor-pointer" onClick={() => router.push('/')}>
            <Image src="/images/DbLogo.png" alt="DealVault" width={160} height={64} className="h-16 w-auto object-contain object-left scale-[1.3] origin-left hover:opacity-80 transition-opacity" />
          </div>
        </div>

        {/* CENTER — Nav items (fixed width per item to prevent layout shift) */}
        <div className="flex items-center gap-4">
          {showNavItems &&
            navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => router.push(item.href)}
                className={`flex items-center justify-center gap-2 w-36 py-1.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
                  pathname === item.href || (item.href !== '/bounties' && pathname.startsWith(item.href))
                    ? 'bg-black text-white'
                    : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </button>
            ))}
        </div>

        {/* RIGHT — Profile dropdown */}
        <div className="flex-1 flex items-center justify-end" ref={dropdownRef}>
          <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            {avatarSrc ? (
              <Image
                src={avatarSrc}
                alt={user?.name || 'User'}
                width={32}
                height={32}
                className="rounded-full ring-2 ring-gray-200 hover:ring-gray-300 transition-all"
                unoptimized
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-xs text-white font-bold">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <span className="hidden lg:block">{user?.name?.split(' ')[0] || 'User'}</span>
            <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
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
                      alt={user?.name || 'User'}
                      width={48}
                      height={48}
                      className="rounded-full ring-2 ring-gray-200"
                      unoptimized
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-sm text-white font-bold">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">@{user?.githubUsername || user?.email}</p>
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

              {/* Maintainer App */}
              <div className="p-2 border-b border-gray-100">
                <button
                  onClick={() => { router.push('/maintainer-apply'); setProfileOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Lock className="w-4 h-4 text-gray-500" />
                  <span>Maintainer App</span>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400 ml-auto" />
                </button>
                <button
                  onClick={() => { router.push('/bounties'); setProfileOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <GitBranch className="w-4 h-4 text-gray-500" />
                  <span>Contributor App</span>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400 ml-auto" />
                </button>
              </div>

              {/* Resources Section */}
              <div className="p-2 border-b border-gray-100">
                <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Resources</p>
                <button
                  onClick={() => { router.push('/docs'); setProfileOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-gray-500" />
                  <span>Documentation</span>
                </button>
                <button
                  onClick={() => { setProfileOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <HelpCircle className="w-4 h-4 text-gray-500" />
                  <span>FAQ</span>
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
      </div>
    </nav>
  );
}
