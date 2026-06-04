"use client";
import { useInView } from '../hooks/useInView';
import { Briefcase, CheckCircle, Lock } from 'lucide-react';

export default function PlatformShowcase() {
  const { ref, inView } = useInView();

  const bounties = [
    { title: 'Implement OAuth2 login flow', tag: 'Backend', reward: '450 USDC', status: 'Funded', deadline: '7 days', applicants: 12 },
    { title: 'Redesign onboarding UI', tag: 'Design', reward: '800 USDC', status: 'Funded', deadline: '14 days', applicants: 8 },
    { title: 'Write API documentation', tag: 'Writing', reward: '250 USDC', status: 'Funded', deadline: '5 days', applicants: 6 },
    { title: 'Fix critical memory leak', tag: 'Bug Fix', reward: '300 USDC', status: 'Funded', deadline: '3 days', applicants: 9 },
  ];

  const tagColors: Record<string, string> = {
    Backend: 'bg-blue-50 text-blue-700 border-blue-200',
    Design: 'bg-amber-50 text-amber-700 border-amber-200',
    Writing: 'bg-teal-50 text-teal-700 border-teal-200',
    'Bug Fix': 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <section id="platform" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div ref={ref} className={`transition-all duration-600 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">The Platform</p>
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            <div className="lg:w-2/5">
              <h2 className="text-4xl md:text-5xl font-black leading-tight mb-6 text-black">
                Work with confidence.<br />
                <span className="text-gray-400">Every time.</span>
              </h2>
              <p className="text-gray-500 leading-relaxed mb-8">
                Before any task appears on DealVault, the full reward is deposited and verified on Stellar. Contributors can inspect escrow balances before committing a single hour.
              </p>
              <div className="space-y-4">
                {[
                  'Verified escrow balance before you apply',
                  'Automatic payment on deliverable approval',
                  'Dispute resolution with neutral arbitration',
                  'Full transaction history on-chain',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-black mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:w-3/5 w-full">
              <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="border-b border-gray-100 px-5 py-4 flex items-center justify-between bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-700">Open Bounties</span>
                    <span className="bg-black text-white text-xs px-2 py-0.5 rounded-full font-medium">4 live</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-gray-400">All funded</span>
                  </div>
                </div>

                <div className="p-2 bg-white">
                  {bounties.map((bounty, i) => (
                    <div key={bounty.title}
                      className={`p-4 rounded-xl hover:bg-gray-50 transition-all duration-300 cursor-pointer group ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
                      style={{ transitionDelay: `${200 + i * 80}ms` }}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${tagColors[bounty.tag]}`}>
                              {bounty.tag}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                              <Lock className="w-3 h-3" />
                              {bounty.status}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-black transition-colors">
                            {bounty.title}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                            <span>{bounty.deadline} left</span>
                            <span>·</span>
                            <span>{bounty.applicants} applicants</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-bold text-gray-900">{bounty.reward}</div>
                          <div className="text-xs text-gray-400 mt-0.5">in escrow</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 px-5 py-4 flex items-center justify-between bg-gray-50">
                  <span className="text-xs text-gray-400">Total secured in escrow</span>
                  <span className="text-sm font-bold text-black">1,800 USDC</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
