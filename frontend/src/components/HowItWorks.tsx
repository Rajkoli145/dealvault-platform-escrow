"use client";
import { useState } from 'react';
import { useInView } from '../hooks/useInView';
import { Briefcase, FileText, Lock, Users, Zap } from 'lucide-react';

export default function HowItWorks() {
  const { ref, inView } = useInView(0.1);
  const [active, setActive] = useState(0);

  const steps = [
    {
      number: '01',
      title: 'Maintainer Creates a Bounty',
      tag: 'CREATED',
      tagColor: 'bg-gray-100 text-gray-600',
      icon: Briefcase,
      description: 'A project owner defines the task — title, requirements, deadline, and reward in USDC. Stored in MongoDB and visible to all contributors.',
      detail: 'The bounty exists but has no funding yet. It shows as CREATED status.',
      preview: [
        { label: 'Title', value: 'Fix authentication bug in API' },
        { label: 'Reward', value: '250 USDC' },
        { label: 'Deadline', value: '7 days' },
        { label: 'Status', value: 'CREATED', highlight: true },
      ],
    },
    {
      number: '02',
      title: 'USDC Locked in Smart Contract',
      tag: 'FUNDED ✓',
      tagColor: 'bg-green-50 text-green-700',
      icon: Lock,
      description: 'The maintainer connects their Freighter wallet and signs a transaction. 250 USDC moves from their wallet into the Soroban escrow contract. Locked on-chain.',
      detail: 'Funds are now verifiable on Stellar Explorer. No one can touch them — not the maintainer, not DealVault.',
      preview: [
        { label: 'Escrow Contract', value: 'C...x9Af' },
        { label: 'Amount Locked', value: '250 USDC' },
        { label: 'Tx Hash', value: '4f8e...cc12' },
        { label: 'Status', value: 'FUNDED ✓', highlight: true },
      ],
    },
    {
      number: '03',
      title: 'Contributor Applies & Starts',
      tag: 'IN PROGRESS',
      tagColor: 'bg-blue-50 text-blue-700',
      icon: Users,
      description: 'Contributors browse verified bounties. They can check the Stellar block explorer to confirm the 250 USDC is locked before spending a single hour.',
      detail: 'Once a contributor is selected and accepts, status moves to IN_PROGRESS. Work begins with full payment certainty.',
      preview: [
        { label: 'Contributor', value: '@sarah_kim' },
        { label: 'Applied', value: '8 others' },
        { label: 'Escrow verified', value: '✓ On Stellar' },
        { label: 'Status', value: 'IN PROGRESS', highlight: true },
      ],
    },
    {
      number: '04',
      title: 'Work Submitted for Review',
      tag: 'SUBMITTED',
      tagColor: 'bg-amber-50 text-amber-700',
      icon: FileText,
      description: 'The contributor uploads their deliverables — pull request, design files, report, or GitHub repo link. The maintainer is notified instantly.',
      detail: 'Maintainer has the option to approve, request revision, or open a dispute. No money moves until they act.',
      preview: [
        { label: 'Deliverable', value: 'github.com/pr/441' },
        { label: 'Submitted', value: '2h ago' },
        { label: 'Maintainer', value: 'Reviewing...' },
        { label: 'Status', value: 'SUBMITTED', highlight: true },
      ],
    },
    {
      number: '05',
      title: 'Auto-Payment Released',
      tag: 'RELEASED ✅',
      tagColor: 'bg-green-50 text-green-700',
      icon: Zap,
      description: 'Maintainer clicks Approve. The Soroban smart contract instantly splits: 245 USDC to the contributor, 5 USDC (2%) to DealVault. Settled in under 5 seconds.',
      detail: 'Zero manual steps. Zero wire transfers. Zero delays. The contract enforces the payout automatically.',
      preview: [
        { label: 'To Contributor', value: '245 USDC ✓' },
        { label: 'Platform fee', value: '5 USDC (2%)' },
        { label: 'Settlement', value: '< 5 seconds' },
        { label: 'Status', value: 'RELEASED ✅', highlight: true },
      ],
    },
  ];

  const step = steps[active];
  const Icon = step.icon;

  return (
    <section id="how-it-works" className="py-24 px-6 bg-gray-50 border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        <div ref={ref} className={`transition-all duration-500 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">The Process</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-black">From idea to payment.</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">Click each step to see exactly what happens — on-chain and off-chain.</p>
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Left — Step selector */}
            <div className="lg:col-span-2 flex flex-col gap-2">
              {steps.map((s, i) => {
                const SIcon = s.icon;
                const isActive = active === i;
                return (
                  <button
                    key={s.number}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => setActive(i)}
                    className={`
                      relative flex items-center gap-4 p-4 rounded-2xl border text-left w-full
                      transition-all duration-300 ease-out group
                      ${isActive
                        ? 'bg-white border-gray-400 shadow-sm'
                        : 'bg-gray-50 border-gray-200/60'
                      }
                      hover:!bg-black hover:!border-black hover:shadow-lg hover:-translate-y-0.5
                    `}
                  >
                    <div className={`
                      w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
                      transition-all duration-200 ease-out
                      ${isActive ? 'bg-gray-100' : 'bg-gray-100/50'}
                      group-hover:!bg-white/20
                    `}>
                      <SIcon className={`
                        w-4 h-4 transition-colors duration-200
                        ${isActive ? 'text-black' : 'text-gray-500'}
                        group-hover:!text-white
                      `} />
                    </div>
                    <div className="min-w-0">
                      <div className={`text-[10px] font-mono mb-0.5 transition-colors duration-200 ${isActive ? 'text-gray-500' : 'text-gray-400'} group-hover:!text-gray-300`}>
                        {s.number}
                      </div>
                      <div className={`text-sm font-semibold truncate transition-colors duration-200 ${isActive ? 'text-black' : 'text-gray-700'} group-hover:!text-white`}>
                        {s.title}
                      </div>
                    </div>
                    <span className={`
                      ml-auto text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap transition-colors duration-200
                      ${s.tagColor} group-hover:!bg-white/20 group-hover:!text-white
                    `}>
                      {s.tag}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right — Detail panel */}
            <div className="lg:col-span-3 border border-gray-200 rounded-2xl bg-white overflow-hidden shadow-sm">
              {/* Header */}
              <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-gray-900 text-sm">{step.title}</span>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${step.tagColor} border-current`}>{step.tag}</span>
              </div>

              {/* Description */}
              <div className="px-6 py-5">
                <p className="text-gray-700 text-sm leading-relaxed mb-5">{step.description}</p>
                <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                  <div className="px-4 py-2 border-b border-gray-100 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-xs text-gray-400 ml-1 font-mono">deal_state.json</span>
                  </div>
                  <div className="p-4 font-mono text-xs space-y-1.5">
                    {step.preview.map((row) => (
                      <div key={row.label} className="flex items-center justify-between">
                        <span className="text-gray-400">{row.label}:</span>
                        <span className={`font-semibold ${row.highlight
                          ? active === steps.length - 1
                            ? 'text-green-600'
                            : active >= 1
                              ? 'text-blue-600'
                              : 'text-gray-700'
                          : 'text-gray-700'
                          }`}>
                          &quot;{row.value}&quot;
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-4 italic">{step.detail}</p>
              </div>

              {/* Step progress */}
              <div className="border-t border-gray-100 px-6 py-3 flex items-center gap-1.5">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? 'bg-black w-6' : 'bg-gray-200 w-4 hover:bg-gray-400'
                      }`}
                  />
                ))}
                <span className="ml-auto text-xs text-gray-400">{active + 1} / {steps.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
