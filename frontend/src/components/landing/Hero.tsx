import React from 'react';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  return (
    <section className="relative w-full max-w-7xl mx-auto px-6 py-20 lg:py-32 flex flex-col lg:flex-row items-center justify-between gap-16">
      
      {/* Background Glow */}
      <div className="glow-bg top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:block"></div>

      {/* Left Column: Copy */}
      <div className="flex-1 z-10">
        <h1 className="text-5xl lg:text-7xl font-bold text-white leading-[1.1] mb-6">
          P2P Escrow<br />
          Crypto Exchange<br />
          Protection
        </h1>
        <p className="text-gray-400 text-lg mb-10 max-w-lg">
          Learn how DealVault can help with all your crypto payment needs. Secure your transactions with trustless smart contracts on Solana. Welcome to the new way to trade!
        </p>

        <div className="flex items-center gap-4 mb-16">
          <Link to="/dashboard" className="btn btn-primary px-8 py-3 text-base">
            Go to app
          </Link>
          <a href="#learn-more" className="btn btn-ghost px-8 py-3 text-base">
            Learn more
          </a>
        </div>

        {/* Live Transaction Widget */}
        <div className="glass rounded-2xl p-4 flex items-start gap-4 max-w-sm animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="w-12 h-12 rounded-full bg-[#1a1a1a] border border-[#262626] flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-400"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">Live Transaction <span className="inline-block w-2 h-2 rounded-full bg-brand-400 ml-1 animate-pulse"></span></span>
            </div>
            <p className="text-sm text-gray-300">
              <strong className="text-white">Tasan</strong> has just bought <span className="text-white">0.028 BTC</span> from <strong className="text-white">Elgun</strong>
            </p>
            <span className="text-xs text-gray-500 mt-1 block">12 seconds ago</span>
          </div>
        </div>
      </div>

      {/* Right Column: Visuals */}
      <div className="flex-1 relative z-10 w-full flex justify-center lg:justify-end animate-fade-in-up">
        
        {/* Abstract shape behind phone */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-96 bg-brand-400 rounded-[2rem] rotate-12 opacity-80 blur-sm"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-96 bg-yellow-300 rounded-[2rem] rotate-6 opacity-60 mix-blend-overlay"></div>

        {/* Main Phone Mockup */}
        <div className="relative w-80 h-[500px] glass-card rounded-[2.5rem] p-6 border-t border-l border-white/10 shadow-2xl flex flex-col z-20 bg-[#141414]">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1a1a1a] border border-[#262626]">
              <div className="w-2 h-2 rounded-full bg-brand-400"></div>
              <span className="text-xs font-medium text-white">Buy</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 rounded-full bg-gray-600"></div>
              <span className="text-xs font-medium text-gray-400">Sell</span>
            </div>
          </div>

          <p className="text-sm text-gray-400 mb-2">Invoice Amount</p>
          
          {/* Input Block */}
          <div className="w-full bg-[#1a1a1a] border border-[#262626] rounded-xl p-4 flex justify-between items-center mb-4">
            <span className="text-2xl font-semibold text-white">0.26</span>
            <div className="flex items-center gap-2 bg-[#262626] px-3 py-1 rounded-lg">
              <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">B</div>
              <span className="text-sm font-medium text-white">BTC</span>
            </div>
          </div>

          {/* Rate Block */}
          <p className="text-sm text-gray-400 mb-2">Rate</p>
          <div className="w-full bg-[#1a1a1a] border border-[#262626] rounded-xl p-4 flex justify-between items-center mb-8">
            <span className="text-lg font-semibold text-white">10000</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">USD</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
            </div>
          </div>

          <div className="mt-auto">
            <button className="w-full btn btn-primary py-4 rounded-xl text-lg">Continue</button>
          </div>
        </div>

        {/* Floating Steps Card */}
        <div className="absolute -bottom-8 -left-8 lg:-left-16 glass-card rounded-2xl p-5 shadow-2xl z-30 animate-float border border-white/5 bg-[#141414]/90 w-72">
          
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-gray-700"></div>
            
            {/* Step 1 */}
            <div className="flex gap-4 mb-5 relative z-10">
              <div className="w-6 h-6 rounded-full bg-[#1a1a1a] border border-[#262626] flex items-center justify-center shrink-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Payment</p>
                <p className="text-xs text-gray-400">Completed by <span className="text-white">Buyer</span></p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4 mb-5 relative z-10">
              <div className="w-6 h-6 rounded-full bg-[#1a1a1a] border border-[#262626] flex items-center justify-center shrink-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"></path></svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Submit Proof</p>
                <p className="text-xs text-gray-400">Completed by <span className="text-white">Seller</span></p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4 relative z-10">
              <div className="w-6 h-6 rounded-full bg-brand-400 border border-brand-300 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(74,222,128,0.5)]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-surface-900"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-brand-400">Verifying Proof</p>
                <p className="text-xs text-gray-400">Validated by <span className="text-white">DealVault</span></p>
              </div>
            </div>
          </div>
          
        </div>

      </div>
    </section>
  );
};

export default Hero;
