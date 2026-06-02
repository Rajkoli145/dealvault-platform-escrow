import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="w-full bg-[#0d0d0d]/80 backdrop-blur-md border-b border-[#262626] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-400 flex items-center justify-center text-surface-900">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          </div>
          DealVault
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <Link to="/deals" className="hover:text-white transition-colors">Escrow</Link>
          <a href="#explore" className="hover:text-white transition-colors">Explore</a>
          <a href="#marketplace" className="hover:text-white transition-colors">Marketplace</a>
          <a href="#about" className="hover:text-white transition-colors">About us</a>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="btn btn-primary px-6 py-2">
            Go to app
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
