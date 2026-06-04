"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Github, Menu, X } from 'lucide-react';
import { WalletConnectButton } from './WalletConnectButton';

interface NavBarProps {
  connectedAddress: string | null;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export default function NavBar({ connectedAddress, isConnecting, onConnect, onDisconnect }: NavBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${scrolled ? 'bg-white/90 backdrop-blur-md border-b border-gray-200' : 'bg-white border-b border-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-8 h-16 grid grid-cols-3 items-center">
        {/* LEFT — Logo, bigger and pushed to the left */}
        <div className="flex items-center -ml-2">
          <Image src="/images/DbLogo.png" alt="DealVault" width={160} height={64} className="h-16 w-auto object-contain object-left scale-[1.3] origin-left" />
        </div>
        {/* CENTER — Nav links, truly centered, no wrapping */}
        <div className="hidden md:flex items-center justify-center gap-0.5">
          {['Platform', 'Security', 'How It Works', 'Why Stellar'].map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors font-medium whitespace-nowrap">
              {item}
            </a>
          ))}
        </div>
        {/* RIGHT — Buttons */}
        <div className="flex items-center justify-end gap-3">
          <a href="https://github.com" className="hidden md:flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium whitespace-nowrap">
            <Github className="w-4 h-4" />
            GitHub
          </a>
          <WalletConnectButton
            connectedAddress={connectedAddress}
            isConnecting={isConnecting}
            onConnect={onConnect}
            onDisconnect={onDisconnect}
          />
          <button className="md:hidden text-gray-600 hover:text-gray-900" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

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
            <a href="https://github.com" className="text-center text-sm border border-gray-200 rounded-lg py-2 text-gray-700 font-medium">GitHub</a>
            <div className="flex justify-center">
              <WalletConnectButton
                connectedAddress={connectedAddress}
                isConnecting={isConnecting}
                onConnect={onConnect}
                onDisconnect={onDisconnect}
              />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
