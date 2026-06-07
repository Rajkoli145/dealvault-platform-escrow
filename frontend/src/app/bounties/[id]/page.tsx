'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, DollarSign, Send, Clock, GitBranch, User, CheckCircle, Inbox, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { demoBounties, applyToDemoBounty, readDemoApplications } from '../../../lib/demoFlow';

export default function BountyDetailPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bounty, setBounty] = useState<typeof demoBounties[0] | null>(null);
  const [applied, setApplied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/');
      return;
    }

    // Get bounty ID from URL
    const pathParts = window.location.pathname.split('/');
    const bountyId = pathParts[pathParts.length - 1];
    
    const foundBounty = demoBounties.find(b => b.id === bountyId);
    if (!foundBounty) {
      router.replace('/bounties');
      return;
    }
    
    setBounty(foundBounty);

    // Check if already applied
    const applications = readDemoApplications();
    const hasApplied = applications.some(app => app.id === bountyId);
    setApplied(hasApplied);
  }, [isLoading, user, router]);

  const handleApply = () => {
    if (!bounty || !comment.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      applyToDemoBounty(bounty);
      setIsSubmitting(false);
      setShowSuccess(true);
      
      // Wait for beautiful animation before revealing feed
      setTimeout(() => {
        setShowSuccess(false);
        setApplied(true);
        setShowForm(false);
      }, 2500);
    }, 1000);
  };

  if (isLoading || !bounty) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-gray-100 border-t-black animate-spin" />
      </div>
    );
  }

  const avatarSrc = user.githubAvatar || user.avatar;
  const initial = user.name?.[0]?.toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-100 px-8 h-20 grid grid-cols-3 items-center sticky top-0 bg-white/90 backdrop-blur-sm z-30">
        <div className="flex items-center gap-2 cursor-pointer -ml-2" onClick={() => router.push('/bounties')}>
          <ArrowLeft className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-600">Back to Issues</span>
        </div>

        <div className="flex items-center justify-center">
          <h1 className="text-lg font-bold text-gray-900">Issue Details</h1>
        </div>

        <div className="flex items-center justify-end gap-3">
          {avatarSrc ? (
            <Image
              src={avatarSrc}
              alt={user.name}
              width={32}
              height={32}
              className="rounded-full ring-2 ring-gray-200"
              unoptimized
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-xs text-white font-bold">
              {initial}
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
        {/* Issue Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
              <DollarSign className="h-3.5 w-3.5" />
              ${bounty.reward.toFixed(2)}
            </span>
            <span className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600">{bounty.label}</span>
            <span className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600">{bounty.stack}</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{bounty.title}</h1>
          <p className="text-sm text-gray-500 mb-4">{bounty.repo}</p>
          
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{bounty.applicants + (applied ? 1 : 0)} applicants</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{bounty.posted}</span>
            </div>
          </div>
        </div>

        {/* Issue Description */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Description</h2>
          <p className="text-base text-gray-600 leading-relaxed">{bounty.description}</p>
        </div>

        {/* Applications Section */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Inbox className="w-5 h-5 text-gray-500" />
                Applications
              </h2>
              <span className="flex items-center justify-center bg-gray-100 text-gray-600 text-xs font-bold rounded-full w-6 h-6">
                {bounty.applicants + (applied ? 1 : 0)}
              </span>
            </div>
            {!applied && !showForm && !showSuccess && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-gray-800 hover:-translate-y-0.5"
              >
                Apply to work on this issue
              </button>
            )}
          </div>

          {/* Form or Success State */}
          {showSuccess ? (
            <div className="border border-gray-200 rounded-xl p-12 bg-white flex flex-col items-center justify-center min-h-[350px] shadow-sm overflow-hidden relative mb-8 animate-fade-in">
              <div className="absolute inset-0 bg-gradient-to-b from-green-50 to-white opacity-60"></div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-xl animate-bounce" style={{ animationDuration: '2s' }}>
                    <CheckCircle className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute inset-0 border-4 border-green-400 rounded-full animate-ping opacity-30" style={{ animationDuration: '1.5s' }}></div>
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Application Submitted!</h2>
                <p className="text-gray-500 text-center max-w-sm font-medium leading-relaxed">
                  Your application has been successfully sent to the maintainers. Updating feed...
                </p>
              </div>
            </div>
          ) : showForm && !applied ? (
            <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm mb-8 animate-fade-in relative">
              <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-sm font-medium">Cancel</button>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Apply to Work on This Issue</h2>
              <p className="text-sm text-gray-500 mb-4 pr-12">
                Please explain why you are interested in this issue and how you plan to approach it. This helps maintainers understand your fit for the task.
              </p>
              
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Describe your experience with similar issues, your proposed solution, and why you're the right person for this task..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 transition-colors resize-none min-h-[150px] leading-relaxed"
              />
              
              <button
                onClick={handleApply}
                disabled={!comment.trim() || isSubmitting}
                className={`mt-4 inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all ${
                  !comment.trim() || isSubmitting
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-900 text-white hover:bg-gray-800 shadow-sm'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-gray-200 border-t-white animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Application
                  </>
                )}
              </button>
            </div>
          ) : null}

          {/* Applications List */}
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
              <div className="relative">
                <select className="appearance-none pl-4 pr-10 py-2 border border-gray-200 rounded-lg text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 focus:outline-none cursor-pointer">
                  <option>Creation Date (oldest first)</option>
                  <option>Creation Date (newest first)</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* If user applied, show their application */}
            {applied && (
              <div className="border-2 border-gray-100 rounded-xl p-5 bg-white shadow-sm animate-fade-in relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gray-900"></div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {avatarSrc ? (
                      <Image src={avatarSrc} alt={user.name} width={36} height={36} className="rounded-full ring-2 ring-gray-100" unoptimized />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-sm text-white font-bold">{initial}</div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-gray-900">{user.name} <span className="text-xs font-normal text-gray-500 ml-1">(You)</span></p>
                      <p className="text-xs text-gray-500">Just now</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 text-gray-800 px-3 py-1 text-xs font-bold border border-gray-200">
                    Applied
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                  {comment || "I have extensively worked with this tech stack and can solve this issue quickly. I've reviewed the requirements and I'm ready to start."}
                </p>
              </div>
            )}

            {/* Mock other applications if any */}
            {bounty.applicants > 0 && (
              <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white text-sm font-bold shadow-inner">A</div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Alex Developer</p>
                      <p className="text-xs text-gray-500">2 days ago</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                  I have experience building React components and would love to tackle this empty state design. I can have a PR ready by tomorrow and ensure it matches the existing design system flawlessly.
                </p>
              </div>
            )}

            {/* Empty State */}
            {bounty.applicants === 0 && !applied && (
              <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-gray-300 rounded-xl bg-gray-50 mt-8">
                <div className="relative mb-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200">
                    <Inbox className="w-8 h-8 text-gray-300" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">No applications yet</h3>
                <p className="text-sm text-gray-500 text-center max-w-sm">
                  No-one has applied to this issue in the current wave. Be the first to apply!
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
