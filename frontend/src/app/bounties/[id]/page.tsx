'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, DollarSign, Send, Clock, GitBranch, User } from 'lucide-react';
import Image from 'next/image';
import { demoBounties, applyToDemoBounty, readDemoApplications } from '../../../lib/demoFlow';

export default function BountyDetailPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bounty, setBounty] = useState<typeof demoBounties[0] | null>(null);
  const [applied, setApplied] = useState(false);

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
      router.push('/bounties/my');
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

        {/* Application Form */}
        {!applied ? (
          <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Apply to Work on This Issue</h2>
            <p className="text-sm text-gray-500 mb-4">
              Please explain why you're interested in this issue and how you plan to approach it. This helps maintainers understand your fit for the task.
            </p>
            
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe your experience with similar issues, your proposed solution, and why you're the right person for this task..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-colors resize-none min-h-[150px] leading-relaxed"
            />
            
            <button
              onClick={handleApply}
              disabled={!comment.trim() || isSubmitting}
              className={`mt-4 inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-colors ${
                !comment.trim() || isSubmitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-gray-400 border-t-white animate-spin" />
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
        ) : (
          <div className="border border-gray-200 rounded-xl p-6 bg-emerald-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                <Send className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Application Submitted</h2>
                <p className="text-sm text-gray-600">You have already applied to this issue. View your applications in the My Applications page.</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/bounties/my')}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-colors"
            >
              View My Applications
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
