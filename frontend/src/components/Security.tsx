"use client";
import { useInView } from '../hooks/useInView';
import { AlertCircle, Eye, Layers, Lock, Shield, Star } from 'lucide-react';

export default function Security() {
  const { ref, inView } = useInView();

  const features = [
    { icon: Shield, title: 'KYC Verification', description: 'All users complete identity verification before participating. Prevents fraud and malicious activity.' },
    { icon: Lock, title: 'Multi-Layer Auth', description: 'Advanced authentication protocols protect every account with multiple security layers.' },
    { icon: Eye, title: 'Audit Logs', description: 'Every action is recorded with comprehensive audit trails. Full transparency for every transaction.' },
    { icon: AlertCircle, title: 'Dispute Management', description: 'Structured dispute resolution with neutral arbitration. Fair outcomes for both parties.' },
    { icon: Star, title: 'Reputation System', description: 'Performance history builds verifiable contributor and owner profiles on the platform.' },
    { icon: Layers, title: 'Escrow Protection', description: 'Funds held in verifiable Stellar smart contracts. Neither party can access until conditions are met.' },
  ];

  return (
    <section id="security" className="py-24 px-6 bg-white border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        <div ref={ref} className={`transition-all duration-500 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            <div className="lg:w-2/5 lg:sticky lg:top-24">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Security</p>
              <h2 className="text-4xl md:text-5xl font-black leading-tight mb-6 text-black">
                Built for serious people.
              </h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                Security is not an afterthought at DealVault. Every layer is designed to protect contributors, project owners, and the integrity of every transaction.
              </p>
              <blockquote className="border-l-4 border-black pl-5 py-1">
                <p className="text-gray-700 italic text-sm leading-relaxed">
                  "Trust should not be a requirement for collaboration. Verification should."
                </p>
              </blockquote>
            </div>

            <div className="lg:w-3/5 grid sm:grid-cols-2 gap-4">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title}
                    className={`rounded-2xl p-6 transition-all duration-300 group bg-gray-50/80 border border-gray-200 hover:-translate-y-1.5 hover:shadow-md ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                    style={{
                      transitionDelay: `${i * 80}ms`,
                      boxShadow: '4px 4px 12px rgba(0, 0, 0, 0.03), inset 2px 2px 6px rgba(255, 255, 255, 1), inset -2px -2px 6px rgba(0, 0, 0, 0.02)'
                    }}>
                    <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-black transition-colors">
                      <Icon className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 text-sm">{feature.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
