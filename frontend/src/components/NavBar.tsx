"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Github, Menu, X, LogOut, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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
  const { user, logout, isLoading } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
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
          {['Platform', 'Security', 'How It Works', 'Why Stellar'].map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
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
              <a
                href="/dashboard"
                className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors mr-2"
              >
                {avatarSrc ? (
                  <Image
                    src={avatarSrc}
                    alt={user.name}
                    width={28}
                    height={28}
                    className="rounded-full ring-1 ring-gray-200"
                    unoptimized
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-xs text-white font-bold">
                    {user.name[0]?.toUpperCase()}
                  </div>
                )}
                <span className="hidden lg:block">{user.name.split(' ')[0]}</span>
              </a>
              <a
                href="/dashboard"
                className="relative overflow-hidden group bg-black hover:bg-gray-800 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="relative z-10">Profile</span>
              </a>
            </>
          ) : (
            /* ── Logged-out state ── */
            <>
              <button
                onClick={handleGetStarted}
                className="hidden md:flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium whitespace-nowrap"
              >
                <Github className="w-4 h-4" />
                GitHub
              </button>
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
          {['Platform', 'Security', 'How It Works', 'Why Stellar'].map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
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
                  <button onClick={handleGetStarted} className="flex-1 text-sm border border-gray-200 rounded-lg py-2 text-gray-700 font-medium text-center">GitHub</button>
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
