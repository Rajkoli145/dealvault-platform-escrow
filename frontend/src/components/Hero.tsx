"use client";
import { useState } from 'react';
import { ArrowRight, CheckCircle, Copy, Github, Shield, Zap, Globe, Lock } from 'lucide-react';

export default function Hero() {
  const [copied, setCopied] = useState(false);
  const cmd = 'stellar contract deploy --wasm escrow.wasm';

  const handleCopy = () => {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="pt-32 pb-24 px-6 flex flex-col items-center text-center bg-white">
      {/* Announcement badge */}
      <div className="flex items-center gap-2 border border-gray-200 rounded-full px-3 py-1 mb-10 text-sm shadow-sm">
        <span className="bg-black text-white text-xs font-bold px-2 py-0.5 rounded-full">NEW</span>
        <span className="text-gray-600">Soroban Smart Contracts live on Stellar Testnet.</span>
        <a href="#platform" className="text-black font-semibold hover:underline flex items-center gap-0.5">
          Learn more <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Giant headline */}
      <h1 className="text-[clamp(3.5rem,12vw,8rem)] font-black leading-[0.95] tracking-tight text-black mb-6 max-w-4xl text-balance">
        DealVault
      </h1>

      <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
        The Open Escrow Standard for Stellar. Fund bounties in USDC, contributors get paid automatically by Soroban smart contracts.
      </p>

      {/* Command snippet */}
      <div className="flex items-center gap-3 bg-gray-950 text-green-400 font-mono text-sm px-5 py-3 rounded-xl mb-5 max-w-full shadow-lg">
        <span className="text-gray-500 select-none">$</span>
        <span className="text-gray-100 tracking-wide">{cmd}</span>
        <button onClick={handleCopy} className="ml-2 text-gray-500 hover:text-white transition-colors flex-shrink-0">
          {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* GitHub star link */}
      <a href="https://github.com" className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors font-medium group">
        <Github className="w-4 h-4" />
        Star us on GitHub
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </a>

      {/* Trust badges */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400 mt-12 pt-10 border-t border-gray-100 w-full max-w-2xl">
        {[
          { label: 'KYC Verified', icon: Shield },
          { label: 'Instant settlement', icon: Zap },
          { label: '180+ countries', icon: Globe },
          { label: '100% on-chain', icon: Lock },
        ].map(({ label, icon: Icon }) => (
          <div key={label} className="flex items-center gap-1.5">
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
