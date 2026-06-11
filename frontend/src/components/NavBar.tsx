"use client";
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Github, BookOpen, Menu, X, LogOut, Lock, ChevronDown, User, HelpCircle, Clock, Newspaper, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { WalletConnectButton } from './WalletConnectButton';

const GITHUB_AUTH_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/auth/github`
  : 'http://localhost:5001/api/auth/github';

interface NavBarProps {
  connectedAddress: string | null;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export default function NavBar({ connectedAddress, isConnecting, onConnect, onDisconnect }: NavBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGetStarted = () => {
    // Full page redirect → backend kicks off GitHub OAuth flow
    window.location.href = GITHUB_AUTH_URL;
  };

  const avatarSrc = user?.githubAvatar || user?.avatar;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${scrolled ? 'bg-white/90 backdrop-blur-md border-b border-gray-200' : 'bg-white border-b border-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-8 h-16 grid grid-cols-3 items-center">
        {/* LEFT — Logo */}
        <div className="flex items-center -ml-2">
          <Image src="/images/DbLogo.png" alt="DealVault" width={160} height={64} className="h-16 w-auto object-contain object-left scale-[1.3] origin-left" />
        </div>

        {/* CENTER — Nav links */}
        <div className="hidden md:flex items-center justify-center gap-0.5">
          {['Platform', 'Security', 'Docs', 'Why Stellar'].map((item) => (
            <a key={item} href={item === 'Docs' ? '/docs' : `#${item.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors font-medium whitespace-nowrap">
              {item}
            </a>
          ))}
        </div>

        {/* RIGHT — Auth buttons */}
        <div className="flex items-center justify-end gap-3">
          <WalletConnectButton
            connectedAddress={connectedAddress}
            isConnecting={isConnecting}
            onConnect={onConnect}
            onDisconnect={onDisconnect}
          />
          {!isLoading && user ? (
            /* ── Logged-in state ── */
            <>
              {/* Explore Issues Button */}
              <button
                onClick={() => router.push('/bounties')}
                className="relative overflow-hidden bg-black hover:bg-gray-800 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-2"
              >
                {/* Shimmer effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer" />
                <span className="relative z-10">Explore Issues</span>
              </button>

              {/* Profile Dropdown */}
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
                      {user.name[0]?.toUpperCase()}
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
                            {user.name[0]?.toUpperCase()}
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
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>Coming Soon</span>
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
            </>
          ) : (
            /* ── Logged-out state ── */
            <>
              <button
                id="get-started-btn"
                onClick={handleGetStarted}
                className="relative overflow-hidden group bg-black hover:bg-gray-800 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors whitespace-nowrap"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Github className="w-3.5 h-3.5" />
                  Get started
                </span>
                <div className="absolute inset-0 w-1/2 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer" />
              </button>
            </>
          )}
          <button className="md:hidden text-gray-600 hover:text-gray-900" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-6 pb-6">
          {['Platform', 'Security', 'Docs', 'Why Stellar'].map((item) => (
            <a key={item} href={item === 'Docs' ? '/docs' : `#${item.toLowerCase().replace(/\s+/g, '-')}`}
              className="block py-3 text-gray-600 hover:text-gray-900 border-b border-gray-100 text-sm font-medium"
              onClick={() => setMobileOpen(false)}>
              {item}
            </a>
          ))}
          <div className="flex gap-3 mt-4 flex-col">
            <div className="flex justify-center">
              <WalletConnectButton
                connectedAddress={connectedAddress}
                isConnecting={isConnecting}
                onConnect={onConnect}
                onDisconnect={onDisconnect}
              />
            </div>
            <div className="flex gap-3">
              {user ? (
                <>
                  <a href="/dashboard" className="flex-1 text-sm bg-black text-white rounded-lg py-2 font-medium text-center">Profile</a>
                  <button onClick={logout} className="flex-1 text-sm border border-gray-200 rounded-lg py-2 text-gray-700 font-medium">Sign out</button>
                </>
              ) : (
                <>
                  <button onClick={handleGetStarted} className="flex-1 text-sm bg-black text-white rounded-lg py-2 font-medium">Get started</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
