"use client";
import { useInView } from '../hooks/useInView';
import { Globe, Shield, TrendingUp, Zap } from 'lucide-react';

export default function WhyStellar() {
  const { ref, inView } = useInView();

  const reasons = [
    { icon: Zap, title: 'Fast settlement', description: 'Transactions confirm in under 5 seconds. Approved work means immediate payment.' },
    { icon: Globe, title: 'Global accessibility', description: 'Contributors from 180+ countries can participate. Stellar removes geographic barriers.' },
    { icon: TrendingUp, title: 'Low transaction costs', description: 'Near-zero fees make micro-bounties practical. Small tasks remain economically viable.' },
    { icon: Shield, title: 'Stable asset support', description: 'Rewards denominated in USDC on Stellar. Contributors know exactly what they earn.' },
  ];

  return (
    <section id="why-stellar" className="py-24 px-6 bg-white border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        <div ref={ref} className={`transition-all duration-500 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Infrastructure</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-black">Why Stellar?</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              The world&apos;s most contributor-friendly payment network. Fast, cheap, and globally accessible.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reasons.map(({ icon: Icon, title, description }, i) => (
              <div key={title}
                className={`border border-gray-200 rounded-2xl p-7 hover:border-gray-400 hover:shadow-sm transition-all duration-300 group bg-white ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center mb-5 group-hover:bg-black transition-colors">
                  <Icon className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-gray-900 mb-3">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 border border-gray-200 rounded-2xl p-8 md:p-10 text-center bg-gray-50">
            <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-black mb-3 text-black">The future of work is verified.</h3>
            <p className="text-gray-500 max-w-lg mx-auto mb-1">
              Verified identities. Verified rewards. Verified contributions. Verified payments.
            </p>
            <p className="text-gray-400 text-sm">DealVault is building that future. Powered by Stellar.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
