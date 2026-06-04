import { useState, useEffect, useRef } from 'react';
import { WalletConnectButton } from './components/WalletConnectButton';
import { connectStellarWallet, disconnectStellarWallet } from './utils/stellarWallet';

import logo from './images/DbLogo.png';
import imgFreighter from './images/freighter.png';
import imgLobstr from './images/lobster.png';
import imgXBull from './images/xBull.avif';
import imgSolar from './images/Solar.png';
import imgUSDC from './images/USDC.jpg';
import imgXLM from './images/xlm.jpeg';
import imgUSDT from './images/usdt.png';
import imgReact from './images/react.webp';
import imgNode from './images/nodejs.png';
import imgExpress from './images/express.png';
import imgMongo from './images/mongodb.png';
import imgStellarSDK from './images/StellarSDK.png';
import imgSoroban from './images/soroban.jpg';
import {
  Shield,
  Zap,
  Globe,
  Lock,
  CheckCircle,
  ArrowRight,
  Star,
  Users,
  Briefcase,
  FileText,
  Code2,
  Palette,
  BookOpen,
  TrendingUp,
  Eye,
  AlertCircle,
  Menu,
  X,
  Layers,
  Copy,
  Github,
} from 'lucide-react';

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, inView };
}

interface NavBarProps {
  connectedAddress: string | null;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

function NavBar({ connectedAddress, isConnecting, onConnect, onDisconnect }: NavBarProps) {
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
          <img src={logo} alt="DealVault" className="h-16 w-auto object-contain object-left scale-[1.3] origin-left" />
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
        <div className="flex items-center justify-end gap-3 font-medium">
          <a href="https://github.com" className="hidden md:flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
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


function Hero() {
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

function Stats() {
  const { ref, inView } = useInView();

  const stats = [
    { value: '$0', label: 'Hidden fees', sub: 'What you fund is what contributors earn' },
    { value: '< 5s', label: 'Settlement', sub: 'Powered by Stellar Network' },
    { value: '180+', label: 'Countries', sub: 'Global contributor access' },
    { value: '100%', label: 'Upfront funds', sub: 'Before any work begins' },
  ];

  return (
    <section className="border-y border-gray-200 bg-gray-50">
      <div ref={ref} className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map(({ value, label, sub }, i) => (
          <div key={label}
            className={`transition-all duration-500 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: `${i * 80}ms` }}>
            <div className="text-3xl font-black text-black mb-1">{value}</div>
            <div className="text-sm font-semibold text-gray-700 mb-1">{label}</div>
            <div className="text-xs text-gray-400">{sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PlatformShowcase() {
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

function HowItWorks() {
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

function Security() {
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

function ForWho() {
  const { ref, inView } = useInView();

  const categories = [
    { icon: Code2, label: 'Developers', desc: 'Bug fixes, features, integrations' },
    { icon: Palette, label: 'Designers', desc: 'UI, branding, product design' },
    { icon: BookOpen, label: 'Researchers', desc: 'Analysis, reports, insights' },
    { icon: FileText, label: 'Writers', desc: 'Docs, content, copy' },
    { icon: TrendingUp, label: 'Startups', desc: 'Product builds, MVPs' },
    { icon: Users, label: 'Communities', desc: 'Hackathons, open source' },
  ];

  return (
    <section className="py-24 px-6 bg-gray-50 border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        <div ref={ref} className={`text-center mb-14 transition-all duration-500 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Who It's For</p>
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-black">
            For every kind of contributor.
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Whether you're fixing a bug or building an entire product, DealVault ensures your time is never spent on unfunded work.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {categories.map(({ icon: Icon, label, desc }, i) => (
            <div key={label}
              className={`border border-gray-200 rounded-2xl p-5 text-center hover:border-gray-400 hover:bg-white hover:shadow-sm transition-all duration-300 cursor-default group bg-white ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ transitionDelay: `${i * 60}ms` }}>
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-black transition-colors">
                <Icon className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
              </div>
              <div className="text-sm font-bold text-gray-900 mb-1">{label}</div>
              <div className="text-xs text-gray-400">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyStellar() {
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
              The world's most contributor-friendly payment network. Fast, cheap, and globally accessible.
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

function CTA() {
  const { ref, inView } = useInView();

  return (
    <section className="relative py-24 px-6 border-t border-gray-200 bg-black overflow-hidden">
      {/* Shimmer sweep */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-shimmer absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      </div>
      <div className="max-w-3xl mx-auto text-center">
        <div ref={ref} className={`transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Get started</p>
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-white">
            Stop working on promises.
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
            Join DealVault and work only on opportunities where payment is already secured and waiting for you.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-white/10 border border-white/20 text-white placeholder-gray-500 px-4 py-3 rounded-l-lg text-sm focus:outline-none focus:border-white/40 w-full sm:w-64 transition-colors"
              />
              <button className="bg-white hover:bg-gray-100 text-black font-semibold px-5 py-3 rounded-r-lg text-sm transition-colors whitespace-nowrap">
                Request access
              </button>
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-600">Early access · No credit card required</p>
        </div>
      </div>
    </section>
  );
}

function Footer() {
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
              <img src={logo} alt="DealVault" className="h-14 w-auto object-contain object-left" />
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

function CompatibleStack() {
  const { ref, inView } = useInView(0.1);

  type Pill = { name: string; img?: string; isAny?: boolean };
  const rows: { label: string; items: Pill[] }[] = [
    {
      label: 'Wallets',
      items: [
        { name: 'Freighter', img: imgFreighter },
        { name: 'Lobstr', img: imgLobstr },
        { name: 'xBull', img: imgXBull },
        { name: 'Solar', img: imgSolar },
        { name: 'Any Stellar Wallet', isAny: true },
      ],
    },
    {
      label: 'Assets',
      items: [
        { name: 'USDC', img: imgUSDC },
        { name: 'XLM', img: imgXLM },
        { name: 'USDT', img: imgUSDT },
        { name: 'Any Stellar Asset', isAny: true },
      ],
    },
    {
      label: 'Frameworks',
      items: [
        { name: 'React', img: imgReact },
        { name: 'Node.js', img: imgNode },
        { name: 'Express', img: imgExpress },
        { name: 'MongoDB', img: imgMongo },
        { name: 'Stellar SDK', img: imgStellarSDK },
        { name: 'Soroban', img: imgSoroban },
        { name: 'Any Framework', isAny: true },
      ],
    },
  ];

  return (
    <section className="py-24 px-6 bg-[#f9f9f9] border-t border-gray-200">
      <div className="max-w-5xl mx-auto">
        <div ref={ref} className={`transition-all duration-500 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <h2 className="text-3xl md:text-4xl font-black text-center text-black mb-16">
            Works effortlessly<br />
            with your favorite stack.
          </h2>

          <div className="divide-y divide-gray-100">
            {rows.map((row, ri) => (
              <div
                key={row.label}
                className={`flex flex-wrap items-center gap-4 py-6 transition-all duration-500 ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                style={{ transitionDelay: `${ri * 120}ms` }}
              >
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400 w-24 flex-shrink-0">
                  {row.label}
                </span>
                <div className="w-px h-6 bg-gray-200 flex-shrink-0" />
                <div className="flex flex-wrap items-center gap-2">
                  {row.items.map((item) =>
                    item.isAny ? (
                      <span key={item.name} className="text-sm font-black px-3 py-1.5 rounded-full bg-black text-white ml-1">
                        {item.name}
                      </span>
                    ) : (
                      <span
                        key={item.name}
                        className="flex items-center gap-2 border border-gray-200 bg-white rounded-full pl-1 pr-3.5 py-1 text-sm text-gray-800 font-medium hover:border-gray-400 hover:shadow-md transition-all duration-200 cursor-default select-none"
                      >
                        <span className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm bg-white">
                          <img
                            src={item.img}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </span>
                        {item.name}
                      </span>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const { ref, inView } = useInView(0.05);

  const tweets = [
    {
      name: 'Priya Sharma',
      handle: '@priya_builds',
      avatar: 'PS',
      color: 'bg-purple-500',
      text: 'Finally a platform where I can see the money is actually THERE before I start. Been burned too many times on freelance. DealVault is the fix.',
      time: '9:41 AM · May 14, 2026',
      likes: 47,
    },
    {
      name: 'David Osei',
      handle: '@davidosei_dev',
      avatar: 'DO',
      color: 'bg-blue-600',
      text: 'The Stellar + USDC combo is genius. No volatility, near-zero fees, and instant settlement. This is how remote work should work globally.',
      time: '3:12 PM · May 18, 2026',
      likes: 83,
    },
    {
      name: 'Mei Lin',
      handle: '@meilin_ux',
      avatar: 'ML',
      color: 'bg-pink-500',
      text: 'Approved work on Monday. Payment hit my wallet in 4 seconds. Four. Seconds. Compare that to net-30 invoices from clients 😅',
      time: '11:22 AM · May 20, 2026',
      likes: 129,
    },
    {
      name: 'Arjun Mehta',
      handle: '@arjun_stellar',
      avatar: 'AM',
      color: 'bg-amber-500',
      text: 'The escrow is fully on-chain and auditable. I checked the Stellar block explorer before accepting the bounty. 100 USDC was right there. No trust needed.',
      time: '6:55 PM · May 22, 2026',
      likes: 61,
    },
    {
      name: 'Sarah Kim',
      handle: '@sarahkim_code',
      avatar: 'SK',
      color: 'bg-green-600',
      text: 'Been contributing open source for free for years. DealVault is the first time I felt like my work actually had a guaranteed payday attached from day one.',
      time: '2:08 PM · May 25, 2026',
      likes: 204,
    },
    {
      name: 'Tomás Rivera',
      handle: '@tomas_rust',
      avatar: 'TR',
      color: 'bg-red-500',
      text: 'The Soroban contract is clean. Checked the code on GitHub — fund, release, refund. Simple. Auditable. No surprises. That\'s what I want from escrow infra.',
      time: '10:31 AM · May 28, 2026',
      likes: 38,
    },
  ];

  return (
    <section className="py-24 px-6 bg-white border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        <div ref={ref}>
          <h2 className={`text-3xl md:text-4xl font-black text-center text-black mb-3 transition-all duration-500 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Loved by contributors worldwide.
          </h2>
          <p className={`text-center text-gray-400 text-sm mb-14 transition-all duration-500 ${inView ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '100ms' }}>
            Don't take our word for it — here's what builders are saying.
          </p>

          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {tweets.map((tweet, i) => (
              <div
                key={tweet.handle}
                className={`break-inside-avoid border border-gray-200 rounded-2xl p-5 bg-white hover:border-gray-300 hover:shadow-xl hover:-translate-y-1 hover:rotate-1 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${inView
                  ? 'opacity-100 translate-y-0 scale-100 rotate-0'
                  : `opacity-0 translate-y-20 scale-75 ${i % 2 === 0 ? '-rotate-12' : 'rotate-12'}`
                  }`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full ${tweet.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                      {tweet.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900 leading-tight">{tweet.name}</div>
                      <div className="text-xs text-gray-400">{tweet.handle}</div>
                    </div>
                  </div>
                  {/* X logo */}
                  <svg className="w-4 h-4 text-gray-300 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.261 5.636L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">{tweet.text}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{tweet.time}</span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12z" /></svg>
                    {tweet.likes}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MvpSimulationDashboard({
  connectedAddress,
}: {
  connectedAddress: string | null;
}) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiStatus(null);
    setApiError(null);
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        setUser(data.data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setApiStatus('Registered and logged in successfully!');
      } else {
        setApiError(data.message || 'Registration failed');
      }
    } catch (err: any) {
      setApiError('Server connection error. Is the backend running?');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiStatus(null);
    setApiError(null);
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        setUser(data.data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setApiStatus('Logged in successfully!');
      } else {
        setApiError(data.message || 'Login failed');
      }
    } catch (err: any) {
      setApiError('Server connection error. Is the backend running?');
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setApiStatus('Logged out.');
  };

  const handleLinkWallet = async () => {
    if (!connectedAddress) {
      setApiError('Please connect your Stellar wallet first using the top-right button.');
      return;
    }
    if (!token) {
      setApiError('Please register or log in first.');
      return;
    }
    setApiStatus(null);
    setApiError(null);
    try {
      const res = await fetch('http://localhost:5000/api/auth/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ walletAddress: connectedAddress }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.data.user);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setApiStatus('Stellar wallet successfully linked to your database profile!');
      } else {
        setApiError(data.message || 'Wallet linking failed');
      }
    } catch (err) {
      setApiError('Server connection error while linking wallet.');
    }
  };

  return (
    <section className="py-12 px-6 bg-gray-50 border-y border-gray-200">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
        <div className="bg-black text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold">Stellar Wallet MVP Simulation Dashboard</h3>
          </div>
          <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-mono">MVP Interactive Testing</span>
        </div>

        <div className="p-6 grid md:grid-cols-2 gap-8">
          {/* Left Panel: Auth Form */}
          <div className="border-r border-gray-100 pr-0 md:pr-8">
            {user ? (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-gray-700">Active Session Info:</p>
                <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-xs font-mono">
                  <div><span className="text-gray-400">Name:</span> {user.name}</div>
                  <div><span className="text-gray-400">Email:</span> {user.email}</div>
                  <div><span className="text-gray-400">Role:</span> <span className="uppercase font-bold text-amber-700">{user.role}</span></div>
                  <div>
                    <span className="text-gray-400">DB Wallet Address:</span>{' '}
                    <span className="text-green-700 font-bold truncate block">
                      {user.walletAddress || 'None Linked'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-center text-xs text-red-600 border border-red-200 hover:bg-red-50 rounded-lg py-2 transition-colors font-medium"
                >
                  Log Out Session
                </button>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-3">
                <p className="text-sm font-bold text-gray-800">Login or Register Mock Account</p>
                
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Name (for registration)</label>
                  <input
                    type="text"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="jane@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-black"
                  />
                </div>

                <div className="flex gap-4 items-center">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Role:</span>
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="radio"
                      name="role"
                      checked={role === 'buyer'}
                      onChange={() => setRole('buyer')}
                    />
                    Buyer
                  </label>
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="radio"
                      name="role"
                      checked={role === 'seller'}
                      onChange={() => setRole('seller')}
                    />
                    Seller
                  </label>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 text-xs bg-black text-white hover:bg-gray-800 rounded-lg py-2 font-medium transition-colors"
                  >
                    Log In
                  </button>
                  <button
                    type="button"
                    onClick={handleRegister}
                    className="flex-1 text-xs border border-black text-black hover:bg-gray-50 rounded-lg py-2 font-medium transition-colors"
                  >
                    Register
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Panel: Wallet Link Action */}
          <div className="flex flex-col justify-center space-y-4">
            <p className="text-sm font-bold text-gray-800">Database Wallet Association</p>
            
            <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-xs font-mono">
              <div>
                <span className="text-gray-400">Selected Extension Wallet:</span>{' '}
                <span className="text-blue-700 font-bold block truncate">
                  {connectedAddress || 'None Connected'}
                </span>
              </div>
            </div>

            <button
              onClick={handleLinkWallet}
              disabled={!connectedAddress || !token}
              className="w-full text-xs bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 text-black font-semibold rounded-lg py-2.5 transition-colors shadow-sm"
            >
              Sync & Save Wallet to Profile
            </button>

            {apiStatus && (
              <div className="text-xs bg-green-50 text-green-700 border border-green-200 p-3 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-4.5 h-4.5 flex-shrink-0" />
                <span>{apiStatus}</span>
              </div>
            )}

            {apiError && (
              <div className="text-xs bg-red-50 text-red-700 border border-red-200 p-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
                <span>{apiError}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const address = await connectStellarWallet();
      setConnectedAddress(address);
    } catch (err) {
      console.error(err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnectStellarWallet();
    setConnectedAddress(null);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <NavBar
        connectedAddress={connectedAddress}
        isConnecting={isConnecting}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />
      <Hero />
      <MvpSimulationDashboard connectedAddress={connectedAddress} />
      <Stats />
      <CompatibleStack />
      <Testimonials />
      <PlatformShowcase />
      <HowItWorks />
      <Security />
      <ForWho />
      <WhyStellar />
      <CTA />
      <Footer />
    </div>
  );
}

