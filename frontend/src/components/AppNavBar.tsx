'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ChevronDown, Briefcase, GitBranch, LogOut, User, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';

export default function AppNavBar() {
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-8 h-20 grid grid-cols-3 items-center">
        {/* LEFT — Logo */}
        <div className="flex items-center gap-2 -ml-2 cursor-pointer" onClick={() => router.push('/')}>
          <Image src="/images/DbLogo.png" alt="DealVault" width={240} height={96} className="h-20 w-auto object-contain object-left hover:opacity-80 transition-opacity" />
        </div>

        {/* CENTER — Nav items */}
        <div className="flex items-center justify-center gap-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => router.push(item.href)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                pathname === item.href
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        {/* RIGHT — Profile dropdown */}
        <div className="flex items-center justify-end" ref={dropdownRef}>
          <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-300 bg-white hover:border-gray-400 transition-colors"
          >
            {avatarSrc ? (
              <Image
                src={avatarSrc}
                alt={user?.name || 'User'}
                width={32}
                height={32}
                className="rounded-full"
                unoptimized
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-xs text-white font-bold">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <span className="text-sm font-medium text-gray-900">{user?.name?.split(' ')[0] || 'User'}</span>
            <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  {avatarSrc ? (
                    <Image
                      src={avatarSrc}
                      alt={user?.name || 'User'}
                      width={40}
                      height={40}
                      className="rounded-full"
                      unoptimized
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-sm text-white font-bold">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{user?.name}</p>
                    <p className="text-xs text-gray-500">@{user?.githubUsername}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    router.push('/profile');
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <User className="w-4 h-4" />
                  View Profile
                </button>
              </div>
              <button
                onClick={() => {
                  logout();
                  setProfileOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors border-t border-gray-100"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
          </div>
        </div>
      </div>
    </nav>
  );
}
