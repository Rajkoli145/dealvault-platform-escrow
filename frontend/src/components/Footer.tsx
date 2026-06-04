"use client";
import Image from 'next/image';

export default function Footer() {
  const links = {
    Platform: ['How it works', 'Browse bounties', 'Post a bounty', 'Escrow system'],
    Security: ['KYC verification', 'Dispute resolution', 'Audit logs', 'Privacy policy'],
    Company: ['About', 'Blog', 'Careers', 'Contact'],
    Developers: ['Documentation', 'API reference', 'Stellar integration', 'Status'],
  };

  return (
    <footer className="border-t border-gray-100 py-16 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center mb-4">
              <Image src="/images/DbLogo.png" alt="DealVault" width={140} height={56} className="h-14 w-auto object-contain object-left" />
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Secure contribution and bounty platform built on Stellar. Every opportunity fully funded.
            </p>
          </div>

          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">{section}</h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-gray-400 hover:text-gray-900 transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">© 2026 DealVault. All rights reserved.</p>
          <p className="text-xs text-gray-400 flex items-center gap-1.5">
            Powered by <span className="text-black font-semibold">Stellar Network</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
