'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import AppNavBar from '../../components/AppNavBar';
import Footer from '../../components/Footer';
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
                    ? 'bg-black border-black text-white'
                    : isActive
                    ? 'bg-black border-black text-white shadow-lg ring-4 ring-black/10'
                    : 'bg-white border-gray-300 text-gray-400'
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
                  isActive ? 'text-black' : isDone ? 'text-gray-700' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={`w-24 md:w-32 h-0.5 mx-1 mb-6 transition-colors duration-300 ${
                  current > step.num ? 'bg-black' : 'bg-gray-200'
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
    // Accept "owner/repo", "github.com/owner/repo", or full URL
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

        // Auto-fill fields if empty
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

  // ── Tech stack ────────────────────────────────────────────────────────────
  const addTech = () => {
    const tag = techInput.trim();
    if (tag && !techStack.includes(tag)) setTechStack((prev) => [...prev, tag]);
    setTechInput('');
  };

  const removeTech = (tag: string) => setTechStack((prev) => prev.filter((t) => t !== tag));

  // ── Validation ────────────────────────────────────────────────────────────
  const step1Valid =
    fetchStatus === 'found' &&
    projectName.trim().length > 0 &&
    description.trim().length >= 100 &&
    category.length > 0 &&
    projectStage.length > 0 &&
    techStack.length > 0;

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    // In production: POST to /api/maintainers/apply
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading || !user) {
    return (
      <>
        <AppNavBar showNavItems={false} />
        <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <AppNavBar showNavItems={false} />
      <div className="min-h-screen bg-white pt-20 pb-24">
        <main className="mx-auto w-full max-w-7xl px-6 py-12">

          {/* Back link */}
          <button
            onClick={() => router.push('/profile')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors mb-10 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Profile
          </button>

          {/* Step indicator */}
          <StepIndicator current={step} />

          {/* ── Step 1: Submit Report ─────────────────────────────────────────── */}
          {step === 1 && (
            <div className="animate-in fade-in duration-300">
              <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">Step 1 of 4</p>
              <h1 className="text-4xl font-bold text-black mb-3 tracking-tight">Submit your repository</h1>
              <p className="text-gray-500 text-base mb-10 leading-relaxed">
                Our team will evaluate your project and approve it before issues go live on DealVault.
                This review typically takes <span className="font-semibold text-black">24–48 hours</span>.
              </p>

              {/* ── Repository details card ── */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden mb-6">
                <div className="px-7 py-6 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-black">Repository Details</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Link your GitHub repository and provide project context for our review team.
                  </p>
                </div>

                <div className="px-7 py-6 space-y-6">
                  {/* GitHub URL */}
                  <div>
                    <label className="block text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">
                      GitHub Repository URL
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:border-black transition-colors">
                      <span className="px-4 py-3 bg-gray-50 text-gray-500 text-sm border-r border-gray-300 font-mono whitespace-nowrap select-none">
                        github.com/
                      </span>
                      <input
                        type="text"
                        placeholder="owner/repository-name"
                        value={repoInput}
                        onChange={(e) => setRepoInput(e.target.value)}
                        className="flex-1 px-4 py-3 text-sm font-mono text-black outline-none bg-white placeholder:text-gray-400"
                        spellCheck={false}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">Repository must be publicly accessible.</p>

                    {/* Fetch status banners */}
                    {fetchStatus === 'fetching' && (
                      <div className="mt-3 flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-500 flex-shrink-0" />
                        <span className="text-sm text-gray-600 font-medium">Retrieving repository metadata...</span>
                      </div>
                    )}
                    {fetchStatus === 'found' && repoInfo && (
	                      <div className="relative mt-3 flex items-start gap-3 overflow-hidden rounded-xl border border-black bg-black px-4 py-3 text-white">
	                        <span className="pointer-events-none absolute inset-y-0 left-0 w-1/4 -translate-x-full skew-x-[-15deg] bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
	                        <CheckCircle2 className="relative z-10 w-4 h-4 text-white flex-shrink-0 mt-0.5" />
	                        <div className="relative z-10 flex-1 min-w-0">
                          <p className="text-sm font-semibold">Repository verified — {repoInfo.name}</p>
                          {repoInfo.description && (
                            <p className="text-xs text-gray-300 mt-0.5 truncate">{repoInfo.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-300">
                            {repoInfo.language && <span>{repoInfo.language}</span>}
                            <span>{repoInfo.stars.toLocaleString()} stars</span>
                            <span>{repoInfo.openIssues} open issues</span>
                          </div>
                        </div>
	                        <a
	                          href={`https://github.com/${repoInfo.name}`}
	                          target="_blank"
	                          rel="noopener noreferrer"
	                          className="relative z-10 flex-shrink-0 text-gray-300 hover:text-white transition-colors"
	                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                    {fetchStatus === 'error' && (
                      <div className="mt-3 flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-300">
                        <XCircle className="w-4 h-4 text-black flex-shrink-0" />
                        <span className="text-sm text-black font-medium">
                          Repository not found or is private. Verify the URL and try again.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Project Name */}
                  <div>
                    <label className="block text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">
                      Project Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. DealVault Platform"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm text-black outline-none focus:border-black transition-colors placeholder:text-gray-400 bg-white"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">
                      Project Description
                    </label>
                    <textarea
                      placeholder="Describe your project — what it does, who it serves, and why contributors should care. Be specific; this helps our team assess fit."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm text-black outline-none focus:border-black transition-colors placeholder:text-gray-400 bg-white resize-none"
                    />
                    <div className="flex items-center justify-between mt-1.5">
                      <p className="text-xs text-gray-400">Minimum 100 characters. Specificity accelerates your review.</p>
                      <span className={`text-xs font-semibold ${description.length >= 100 ? 'text-black' : 'text-gray-400'}`}>
                        {description.length} / 100
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Project classification card ── */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden mb-6">
                <div className="px-7 py-6 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-black">Classification</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Help us categorise your project accurately for contributor discovery.
                  </p>
                </div>

                <div className="px-7 py-6 space-y-6">
                  {/* Category + Stage */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm text-black outline-none focus:border-black transition-colors bg-white appearance-none cursor-pointer"
                      >
                        <option value="">Select a category</option>
                        <option value="defi">DeFi / Finance</option>
                        <option value="infrastructure">Infrastructure</option>
                        <option value="developer-tools">Developer Tools</option>
                        <option value="open-source-tool">Open Source Tool</option>
                        <option value="nft">NFT / Gaming</option>
                        <option value="dao">DAO / Governance</option>
                        <option value="security">Security / Auditing</option>
                        <option value="analytics">Analytics / Data</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">
                        Project Stage
                      </label>
                      <select
                        value={projectStage}
                        onChange={(e) => setProjectStage(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm text-black outline-none focus:border-black transition-colors bg-white appearance-none cursor-pointer"
                      >
                        <option value="">Select a stage</option>
                        <option value="early-mvp">Early Stage / MVP</option>
                        <option value="beta">Beta</option>
                        <option value="production">Production</option>
                        <option value="scaling">Scaling</option>
                        <option value="mature">Mature / Established</option>
                      </select>
                    </div>
                  </div>

                  {/* Tech Stack */}
                  <div>
                    <label className="block text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">
                      Tech Stack
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        placeholder="e.g. React, Rust, Soroban..."
                        value={techInput}
                        onChange={(e) => setTechInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm text-black outline-none focus:border-black transition-colors placeholder:text-gray-400 bg-white"
                      />
                      <button
                        onClick={addTech}
                        className="px-5 py-3 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    {techStack.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {techStack.map((tag) => (
                          <span
                            key={tag}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-black bg-white hover:border-black transition-colors"
                          >
                            {tag}
                            <button
                              onClick={() => removeTech(tag)}
                              className="text-gray-400 hover:text-black transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Add languages, frameworks, and protocols used. Press Enter or click Add.
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Funding type card ── */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden mb-6">
                <div className="px-7 py-6 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-black">Funding Model</h2>
                  <p className="text-sm text-gray-500 mt-1">
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
                          ? 'border-black bg-black text-white'
                          : 'border-gray-200 bg-white hover:border-gray-400 text-black'
                      }`}
                    >
                      {fundingType === 'self-funded' && (
                        <div className="absolute inset-0 w-1/2 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer pointer-events-none" />
                      )}
                      <div className="flex items-start justify-between mb-3">
                        <DollarSign className={`w-5 h-5 ${fundingType === 'self-funded' ? 'text-white' : 'text-gray-600'}`} />
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          fundingType === 'self-funded' ? 'border-white bg-white' : 'border-gray-300'
                        }`}>
                          {fundingType === 'self-funded' && <div className="w-2 h-2 rounded-full bg-black" />}
                        </div>
                      </div>
                      <p className={`text-sm font-bold mb-1 ${fundingType === 'self-funded' ? 'text-white' : 'text-black'}`}>
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
                          ? 'border-black bg-black text-white'
                          : 'border-gray-200 bg-white hover:border-gray-400 text-black'
                      }`}
                    >
                      {fundingType === 'free' && (
                        <div className="absolute inset-0 w-1/2 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer pointer-events-none" />
                      )}
                      <div className="flex items-start justify-between mb-3">
                        <Globe className={`w-5 h-5 ${fundingType === 'free' ? 'text-white' : 'text-gray-600'}`} />
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          fundingType === 'free' ? 'border-white bg-white' : 'border-gray-300'
                        }`}>
                          {fundingType === 'free' && <div className="w-2 h-2 rounded-full bg-black" />}
                        </div>
                      </div>
                      <p className={`text-sm font-bold mb-1 ${fundingType === 'free' ? 'text-white' : 'text-black'}`}>
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
                      <label className="block text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">
                        Initial Escrow Budget (USDC)
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:border-black transition-colors">
                        <span className="px-4 py-3 bg-gray-50 text-gray-500 text-sm border-r border-gray-300 font-mono select-none">
                          $ USDC
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={escrowBudget}
                          onChange={(e) => setEscrowBudget(e.target.value)}
                          className="flex-1 px-4 py-3 text-sm font-mono text-black outline-none bg-white placeholder:text-gray-400"
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1.5">
                        This amount will be locked in Soroban escrow upon acceptance. You may top up at any time.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Campaign & contact card ── */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden mb-8">
                <div className="px-7 py-6 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-black">Campaign Context</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Optional information to help our team understand your campaign timeline and reach.
                  </p>
                </div>

                <div className="px-7 py-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        placeholder="your@email.com"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm text-black outline-none focus:border-black transition-colors placeholder:text-gray-400 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">
                        Project Website <span className="font-normal normal-case text-gray-400">(optional)</span>
                      </label>
                      <input
                        type="url"
                        placeholder="https://yourproject.io"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm text-black outline-none focus:border-black transition-colors placeholder:text-gray-400 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">
                      Additional Notes <span className="font-normal normal-case text-gray-400">(optional)</span>
                    </label>
                    <textarea
                      placeholder="Any additional context for our review team — campaign goals, target contributor profile, timeline expectations, etc."
                      value={campaignNotes}
                      onChange={(e) => setCampaignNotes(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm text-black outline-none focus:border-black transition-colors placeholder:text-gray-400 bg-white resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Validation callout */}
              {!step1Valid && (
                <div className="flex items-start gap-3 px-5 py-4 rounded-xl border border-gray-200 bg-gray-50 mb-6">
                  <AlertCircle className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600">
                    Ensure your repository is verified, project name and description are complete (min. 100 characters),
                    category and stage are selected, and at least one technology tag is added.
                  </p>
                </div>
              )}

              {/* Submit CTA */}
              <button
                onClick={handleSubmit}
                disabled={!step1Valid}
                className="w-full flex items-center justify-center gap-3 py-4 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Github className="w-4 h-4" />
                Submit Maintainer Application
                <ChevronRight className="w-4 h-4" />
              </button>
              <p className="text-xs text-center text-gray-400 mt-3">
                By submitting, you confirm that you are the authorised maintainer of this repository.
              </p>
            </div>
          )}

          {/* ── Step 2: Under Review ──────────────────────────────────────────── */}
          {step === 2 && (
            <div className="animate-in fade-in duration-300 text-center">
              <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">Step 2 of 4</p>
              <h1 className="text-4xl font-bold text-black mb-3 tracking-tight">Application Under Review</h1>
              <p className="text-gray-500 text-base mb-12 leading-relaxed max-w-lg mx-auto">
                Your submission has been received. Our maintainer review team is evaluating your repository against
                DealVault's participation criteria.
              </p>

              {/* Status card */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden mb-6 text-left">
                <div className="px-7 py-6 border-b border-gray-100 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-black">Review in Progress</h2>
                    <p className="text-sm text-gray-500">Estimated completion within 24–48 hours</p>
                  </div>
                  <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-gray-600 animate-pulse" />
                    <span className="text-xs font-semibold text-gray-700">Pending</span>
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
                      <div key={row.label} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{row.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-black">{row.value}</span>
                          {row.done && <CheckCircle2 className="w-4 h-4 text-black flex-shrink-0" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* What happens next */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden mb-8 text-left">
                <div className="px-7 py-6 border-b border-gray-100">
                  <h2 className="text-base font-bold text-black">What Happens Next</h2>
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
                      <div className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center flex-shrink-0 bg-gray-50">
                        <Icon className="w-4 h-4 text-black" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-black">{title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Demo advance (for prototype) */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => router.push('/profile')}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 border border-gray-300 text-black text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Return to Profile
                </button>
                <button
                  onClick={() => { setStep(3); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-900 transition-colors"
                >
                  Preview: Accepted State
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-3">The preview button simulates acceptance — for demonstration purposes only.</p>
            </div>
          )}

          {/* ── Step 3: Accepted ──────────────────────────────────────────────── */}
          {step === 3 && (
            <div className="animate-in fade-in duration-300 text-center">
              <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">Step 3 of 4</p>
              <h1 className="text-4xl font-bold text-black mb-3 tracking-tight">Application Accepted</h1>
              <p className="text-gray-500 text-base mb-12 leading-relaxed max-w-lg mx-auto">
                Congratulations. Your repository has been approved. You may now proceed to configure and publish
                issues for contributors on DealVault.
              </p>

              {/* Acceptance card */}
              <div className="border-2 border-black rounded-2xl overflow-hidden mb-6 text-left">
                <div className="px-7 py-5 bg-black text-white flex items-center gap-4">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                  <div>
                    <p className="font-bold text-base">Repository Approved</p>
                    <p className="text-xs text-gray-300">{repoInfo?.name || parseRepoPath(repoInput) || 'Your repository'}</p>
                  </div>
                  <span className="ml-auto px-3 py-1 bg-white text-black text-xs font-bold rounded-full">APPROVED</span>
                </div>
                <div className="px-7 py-6 space-y-3">
                  {[
                    { label: 'Maintainer', value: user.name },
                    { label: 'GitHub Handle', value: `@${user.githubUsername || 'connected'}` },
                    { label: 'Funding Model', value: fundingType === 'self-funded' ? 'Self-Funded (USDC)' : 'Free / Network' },
                    { label: 'Tech Stack', value: techStack.join(', ') || '—' },
                    { label: 'Decision Date', value: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{row.label}</span>
                      <span className="text-sm font-semibold text-black">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => { setStep(4); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="w-full flex items-center justify-center gap-3 py-4 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-900 transition-colors mb-3"
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
              <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">Step 4 of 4</p>
              <h1 className="text-4xl font-bold text-black mb-3 tracking-tight">Manage Issues</h1>
              <p className="text-gray-500 text-base mb-10 leading-relaxed">
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
                  <div key={card.label} className="border border-gray-200 rounded-xl p-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">{card.label}</p>
                    <p className="text-3xl font-bold text-black">{card.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{card.sub}</p>
                  </div>
                ))}
              </div>

              {/* Issue actions */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden mb-8">
                <div className="px-7 py-6 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-base font-bold text-black">Repository Issues</h2>
                  <button className="flex items-center gap-2 px-4 py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-gray-900 transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                    Publish Issue
                  </button>
                </div>
                <div className="px-7 py-16 text-center">
                  <div className="w-12 h-12 border border-gray-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Github className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-bold text-black mb-1">No issues published yet</p>
                  <p className="text-xs text-gray-500 mb-5 max-w-xs mx-auto">
                    Select GitHub issues from your repository to publish as contributor bounties on DealVault.
                  </p>
                  <a
                    href={`https://github.com/${repoInfo?.name || parseRepoPath(repoInput)}/issues`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-black hover:bg-gray-50 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View GitHub Issues
                  </a>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => router.push('/profile')}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 border border-gray-300 text-black text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Return to Profile
                </button>
                <button
                  onClick={() => router.push('/bounties')}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-900 transition-colors"
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
