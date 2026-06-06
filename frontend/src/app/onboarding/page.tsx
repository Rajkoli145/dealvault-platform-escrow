'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Check, Shield, Terminal, Users, Hexagon, Lock, BadgeCheck } from 'lucide-react';
import Image from 'next/image';

export default function OnboardingPage() {
  const { user, token, loginWithToken, isLoading } = useAuth();
  const router = useRouter();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState<'maintainer' | 'contributor' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [githubStats, setGithubStats] = useState<{ followers: number; repos: number } | null>(null);

  useEffect(() => {
    // If not logged in and not loading, go to home
    if (!isLoading && !user) {
      router.replace('/');
    }
    // If user already picked a role (not buyer), go to dashboard
    if (!isLoading && user && user.role !== 'buyer') {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    // Fetch live GitHub stats
    if (user?.githubUsername) {
      fetch(`https://api.github.com/users/${user.githubUsername}`)
        .then(res => res.json())
        .then(data => {
          setGithubStats({
            followers: data.followers || 0,
            repos: data.public_repos || 0
          });
        })
        .catch(console.error);
    }
  }, [user?.githubUsername]);

  if (isLoading || !user || user.role !== 'buyer') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-gray-200 border-t-violet-600 animate-spin" />
      </div>
    );
  }

  const handleCompleteSetup = async () => {
    if (!selectedRole || !token) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/auth/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: selectedRole })
      });
      if (res.ok) {
        loginWithToken(token);
        // Contributors go to the bounties explorer; maintainers go to the dashboard
        router.replace(selectedRole === 'contributor' ? '/bounties' : '/dashboard');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const initial = user.name?.[0]?.toUpperCase() || 'U';
  const firstName = user.name?.split(' ')[0] || 'there';
  const avatarSrc = user.githubAvatar || user.avatar;

  const formatNumber = (num: number) => {
    return num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6">
      
      {step === 1 && (
        <div className="bg-white rounded-3xl p-10 shadow-xl border border-gray-100 w-full max-w-md animate-fade-in relative overflow-hidden">
          {/* Top Logo */}
          <div className="flex flex-col items-center mb-8">
            <Image 
              src="/favicon.png" 
              alt="DealVault Logo" 
              width={64} 
              height={64} 
              className="mb-6 rounded-2xl shadow-lg" 
              priority
            />
            <h1 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Welcome to DealVault</h1>
            <p className="text-gray-500 text-sm text-center">
              Confirm your profile to start funding or earning bounties
            </p>
          </div>

          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-6 relative z-10">
            <div className="relative w-24 h-24 mb-4">
              {avatarSrc ? (
                <div className="relative w-full h-full rounded-full overflow-hidden shadow-md ring-4 ring-white border-2 border-black">
                  <Image src={avatarSrc} alt={user.name} fill className="object-cover" unoptimized />
                </div>
              ) : (
                <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-white text-3xl font-medium shadow-md ring-4 ring-white border-2 border-black">
                  {initial}
                </div>
              )}
              {/* Verified Badge Overlay */}
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center z-20">
                <Check className="w-4 h-4 text-white stroke-[3]" />
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
            {user.githubUsername && (
              <p className="text-gray-500 flex items-center gap-1.5 mt-1 text-sm">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"></path></svg>
                @{user.githubUsername}
              </p>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <div className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-xs font-semibold flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              GitHub Verified
            </div>
            {githubStats && (
              <>
                <div className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-full text-xs font-semibold flex items-center gap-1.5">
                  <Hexagon className="w-3.5 h-3.5" />
                  {formatNumber(githubStats.repos)} Repos
                </div>
                <div className="px-3 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded-full text-xs font-semibold flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  {formatNumber(githubStats.followers)} Followers
                </div>
              </>
            )}
          </div>

          {/* Bio Block */}
          {user.bio && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-8">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">GitHub Bio</div>
              <p className="text-gray-700 text-sm">{user.bio}</p>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={() => setStep(2)}
            className="w-full bg-black text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:bg-gray-900 transition-all shadow-lg hover:shadow-xl scale-[1.01]"
          >
            Continue to DealVault →
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-in w-full max-w-2xl flex flex-col items-center">
          <div className="text-center mb-10">
            <div className="relative mx-auto w-20 h-20 mb-6 group">
              {avatarSrc ? (
                <>
                  <div className="absolute inset-0 rounded-full bg-black/10 blur-xl scale-[1.3] opacity-50 group-hover:opacity-80 transition-opacity duration-700 animate-pulse" />
                  <div className="relative w-full h-full rounded-full overflow-hidden shadow-2xl ring-4 ring-white border border-gray-200">
                    <Image src={avatarSrc} alt={firstName} fill className="object-cover" unoptimized />
                  </div>
                </>
              ) : (
                <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-white text-3xl font-medium shadow-2xl ring-4 ring-white">
                  {initial}
                </div>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Select your role</h1>
            <p className="text-gray-500">How do you intend to utilize DealVault?</p>
          </div>

          <div className="flex flex-col md:flex-row gap-5 w-full mb-8">
            {/* Maintainer Card */}
            <div 
              onClick={() => setSelectedRole('maintainer')}
              className={`flex-1 bg-white rounded-2xl p-6 cursor-pointer border-2 transition-all duration-300 relative group ${selectedRole === 'maintainer' ? 'border-black shadow-xl scale-[1.02]' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'}`}
            >
              <div className={`absolute top-5 right-5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedRole === 'maintainer' ? 'border-black' : 'border-gray-300'}`}>
                {selectedRole === 'maintainer' && <div className="w-2.5 h-2.5 rounded-full bg-black animate-fade-in" />}
              </div>
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mb-4 border border-gray-100 group-hover:bg-gray-100 transition-colors">
                <Shield className="w-5 h-5 text-gray-900" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2 tracking-tight">Maintainer</h2>
              <p className="text-gray-500 text-xs mb-5 leading-relaxed">
                Orchestrate open-source development by deploying USDC-funded bounties for global contributors.
              </p>
              <ul className="space-y-3">
                {[
                  'Provision cryptographic escrows',
                  'Automate smart contract payouts',
                  'Oversee contributor submissions',
                  'Arbitrate potential discrepancies'
                ].map(item => (
                  <li key={item} className="flex items-start text-xs text-gray-600 gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-[1px]" />
                    <span className="leading-tight">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contributor Card */}
            <div 
              onClick={() => setSelectedRole('contributor')}
              className={`flex-1 bg-white rounded-2xl p-6 cursor-pointer border-2 transition-all duration-300 relative group ${selectedRole === 'contributor' ? 'border-black shadow-xl scale-[1.02]' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'}`}
            >
              <div className={`absolute top-5 right-5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedRole === 'contributor' ? 'border-black' : 'border-gray-300'}`}>
                {selectedRole === 'contributor' && <div className="w-2.5 h-2.5 rounded-full bg-black animate-fade-in" />}
              </div>
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mb-4 border border-gray-100 group-hover:bg-gray-100 transition-colors">
                <Terminal className="w-5 h-5 text-gray-900" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2 tracking-tight">Contributor</h2>
              <p className="text-gray-500 text-xs mb-5 leading-relaxed">
                Discover premium bounties, submit high-quality pull requests, and secure instant USDC settlements.
              </p>
              <ul className="space-y-3">
                {[
                  'Explore curated open-source tasks',
                  'Engage with verified maintainers',
                  'Commit code & submit deliverables',
                  'Receive automated on-chain payouts'
                ].map(item => (
                  <li key={item} className="flex items-start text-xs text-gray-600 gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-[1px]" />
                    <span className="leading-tight">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="w-full flex flex-col items-center">
            <button
              onClick={handleCompleteSetup}
              disabled={!selectedRole || isSubmitting}
              className={`relative overflow-hidden w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 group ${selectedRole ? 'bg-black text-white hover:bg-gray-900 shadow-lg scale-[1.01]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
              {isSubmitting ? (
                 <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              ) : (
                 <>
                   <span className="relative z-10">Complete Setup →</span>
                   {selectedRole && <div className="absolute inset-0 w-1/2 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />}
                 </>
              )}
            </button>
            
            <button 
              onClick={() => setStep(1)}
              className="text-gray-400 hover:text-gray-600 text-sm mt-4 font-medium transition-colors"
            >
              ← Back to Profile
            </button>
          </div>
        </div>
      )}
      
    </div>
  );
}
