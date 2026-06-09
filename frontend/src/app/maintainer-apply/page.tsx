'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import AppNavBar from '../../components/AppNavBar';
import Footer from '../../components/Footer';
import Lightfall from '../../components/Lightfall';
import {
  Github,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronRight,
  Plus,
  X,
  AlertCircle,
  ExternalLink,
  DollarSign,
  Globe,
  ArrowLeft,
  FileText,
  Clock,
  Shield,
  Settings,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type FetchStatus = 'idle' | 'fetching' | 'found' | 'error';
type FundingType = 'self-funded' | 'free';
type Step = 1 | 2 | 3 | 4;

interface RepoInfo {
  name: string;
  description: string;
  stars: number;
  language: string;
  topics: string[];
  openIssues: number;
  isPublic: boolean;
}

// ─── Step indicator ──────────────────────────────────────────────────────────

const STEPS = [
  { num: 1, label: 'Submit Report' },
  { num: 2, label: 'Under Review' },
  { num: 3, label: 'Accepted' },
  { num: 4, label: 'Manage Issues' },
] as const;

function StepIndicator({ current }: { current: Step }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-12">
      {STEPS.map((step, idx) => {
        const isActive = current === step.num;
        const isDone = current > step.num;
        const isLast = idx === STEPS.length - 1;

        return (
          <div key={step.num} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-2 ${
                  isDone
                    ? 'bg-white border-white text-black'
                    : isActive
                    ? 'bg-white border-white text-black shadow-lg ring-4 ring-white/10'
                    : 'bg-transparent border-white/20 text-white/40'
                }`}
              >
                {isDone ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.num
                )}
              </div>
              <span
                className={`text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive ? 'text-white' : isDone ? 'text-gray-300' : 'text-gray-500'
                }`}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={`w-24 md:w-32 h-0.5 mx-1 mb-6 transition-colors duration-300 ${
                  current > step.num ? 'bg-white' : 'bg-white/10'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function MaintainerApplyPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // ── State ──────────────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>(1);

  // Step 1 fields
  const [repoInput, setRepoInput] = useState('');
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>('idle');
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [projectStage, setProjectStage] = useState('');
  const [techInput, setTechInput] = useState('');
  const [techStack, setTechStack] = useState<string[]>([]);
  const [fundingType, setFundingType] = useState<FundingType>('self-funded');
  const [escrowBudget, setEscrowBudget] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [campaignNotes, setCampaignNotes] = useState('');

  const fetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) router.replace('/');
  }, [user, isLoading, router]);

  // Pre-fill email from user context
  useEffect(() => {
    if (user?.email) setContactEmail(user.email);
  }, [user]);

  // ── Repo URL auto-fetch ───────────────────────────────────────────────────
  const parseRepoPath = (input: string) => {
    const clean = input.trim().replace(/^https?:\/\//, '').replace(/^github\.com\//, '').replace(/\/$/, '');
    const parts = clean.split('/');
    if (parts.length >= 2) return `${parts[0]}/${parts[1]}`;
    return null;
  };

  useEffect(() => {
    if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    const path = parseRepoPath(repoInput);

    if (!path) {
      setFetchStatus('idle');
      setRepoInfo(null);
      return;
    }

    setFetchStatus('fetching');
    setRepoInfo(null);

    fetchTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.github.com/repos/${path}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        if (data.private) throw new Error('Private repo');

        const info: RepoInfo = {
          name: data.full_name,
          description: data.description || '',
          stars: data.stargazers_count,
          language: data.language || '',
          topics: data.topics || [],
          openIssues: data.open_issues_count,
          isPublic: !data.private,
        };

        setRepoInfo(info);
        setFetchStatus('found');

        if (!projectName) setProjectName(data.name || '');
        if (!description && data.description) setDescription(data.description);
        if (!techStack.length && data.language) setTechStack([data.language]);
      } catch {
        setFetchStatus('error');
        setRepoInfo(null);
      }
    }, 800);

    return () => {
      if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repoInput]);

  const addTech = () => {
    const tag = techInput.trim();
    if (tag && !techStack.includes(tag)) setTechStack((prev) => [...prev, tag]);
    setTechInput('');
  };

  const removeTech = (tag: string) => setTechStack((prev) => prev.filter((t) => t !== tag));

  const step1Valid =
    fetchStatus === 'found' &&
    projectName.trim().length > 0 &&
    description.trim().length >= 100 &&
    category.length > 0 &&
    projectStage.length > 0 &&
    techStack.length > 0;

  const handleSubmit = () => {
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading || !user) {
    return (
      <>
        <AppNavBar showNavItems={false} />
        <div className="min-h-screen bg-[#0a0a0c] pt-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        </div>
      </>
    );
  }

  return (
    <>
      <AppNavBar showNavItems={false} />
      <div className="min-h-screen bg-[#0a0a0c] text-white pt-20 pb-24 relative overflow-hidden">
        {/* Background Grid Grid layer */}
        <div className="absolute inset-0 z-0">
          <Lightfall
            colors={['#A6C8FF', '#5227FF', '#FF9FFC']}
            backgroundColor="#000000"
            speed={0.5}
            streakCount={2}
            streakWidth={1}
            streakLength={1}
            glow={1}
            density={0.6}
            twinkle={1}
            zoom={2.9}
            backgroundGlow={0.5}
            opacity={1}
            mouseInteraction={false}
            mouseStrength={0.5}
            mouseRadius={1}
            color1="#ffffff"
            color2="#cfcfcf"
            color3="#dfdfdf"
          />
        </div>

        <main className="relative z-10 mx-auto w-full max-w-7xl px-6 py-12">

          {/* Back link */}
          <button
            onClick={() => router.push('/profile')}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-10 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Profile
          </button>

          {/* Step indicator */}
          <StepIndicator current={step} />

          {/* ── Step 1: Submit Report ─────────────────────────────────────────── */}
          {step === 1 && (
            <div className="animate-in fade-in duration-300">
              <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-3">Step 1 of 4</p>
              <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Submit your repository</h1>
              <p className="text-gray-400 text-base mb-10 leading-relaxed">
                Our team will evaluate your project and approve it before issues go live on DealVault.
                This review typically takes <span className="font-semibold text-white">24–48 hours</span>.
              </p>

              {/* ── Repository details card ── */}
              <div className="bg-[#121216]/70 border border-white/10 backdrop-blur-md rounded-2xl overflow-hidden mb-6 shadow-xl">
                <div className="px-7 py-6 border-b border-white/5">
                  <h2 className="text-lg font-bold text-white">Repository Details</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Link your GitHub repository and provide project context for our review team.
                  </p>
                </div>

                <div className="px-7 py-6 space-y-6">
                  {/* GitHub URL */}
                  <div>
                    <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
                      GitHub Repository URL
                    </label>
                    <div className="flex items-center border border-white/10 rounded-xl overflow-hidden focus-within:border-white/30 transition-colors bg-[#17161c]/50">
                      <span className="px-4 py-3 bg-[#1e1d24]/50 text-gray-400 text-sm border-r border-white/10 font-mono whitespace-nowrap select-none">
                        github.com/
                      </span>
                      <input
                        type="text"
                        placeholder="owner/repository-name"
                        value={repoInput}
                        onChange={(e) => setRepoInput(e.target.value)}
                        className="flex-1 px-4 py-3 text-sm font-mono text-white outline-none bg-transparent placeholder:text-gray-600"
                        spellCheck={false}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5">Repository must be publicly accessible.</p>

                    {/* Fetch status banners */}
                    {fetchStatus === 'fetching' && (
                      <div className="mt-3 flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-300 font-medium">Retrieving repository metadata...</span>
                      </div>
                    )}
                    {fetchStatus === 'found' && repoInfo && (
                      <div className="relative mt-3 flex items-start gap-3 overflow-hidden rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white">
                        <span className="pointer-events-none absolute inset-y-0 left-0 w-1/4 -translate-x-full skew-x-[-15deg] bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer" />
                        <CheckCircle2 className="relative z-10 w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <div className="relative z-10 flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white">Repository verified — {repoInfo.name}</p>
                          {repoInfo.description && (
                            <p className="text-xs text-gray-400 mt-0.5 truncate">{repoInfo.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-400">
                            {repoInfo.language && <span>{repoInfo.language}</span>}
                            <span>{repoInfo.stars.toLocaleString()} stars</span>
                            <span>{repoInfo.openIssues} open issues</span>
                          </div>
                        </div>
                        <a
                          href={`https://github.com/${repoInfo.name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative z-10 flex-shrink-0 text-gray-400 hover:text-white transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                    {fetchStatus === 'error' && (
                      <div className="mt-3 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-950/20 border border-red-500/20">
                        <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        <span className="text-sm text-red-300 font-medium">
                          Repository not found or is private. Verify the URL and try again.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Project Name */}
                  <div>
                    <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
                      Project Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. DealVault Platform"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="w-full px-4 py-3 border border-white/10 bg-[#17161c]/50 rounded-xl text-sm text-white outline-none focus:border-white/30 transition-colors placeholder:text-gray-600"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
                      Project Description
                    </label>
                    <textarea
                      placeholder="Describe your project — what it does, who it serves, and why contributors should care. Be specific; this helps our team assess fit."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={5}
                      className="w-full px-4 py-3 border border-white/10 bg-[#17161c]/50 rounded-xl text-sm text-white outline-none focus:border-white/30 transition-colors placeholder:text-gray-600 resize-none"
                    />
                    <div className="flex items-center justify-between mt-1.5">
                      <p className="text-xs text-gray-500">Minimum 100 characters. Specificity accelerates your review.</p>
                      <span className={`text-xs font-semibold ${description.length >= 100 ? 'text-white' : 'text-gray-500'}`}>
                        {description.length} / 100
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Project classification card ── */}
              <div className="bg-[#121216]/70 border border-white/10 backdrop-blur-md rounded-2xl overflow-hidden mb-6 shadow-xl">
                <div className="px-7 py-6 border-b border-white/5">
                  <h2 className="text-lg font-bold text-white">Classification</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Help us categorise your project accurately for contributor discovery.
                  </p>
                </div>

                <div className="px-7 py-6 space-y-6">
                  {/* Category + Stage */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-3 border border-white/10 bg-[#17161c] rounded-xl text-sm text-white outline-none focus:border-white/30 transition-colors appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-[#17161c]">Select a category</option>
                        <option value="defi" className="bg-[#17161c]">DeFi / Finance</option>
                        <option value="infrastructure" className="bg-[#17161c]">Infrastructure</option>
                        <option value="developer-tools" className="bg-[#17161c]">Developer Tools</option>
                        <option value="open-source-tool" className="bg-[#17161c]">Open Source Tool</option>
                        <option value="nft" className="bg-[#17161c]">NFT / Gaming</option>
                        <option value="dao" className="bg-[#17161c]">DAO / Governance</option>
                        <option value="security" className="bg-[#17161c]">Security / Auditing</option>
                        <option value="analytics" className="bg-[#17161c]">Analytics / Data</option>
                        <option value="other" className="bg-[#17161c]">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
                        Project Stage
                      </label>
                      <select
                        value={projectStage}
                        onChange={(e) => setProjectStage(e.target.value)}
                        className="w-full px-4 py-3 border border-white/10 bg-[#17161c] rounded-xl text-sm text-white outline-none focus:border-white/30 transition-colors appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-[#17161c]">Select a stage</option>
                        <option value="early-mvp" className="bg-[#17161c]">Early Stage / MVP</option>
                        <option value="beta" className="bg-[#17161c]">Beta</option>
                        <option value="production" className="bg-[#17161c]">Production</option>
                        <option value="scaling" className="bg-[#17161c]">Scaling</option>
                        <option value="mature" className="bg-[#17161c]">Mature / Established</option>
                      </select>
                    </div>
                  </div>

                  {/* Tech Stack */}
                  <div>
                    <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
                      Tech Stack
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        placeholder="e.g. React, Rust, Soroban..."
                        value={techInput}
                        onChange={(e) => setTechInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
                        className="flex-1 px-4 py-3 border border-white/10 bg-[#17161c]/50 rounded-xl text-sm text-white outline-none focus:border-white/30 transition-colors placeholder:text-gray-600"
                      />
                      <button
                        onClick={addTech}
                        className="px-5 py-3 bg-white text-black text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    {techStack.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {techStack.map((tag) => (
                          <span
                            key={tag}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-white/10 rounded-lg text-xs font-semibold text-white bg-white/5 hover:border-white/30 transition-colors"
                          >
                            {tag}
                            <button
                              onClick={() => removeTech(tag)}
                              className="text-gray-400 hover:text-white transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Add languages, frameworks, and protocols used. Press Enter or click Add.
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Funding type card ── */}
              <div className="bg-[#121216]/70 border border-white/10 backdrop-blur-md rounded-2xl overflow-hidden mb-6 shadow-xl">
                <div className="px-7 py-6 border-b border-white/5">
                  <h2 className="text-lg font-bold text-white">Funding Model</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Choose how contributors will be compensated for resolving issues on your project.
                  </p>
                </div>

                <div className="px-7 py-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Self-Funded */}
                    <button
                      onClick={() => setFundingType('self-funded')}
                      className={`text-left p-5 rounded-xl border-2 transition-all duration-200 relative overflow-hidden ${
                        fundingType === 'self-funded'
                          ? 'border-white bg-white/10 text-white'
                          : 'border-white/10 bg-white/5 hover:border-white/20 text-gray-300'
                      }`}
                    >
                      {fundingType === 'self-funded' && (
                        <div className="absolute inset-0 w-1/2 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer pointer-events-none" />
                      )}
                      <div className="flex items-start justify-between mb-3">
                        <DollarSign className={`w-5 h-5 ${fundingType === 'self-funded' ? 'text-white' : 'text-gray-400'}`} />
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          fundingType === 'self-funded' ? 'border-white bg-white' : 'border-white/20'
                        }`}>
                          {fundingType === 'self-funded' && <div className="w-2 h-2 rounded-full bg-black" />}
                        </div>
                      </div>
                      <p className={`text-sm font-bold mb-1 ${fundingType === 'self-funded' ? 'text-white' : 'text-gray-300'}`}>
                        Self-Funded
                      </p>
                      <p className={`text-xs leading-relaxed ${fundingType === 'self-funded' ? 'text-gray-300' : 'text-gray-500'}`}>
                        Deposit USDC into escrow. Contributors earn real rewards upon issue completion and approval.
                      </p>
                    </button>

                    {/* Free / Network */}
                    <button
                      onClick={() => setFundingType('free')}
                      className={`text-left p-5 rounded-xl border-2 transition-all duration-200 relative overflow-hidden ${
                        fundingType === 'free'
                          ? 'border-white bg-white/10 text-white'
                          : 'border-white/10 bg-white/5 hover:border-white/20 text-gray-300'
                      }`}
                    >
                      {fundingType === 'free' && (
                        <div className="absolute inset-0 w-1/2 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer pointer-events-none" />
                      )}
                      <div className="flex items-start justify-between mb-3">
                        <Globe className={`w-5 h-5 ${fundingType === 'free' ? 'text-white' : 'text-gray-400'}`} />
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          fundingType === 'free' ? 'border-white bg-white' : 'border-white/20'
                        }`}>
                          {fundingType === 'free' && <div className="w-2 h-2 rounded-full bg-black" />}
                        </div>
                      </div>
                      <p className={`text-sm font-bold mb-1 ${fundingType === 'free' ? 'text-white' : 'text-gray-300'}`}>
                        Free / Network
                      </p>
                      <p className={`text-xs leading-relaxed ${fundingType === 'free' ? 'text-gray-300' : 'text-gray-500'}`}>
                        No financial commitment required. Build visibility and attract contributors through community reputation.
                      </p>
                    </button>
                  </div>

                  {/* Escrow budget (self-funded only) */}
                  {fundingType === 'self-funded' && (
                    <div className="pt-2 animate-in slide-in-from-top-2 duration-200">
                      <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
                        Initial Escrow Budget (USDC)
                      </label>
                      <div className="flex items-center border border-white/10 rounded-xl overflow-hidden focus-within:border-white/30 transition-colors bg-[#17161c]/50">
                        <span className="px-4 py-3 bg-[#1e1d24]/50 text-gray-400 text-sm border-r border-white/10 font-mono select-none">
                          $ USDC
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={escrowBudget}
                          onChange={(e) => setEscrowBudget(e.target.value)}
                          className="flex-1 px-4 py-3 text-sm font-mono text-white outline-none bg-transparent placeholder:text-gray-600"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1.5">
                        This amount will be locked in Soroban escrow upon acceptance. You may top up at any time.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Campaign & contact card ── */}
              <div className="bg-[#121216]/70 border border-white/10 backdrop-blur-md rounded-2xl overflow-hidden mb-8 shadow-xl">
                <div className="px-7 py-6 border-b border-white/5">
                  <h2 className="text-lg font-bold text-white">Campaign Context</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Optional information to help our team understand your campaign timeline and reach.
                  </p>
                </div>

                <div className="px-7 py-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        placeholder="your@email.com"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-white/10 bg-[#17161c]/50 rounded-xl text-sm text-white outline-none focus:border-white/30 transition-colors placeholder:text-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
                        Project Website <span className="font-normal normal-case text-gray-500">(optional)</span>
                      </label>
                      <input
                        type="url"
                        placeholder="https://yourproject.io"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        className="w-full px-4 py-3 border border-white/10 bg-[#17161c]/50 rounded-xl text-sm text-white outline-none focus:border-white/30 transition-colors placeholder:text-gray-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
                      Additional Notes <span className="font-normal normal-case text-gray-500">(optional)</span>
                    </label>
                    <textarea
                      placeholder="Any additional context for our review team — campaign goals, target contributor profile, timeline expectations, etc."
                      value={campaignNotes}
                      onChange={(e) => setCampaignNotes(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-white/10 bg-[#17161c]/50 rounded-xl text-sm text-white outline-none focus:border-white/30 transition-colors placeholder:text-gray-600 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Validation callout */}
              {!step1Valid && (
                <div className="flex items-start gap-3 px-5 py-4 rounded-xl border border-white/10 bg-white/5 mb-6">
                  <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-400">
                    Ensure your repository is verified, project name and description are complete (min. 100 characters),
                    category and stage are selected, and at least one technology tag is added.
                  </p>
                </div>
              )}

              {/* Submit CTA */}
              <button
                onClick={handleSubmit}
                disabled={!step1Valid}
                className="w-full flex items-center justify-center gap-3 py-4 bg-white text-black text-sm font-bold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Github className="w-4 h-4" />
                Submit Maintainer Application
                <ChevronRight className="w-4 h-4" />
              </button>
              <p className="text-xs text-center text-gray-500 mt-3">
                By submitting, you confirm that you are the authorised maintainer of this repository.
              </p>
            </div>
          )}

          {/* ── Step 2: Under Review ──────────────────────────────────────────── */}
          {step === 2 && (
            <div className="animate-in fade-in duration-300 text-center">
              <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-3">Step 2 of 4</p>
              <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Application Under Review</h1>
              <p className="text-gray-400 text-base mb-12 leading-relaxed max-w-lg mx-auto">
                Your submission has been received. Our maintainer review team is evaluating your repository against
                DealVault's participation criteria.
              </p>

              {/* Status card */}
              <div className="bg-[#121216]/70 border border-white/10 backdrop-blur-md rounded-2xl overflow-hidden mb-6 text-left shadow-xl">
                <div className="px-7 py-6 border-b border-white/5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Review in Progress</h2>
                    <p className="text-sm text-gray-400">Estimated completion within 24–48 hours</p>
                  </div>
                  <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                    <span className="text-xs font-semibold text-gray-300">Pending</span>
                  </div>
                </div>

                <div className="px-7 py-6">
                  <div className="space-y-4">
                    {[
                      { label: 'Repository', value: repoInfo?.name || parseRepoPath(repoInput) || '—', done: true },
                      { label: 'Project Name', value: projectName || '—', done: true },
                      { label: 'Category', value: category || '—', done: true },
                      { label: 'Funding Model', value: fundingType === 'self-funded' ? 'Self-Funded (USDC Escrow)' : 'Free / Network', done: true },
                      { label: 'Review Status', value: 'Queued for evaluation', done: false },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{row.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">{row.value}</span>
                          {row.done && <CheckCircle2 className="w-4 h-4 text-white flex-shrink-0" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* What happens next */}
              <div className="bg-[#121216]/70 border border-white/10 backdrop-blur-md rounded-2xl overflow-hidden mb-8 text-left shadow-xl">
                <div className="px-7 py-6 border-b border-white/5">
                  <h2 className="text-base font-bold text-white">What Happens Next</h2>
                </div>
                <div className="px-7 py-6 space-y-4">
                  {[
                    {
                      icon: Shield,
                      title: 'Repository audit',
                      desc: 'Our team verifies code quality, open issue volume, and community health metrics.',
                    },
                    {
                      icon: FileText,
                      title: 'Criteria assessment',
                      desc: "Your project is assessed against DealVault's maintainer acceptance criteria and funding guidelines.",
                    },
                    {
                      icon: CheckCircle2,
                      title: 'Decision notification',
                      desc: `You will receive a decision via ${contactEmail || 'your registered email address'} within 24–48 hours.`,
                    },
                  ].map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center flex-shrink-0 bg-white/5">
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{title}</p>
                        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Demo advance (for prototype) */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => router.push('/profile')}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 border border-white/10 text-white text-sm font-semibold rounded-xl hover:bg-white/5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Return to Profile
                </button>
                <button
                  onClick={() => { setStep(3); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white text-black text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Preview: Accepted State
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-3 font-medium">The preview button simulates acceptance — for demonstration purposes only.</p>
            </div>
          )}

          {/* ── Step 3: Accepted ──────────────────────────────────────────────── */}
          {step === 3 && (
            <div className="animate-in fade-in duration-300 text-center">
              <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-3">Step 3 of 4</p>
              <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Application Accepted</h1>
              <p className="text-gray-400 text-base mb-12 leading-relaxed max-w-lg mx-auto">
                Congratulations. Your repository has been approved. You may now proceed to configure and publish
                issues for contributors on DealVault.
              </p>

              {/* Acceptance card */}
              <div className="bg-[#121216]/75 border-2 border-white rounded-2xl overflow-hidden mb-6 text-left shadow-2xl">
                <div className="px-7 py-5 bg-white text-black flex items-center gap-4">
                  <CheckCircle2 className="w-6 h-6 text-black" />
                  <div>
                    <p className="font-bold text-base">Repository Approved</p>
                    <p className="text-xs text-gray-700">{repoInfo?.name || parseRepoPath(repoInput) || 'Your repository'}</p>
                  </div>
                  <span className="ml-auto px-3 py-1 bg-black text-white text-xs font-bold rounded-full">APPROVED</span>
                </div>
                <div className="px-7 py-6 space-y-3">
                  {[
                    { label: 'Maintainer', value: user.name },
                    { label: 'GitHub Handle', value: `@${user.githubUsername || 'connected'}` },
                    { label: 'Funding Model', value: fundingType === 'self-funded' ? 'Self-Funded (USDC)' : 'Free / Network' },
                    { label: 'Tech Stack', value: techStack.join(', ') || '—' },
                    { label: 'Decision Date', value: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{row.label}</span>
                      <span className="text-sm font-semibold text-white">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => { setStep(4); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="w-full flex items-center justify-center gap-3 py-4 bg-white text-black text-sm font-bold rounded-xl hover:bg-gray-200 transition-colors mb-3"
              >
                <Settings className="w-4 h-4" />
                Proceed to Issue Management
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── Step 4: Manage Issues ─────────────────────────────────────────── */}
          {step === 4 && (
            <div className="animate-in fade-in duration-300">
              <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-3">Step 4 of 4</p>
              <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Manage Issues</h1>
              <p className="text-gray-400 text-base mb-10 leading-relaxed">
                You are now an active maintainer on DealVault. Configure bounties, select contributors,
                and manage your campaign from this dashboard.
              </p>

              {/* Maintainer dashboard preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[
                  { label: 'Active Issues', value: '0', sub: 'Published & open for applications' },
                  { label: 'Total Allocated', value: '$0.00', sub: 'USDC in escrow' },
                  { label: 'Contributors', value: '0', sub: 'Reviewed applications' },
                ].map((card) => (
                  <div key={card.label} className="bg-[#121216]/70 border border-white/10 backdrop-blur-md rounded-xl p-5 shadow-lg">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">{card.label}</p>
                    <p className="text-3xl font-bold text-white">{card.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
                  </div>
                ))}
              </div>

              {/* Issue actions */}
              <div className="bg-[#121216]/70 border border-white/10 backdrop-blur-md rounded-2xl overflow-hidden mb-8 shadow-xl">
                <div className="px-7 py-6 border-b border-white/5 flex items-center justify-between">
                  <h2 className="text-base font-bold text-white">Repository Issues</h2>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                    Publish Issue
                  </button>
                </div>
                <div className="px-7 py-16 text-center">
                  <div className="w-12 h-12 border border-white/10 rounded-xl flex items-center justify-center mx-auto mb-4 bg-white/5">
                    <Github className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-bold text-white mb-1">No issues published yet</p>
                  <p className="text-xs text-gray-400 mb-5 max-w-xs mx-auto">
                    Select GitHub issues from your repository to publish as contributor bounties on DealVault.
                  </p>
                  <a
                    href={`https://github.com/${repoInfo?.name || parseRepoPath(repoInput)}/issues`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/10 rounded-lg text-sm font-semibold text-white hover:bg-white/5 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View GitHub Issues
                  </a>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => router.push('/profile')}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 border border-white/10 text-white text-sm font-semibold rounded-xl hover:bg-white/5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Return to Profile
                </button>
                <button
                  onClick={() => router.push('/bounties')}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white text-black text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Explore All Issues
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </main>
      </div>
      <Footer />
    </>
  );
}
