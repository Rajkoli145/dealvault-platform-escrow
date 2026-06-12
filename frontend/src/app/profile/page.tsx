'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import AppNavBar from '../../components/AppNavBar';
import Footer from '../../components/Footer';
import { SkeletonProfile } from '../../components/SkeletonLoader';
import {
  Wallet, Calendar, Mail, Github, ExternalLink,
  CheckCircle2, XCircle, Loader2, Copy, User as UserIcon, Eye, Users,
  ChevronDown, Bell, Check, AlertCircle, Info, Plus, X, Star, DollarSign,
  Clock, TrendingUp, Award, MapPin, Link2, Briefcase, Tag, AlertTriangle
} from 'lucide-react';
import Image from 'next/image';
import { readDemoWallet, writeDemoWallet } from '../../lib/demoFlow';
import { isValidEd25519PublicKey } from '../../utils/stellarStrKey';

export default function ProfilePage() {
  const { user, token, isLoading, logout, refreshSession, loginWithToken } = useAuth();
  const router = useRouter();
  
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletError, setWalletError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [reputationOpen, setReputationOpen] = useState(false);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [bio, setBio] = useState('');
  const [githubHandle, setGithubHandle] = useState('');
  const [twitterHandle, setTwitterHandle] = useState('');
  const [linkedinHandle, setLinkedinHandle] = useState('');
  const [telegramHandle, setTelegramHandle] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  useEffect(() => {
    if (!isLoading && !user) router.replace('/');
  }, [user, isLoading, router]);

  useEffect(() => {
    // SECURITY: Display the address exactly as stored — Stellar StrKeys are
    // case-sensitive; uppercasing corrupts a valid address.
    if (user?.walletAddress) {
      setWalletAddress(user.walletAddress);
      setWalletConnected(true);
    } else {
      const savedWallet = readDemoWallet();
      if (savedWallet) {
        setWalletAddress(savedWallet);
        setWalletConnected(true);
      } else {
        setWalletAddress('');
        setWalletConnected(false);
      }
    }
  }, [user?.walletAddress]);

  const handleConnectWallet = async () => {
    const address = walletAddress.trim();
    if (!address) {
      setWalletError('Please enter a Stellar wallet address.');
      return;
    }
    // SECURITY: Validate the full StrKey (charset + version + CRC16 checksum) before
    // sending. Never send an invalid/typo'd payout address to the backend. Do NOT
    // uppercase — StrKeys are case-sensitive and uppercasing breaks the checksum.
    if (!isValidEd25519PublicKey(address)) {
      setWalletError('Invalid Stellar address — failed checksum. Check for typos.');
      return;
    }

    setWalletError('');
    setIsConnectingWallet(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/wallet`, {
        method: 'POST',
        credentials: 'include', // SECURITY: send httpOnly jwt cookie (see AuthContext dev note)
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ walletAddress: address })
      });
      const data = await res.json();
      if (data.success) {
        writeDemoWallet(address);
        setWalletAddress(address);
        setWalletConnected(true);
        refreshSession();
      } else {
        setWalletError(data.message || 'Failed to link wallet.');
      }
    } catch (err) {
      setWalletError('Server connection error. Failed to link wallet.');
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const handleDisconnectWallet = async () => {
    setWalletError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/wallet`, {
        method: 'POST',
        credentials: 'include', // SECURITY: send httpOnly jwt cookie
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ walletAddress: '' })
      });
      const data = await res.json();
      if (data.success) {
        setWalletAddress('');
        writeDemoWallet('');
        setWalletConnected(false);
        refreshSession();
      } else {
        setWalletError(data.message || 'Failed to unlink wallet.');
      }
    } catch (err) {
      setWalletError('Server connection error. Failed to unlink wallet.');
    }
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleStartKYC = () => {
    router.push('/kyc');
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim().toUpperCase())) {
      setSkills([...skills, newSkill.trim().toUpperCase()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleConnectDiscord = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/auth/discord?token=${token}`;
  };

  const handleUnlinkDiscord = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/auth/discord/unlink`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success && token) {
        // Re-login to fetch updated user state
        loginWithToken(token);
      }
    } catch (err) {
      console.error('Failed to unlink Discord', err);
    }
  };

  const handleSaveProfile = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  if (isLoading || !user) {
    return (
      <>
        <AppNavBar />
        <div className="min-h-screen bg-gray-50 pt-20">
          <main className="max-w-7xl mx-auto px-6 py-8">
            <SkeletonProfile />
          </main>
        </div>
        <Footer />
      </>
    );
  }

  const avatarSrc = user.githubAvatar || user.avatar;
  const initial = user.name?.[0]?.toUpperCase() || 'U';
  const kycVerified = user.kyc?.status === 'approved';
  const kycStatus = user.kyc?.status || 'not_submitted';
  const discordConnected = !!user.discordUsername;
  const completedSteps = (kycVerified ? 1 : 0) + (walletConnected ? 1 : 0) + (discordConnected ? 1 : 0);
  const completionPercentage = (completedSteps / 3) * 100;

  const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
  const activityData = Array.from({ length: 53 }, () => 
    Array.from({ length: 7 }, () => 0)
  );

  return (
    <>
      <AppNavBar />
      <div className="min-h-screen bg-gray-50 pt-20">
      <main className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6">
        {/* Welcome Section */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 mb-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-start gap-8 justify-between">
            {/* Left: Profile Image & Basic Info */}
            <div className="flex items-start gap-6">
              {/* Profile Image */}
              <div className="relative flex-shrink-0">
                <div className="w-32 h-32 rounded-full border-2 border-gray-300 overflow-hidden bg-gray-100 flex items-center justify-center">
                  {avatarSrc ? (
                    <Image src={avatarSrc} alt={user.name} width={128} height={128} className="object-cover w-full h-full rounded-full" unoptimized />
                  ) : (
                    <div className="w-full h-full bg-gray-900 flex items-center justify-center text-white text-5xl font-bold rounded-full">{initial}</div>
                  )}
                </div>
                {kycVerified && (
                  <div className="absolute bottom-2 right-2 w-8 h-8 bg-gray-900 rounded-full border-3 border-white flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
                {user.githubUsername && (
                  <p className="text-sm text-gray-600 font-mono mb-3">@{user.githubUsername}</p>
                )}
              {user.bio && (
                  <p className="text-sm text-gray-700 mb-4">{user.bio}</p>
                )}
                
                <div className="flex items-center gap-6 text-sm text-gray-600 mb-4 flex-wrap">
                  {user.githubUsername && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>Joined GitHub on August 14, 2025</span>
                    </div>
                  )}
                </div>

                {user.createdAt && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Joined DealVault on {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Stats & Action */}
            <div className="flex flex-col items-end gap-6">
              <div className="flex flex-col items-end gap-2">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-900">
                  <Eye className="w-4 h-4" />
                  Public profile
                </button>
              </div>
              
              <div className="text-right space-y-3">
                <div className="flex items-center justify-end gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>Followers <span className="font-bold text-gray-900">{user.followers || 0}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>Following <span className="font-bold text-gray-900">{user.following || 0}</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'DEALS COMPLETED', value: '0' },
            { label: 'USDC EARNED', value: '0' },
            { label: 'REPUTATION', value: '-' },
            { label: 'KYC STATUS', value: kycStatus === 'approved' ? 'Approved' : kycStatus === 'pending' ? 'Pending' : 'Pending' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="text-xs text-gray-500 font-semibold uppercase tracking-widest mb-4">{`// ${stat.label}`}</div>
              <div className="text-4xl font-bold text-gray-900">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* KYC Status Banner */}
        {kycStatus === 'approved' && (
          <div className="bg-green-50 border border-green-200 rounded-lg shadow-sm p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-700 flex-shrink-0" />
            <div>
              <div className="text-xs font-mono text-green-700 mb-1">{'// VERIFIED'}</div>
              <div className="text-sm font-semibold text-green-900">Identity Verified</div>
              <div className="text-xs text-green-800">
                Your identity and address have been successfully verified
                {user.kyc?.verifiedAt && ` on ${new Date(user.kyc.verifiedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.`}
              </div>
            </div>
          </div>
        )}
        {kycStatus === 'pending' && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg shadow-sm p-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <div className="text-xs font-mono text-amber-700 mb-1">{'// IN PROGRESS'}</div>
              <div className="text-sm font-semibold text-amber-900">Verification In Progress</div>
              <div className="text-xs text-amber-800">Your documents are being reviewed</div>
            </div>
          </div>
        )}
        {kycStatus === 'rejected' && (
          <div className="bg-red-50 border border-red-200 rounded-lg shadow-sm p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <div className="text-xs font-mono text-red-700 mb-1">{'// FAILED'}</div>
              <div className="text-sm font-semibold text-red-900">Verification Failed</div>
              {user.kyc?.reviewNote && (
                <div className="text-xs text-red-800 mt-1">{user.kyc.reviewNote}</div>
              )}
              <button onClick={handleStartKYC} className="mt-2 text-xs font-semibold text-red-900 underline">Retry Verification</button>
            </div>
          </div>
        )}

        {/* Complete Profile & Payment Methods Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Complete Profile */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-start gap-3 mb-6">
              <AlertCircle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Complete your Profile</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{3 - completedSteps} steps left</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span>About 10 min</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              {[
                { 
                  step: 1, 
                  text: 'Verify your identity (KYC)', 
                  done: kycVerified,  // Only true when backend confirms
                  pending: !kycVerified && kycStatus === 'pending',
                  action: handleStartKYC
                },
                { 
                  step: 2, 
                  text: 'Connect Stellar Wallet', 
                  done: walletConnected, 
                  pending: false,
                  action: handleConnectWallet
                },
                { 
                  step: 3, 
                  text: 'Connect Discord Account', 
                  done: discordConnected, 
                  pending: false,
                  action: discordConnected ? null : handleConnectDiscord
                }
              ].map((item, index) => (
                <button
                  key={index}
                  onClick={item.action}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded border transition-all duration-500 text-left ${
                    item.done
                      ? 'border-green-400 bg-green-50 animate-pulse shadow-[0_0_12px_rgba(74,222,128,0.4)]'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {item.done ? (
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-xs font-bold text-gray-600">
                      {item.step}
                    </div>
                  )}
                  <span className={`flex-1 text-sm font-medium ${item.done ? 'text-green-800' : 'text-gray-900'}`}>
                    {item.text}
                  </span>
                </button>
              ))}
            </div>

            <div className="h-1 bg-gray-200 rounded overflow-hidden mb-2">
              <div className="h-full bg-gray-900 rounded" style={{ width: `${completionPercentage}%` }} />
            </div>
            <div className="text-xs text-gray-500 font-semibold text-right">{completedSteps} of 3 complete</div>
          </div>

          {/* Payment Methods */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-start gap-3 mb-6">
              <Info className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-bold text-gray-900">Payment Methods</h3>
                <p className="text-xs text-gray-600 mt-1">Connect your Stellar wallet to receive USDC payments for completed deals.</p>
              </div>
            </div>

            <div className="mb-4">
              <a href="#" className="text-xs font-semibold text-gray-700 hover:text-gray-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                See supported Stellar wallets
              </a>
            </div>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Paste your Stellar wallet address (G...)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-xs font-mono text-gray-900 bg-white focus:outline-none focus:border-gray-900 transition-colors"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
              />
              <button
                onClick={handleConnectWallet}
                disabled={isConnectingWallet}
                className="relative overflow-hidden px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded hover:bg-gray-800 transition-colors whitespace-nowrap flex items-center gap-2"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer" />
                <span className="relative z-10">
                  {isConnectingWallet 
                    ? (walletConnected ? 'Updating...' : 'Adding...') 
                    : (walletConnected ? 'Update wallet' : 'Add wallet')}
                </span>
              </button>
            </div>
            {walletError && (
              <div className="text-red-500 text-xs font-semibold mt-[-8px] mb-4 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {walletError}
              </div>
            )}

            {!walletConnected ? (
              <div className="text-center py-8 px-4 border border-dashed border-gray-300 rounded bg-gray-50">
                <Wallet className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <div className="text-sm font-semibold text-gray-900 mb-1">No wallets connected</div>
                <div className="text-xs text-gray-600">Connect your Stellar wallet above to get started</div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm font-semibold text-green-800">Wallet connected successfully</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-3 bg-gray-50 border border-gray-300 rounded">
                  <div className="text-xl">◇</div>
                  <div className="flex-1">
                    <div className="font-mono text-xs font-semibold text-gray-900 truncate">{walletAddress}</div>
                    <div className="text-xs text-gray-500">Stellar Wallet</div>
                  </div>
                  <span className="px-2 py-1 bg-gray-900 text-white text-xs font-semibold rounded whitespace-nowrap">PRIMARY</span>
                  <button onClick={handleDisconnectWallet} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Linked Accounts */}
          <div className="lg:col-span-1 bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-start gap-3 mb-6">
              <Link2 className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-bold text-gray-900 uppercase tracking-wider">Linked Accounts</h3>
                <p className="text-xs text-gray-600 mt-1">Connect your social accounts to verify your identity.</p>
              </div>
            </div>

            {discordConnected ? (
              <div className="flex items-center gap-4 px-4 py-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="w-10 h-10 rounded bg-[#5865F2] flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-lg font-mono text-gray-900 tracking-tight">{user.discordUsername}</div>
                  <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Discord</div>
                </div>
                <button onClick={handleUnlinkDiscord} className="text-sm font-semibold text-gray-500 hover:text-red-500 transition-colors">
                  Unlink
                </button>
              </div>
            ) : (
              <div className="text-center py-8 px-4 border border-dashed border-gray-300 rounded bg-gray-50">
                <Link2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <div className="text-sm font-semibold text-gray-900 mb-1">No accounts linked</div>
                <button onClick={handleConnectDiscord} className="mt-2 text-sm font-semibold text-[#5865F2] hover:text-[#4752C4] transition-colors underline">
                  Connect Discord Account
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Deals & Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Deals Section */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-gray-900">Deals</h2>
              <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded">0 ACTIVE</span>
            </div>
            
            <div className="flex gap-4 mb-6 border-b border-gray-200 pb-4">
              {[
                { label: 'ACTIVE', count: 0 },
                { label: 'AVAILABLE', count: 0 },
                { label: 'COMPLETED', count: 0 }
              ].map((tab) => (
                <button
                  key={tab.label}
                  className="text-xs font-semibold text-gray-700 hover:text-gray-900 transition-colors pb-2 border-b-2 border-transparent hover:border-gray-400"
                >
                  {tab.label} <span className="text-gray-900 font-bold">{tab.count}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { number: 0, label: 'ACTIVE' },
                { number: 0, label: 'AVAILABLE' },
                { number: 0, label: 'COMPLETED' }
              ].map((item) => (
                <div key={item.label} className="p-6 rounded border border-gray-200 text-center bg-gray-50">
                  <div className="text-5xl font-bold text-gray-900 mb-2">{item.number}</div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-600">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Section */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">Login Activity</h2>
              <span className="text-xs font-semibold text-gray-500">This Year</span>
            </div>
            
            <div className="flex gap-2 mb-4 text-center">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month) => (
                <span key={month} className="text-xs text-gray-600 font-medium flex-1">{month}</span>
              ))}
            </div>
            
            <div className="grid grid-cols-6 gap-1">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-sm bg-gray-200 border border-gray-300 hover:bg-gray-400 transition-colors cursor-pointer" title="0 logins" />
              ))}
            </div>
            <p className="text-xs text-gray-500 text-center mt-4">All activity logged and tracked</p>
          </div>
        </div>

      </main>

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-8 right-8 bg-gray-900 text-white px-5 py-3 rounded-lg text-sm font-semibold shadow-lg flex items-center gap-2 z-50">
          <Check className="w-4 h-4" />
          Profile saved successfully
        </div>
      )}
      </div>
      <Footer />
    </>
  );
}
