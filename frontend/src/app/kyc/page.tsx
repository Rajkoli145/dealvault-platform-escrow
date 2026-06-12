'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import AppNavBar from '../../components/AppNavBar';
import Footer from '../../components/Footer';
import {
  ShieldCheck, FileCheck, Home, Clock, CheckCircle2, XCircle, AlertTriangle,
  Loader2, ChevronRight, ExternalLink, Info
} from 'lucide-react';

type KycStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export default function KYCVerificationPage() {
  const { user, token } = useAuth();
  const [status, setStatus] = useState<KycStatus>('not_submitted');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [reviewNote, setReviewNote] = useState('');
  const [sdkActive, setSdkActive] = useState(false);
  const sdkContainerRef = useRef<HTMLDivElement>(null);
  const sdkInstanceRef = useRef<any>(null);

  const fetchStatus = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/kyc/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setStatus(data.data.status);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [token]);

  const fetchTokenAndLaunch = async () => {
    setActionLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/kyc/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to launch verification');
      setStatus('pending');
      launchSumsubSDK(data.token, data.expiresIn);
    } catch (err: any) {
      setError(err.message || 'Failed to start verification');
      setActionLoading(false);
    }
  };

  const launchSumsubSDK = (accessToken: string, ttl: number) => {
    // Show the SDK container first
    setSdkActive(true);
    setActionLoading(false);

    const initSdk = () => {
      try {
        const snsWebSdk = (window as any).snsWebSdk;
        if (!snsWebSdk) throw new Error('Sumsub SDK not loaded');

        // Modern Sumsub WebSDK v2 init API
        const sdk = snsWebSdk
          .init(
            accessToken,
            // Token refresh callback
            () => fetchTokenAndLaunch()
          )
          .withConf({
            lang: 'en',
            onMessage: (type: string, payload: any) => {
              console.log('Sumsub message:', type, payload);
              if (type === 'idCheck.onApplicantStatusChanged' || type === 'applicantReviewed') {
                fetchStatus();
              }
            },
            onError: (err: any) => {
              console.error('Sumsub SDK error:', err);
              setError('Verification session error. Please try again.');
              setSdkActive(false);
            },
          })
          .withOptions({ addViewportTag: false, adaptIframeHeight: true })
          .on('idCheck.onStepCompleted', () => { fetchStatus(); })
          .on('idCheck.onApplicantStatusChanged', () => { fetchStatus(); })
          .build();

        sdk.launch('#sumsub-websdk-container');
        sdkInstanceRef.current = sdk;
      } catch (err) {
        console.error('Sumsub init error:', err);
        setError('Failed to initialize verification client.');
        setSdkActive(false);
      }
    };

    // Load SDK script if not already loaded
    if ((window as any).snsWebSdk) {
      initSdk();
    } else {
      const script = document.createElement('script');
      script.src = 'https://static.sumsub.com/idensic/static/sns-websdk-builder.js';
      script.async = true;
      script.onload = initSdk;
      script.onerror = () => {
        setError('Failed to load verification client.');
        setSdkActive(false);
      };
      document.body.appendChild(script);
    }
  };

  const handleRetry = () => {
    setStatus('not_submitted');
    setError('');
    setReviewNote('');
    setSdkActive(false);
    if (sdkInstanceRef.current) {
      try { sdkInstanceRef.current.destroy(); } catch {}
      sdkInstanceRef.current = null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <AppNavBar />
        <main className="max-w-3xl mx-auto px-6 py-12 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-gray-900 animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <AppNavBar />

      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* ─── Header ─────────────────────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-900 rounded flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Identity Verification</h1>
              <p className="text-xs text-gray-500 font-mono">{'// SECURE VERIFICATION'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-gray-500">
            <span className={status === 'not_submitted' ? 'text-gray-900 font-semibold' : ''}>STEP 1</span>
            <ChevronRight className="w-3 h-3" />
            <span className={status === 'pending' || status === 'approved' || status === 'rejected' ? 'text-gray-900 font-semibold' : ''}>
              UPLOAD
            </span>
            <ChevronRight className="w-3 h-3" />
            <span>COMPLETE</span>
          </div>
        </div>

        {/* ─── Not Submitted ─────────────────────────────────────────────────── */}
        {status === 'not_submitted' && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Required Documents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded p-4 flex gap-3">
                  <FileCheck className="w-5 h-5 text-gray-900 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-mono text-gray-500 mb-1">{'// IDENTITY'}</div>
                    <div className="text-sm font-semibold text-gray-900 mb-1">Government-issued ID</div>
                    <div className="text-xs text-gray-600 leading-relaxed">
                      Passport, Aadhaar Card, National ID, or Driver&apos;s License.
                      Must be valid and clearly legible.
                    </div>
                  </div>
                </div>
                <div className="border border-gray-200 rounded p-4 flex gap-3">
                  <Home className="w-5 h-5 text-gray-900 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-mono text-gray-500 mb-1">{'// ADDRESS PROOF'}</div>
                    <div className="text-sm font-semibold text-gray-900 mb-1">Proof of Address</div>
                    <div className="text-xs text-gray-600 leading-relaxed">
                      Utility bill, bank statement, election/voter ID, or
                      government-issued address proof (issued within 3 months).
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-gray-900 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-mono text-gray-500 mb-1">{'// SECURITY'}</div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Documents are processed directly by Sumsub — encrypted, transient,
                    and never stored on our servers. Your data is handled per PCI DSS / SOC 2 standards.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-mono text-red-600 mb-1">{'// ERROR'}</div>
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            <button
              onClick={fetchTokenAndLaunch}
              disabled={actionLoading}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gray-900 text-white text-sm font-semibold rounded hover:bg-gray-800 transition-colors disabled:opacity-60"
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4" />
              )}
              {actionLoading ? 'Starting secure session...' : 'Begin Verification'}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <Info className="w-3.5 h-3.5" />
              Takes approximately 2 minutes
            </div>
          </div>
        )}

        {/* ─── Pending ────────────────────────────────────────────────────────── */}
        {status === 'pending' && (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg shadow-sm p-6">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-mono text-amber-700 mb-1">{'// IN PROGRESS'}</div>
                  <div className="text-sm font-semibold text-amber-900 mb-1">Verification In Progress</div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Your documents are being reviewed by Sumsub. This typically takes 1–2 minutes.
                    You can safely navigate away — we&apos;ll notify you once complete.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <div className="text-xs font-mono text-gray-500 mb-3">{'// LIVE SESSION'}</div>
              <div className="flex items-center justify-center py-8 border border-dashed border-gray-200 rounded text-xs text-gray-500">
                Verification sandbox active
              </div>
            </div>

            <button
              onClick={fetchStatus}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 border border-gray-300 bg-white text-gray-900 text-sm font-semibold rounded hover:bg-gray-50 transition-colors"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              Refresh Status
            </button>
          </div>
        )}

        {/* ─── Approved ───────────────────────────────────────────────────────── */}
        {status === 'approved' && (
          <div className="space-y-6">
            <div className="bg-white border border-green-200 rounded-lg shadow-sm p-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-green-700" />
                </div>
                <div>
                  <div className="text-xs font-mono text-green-700 mb-1">{'// VERIFIED'}</div>
                  <div className="text-sm font-semibold text-green-900 mb-1">Identity Verified</div>
                  <p className="text-xs text-green-800 leading-relaxed">
                    Your identity and address have been successfully verified.
                    You now have full access to the platform.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <div className="text-xs font-mono text-gray-500 mb-3">{'// SUMMARY'}</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">ID Document</div>
                  <div className="text-sm font-semibold text-gray-900">Verified</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Address Proof</div>
                  <div className="text-sm font-semibold text-gray-900">Verified</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Rejected ───────────────────────────────────────────────────────── */}
        {status === 'rejected' && (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg shadow-sm p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-mono text-red-700 mb-1">{'// DECLINED'}</div>
                  <div className="text-sm font-semibold text-red-900 mb-1">Verification Failed</div>
                  <p className="text-xs text-red-800 leading-relaxed mb-3">
                    We couldn&apos;t verify your documents. Please review the issue below and try again.
                  </p>
                  {reviewNote && (
                    <div className="text-xs text-red-800 bg-red-100/60 rounded p-2 font-mono leading-relaxed">
                      {reviewNote}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <div className="text-xs font-mono text-gray-500 mb-2">{'// TIPS TO SUCCEED'}</div>
              <ul className="text-xs text-gray-700 space-y-2">
                <li>• Ensure ID is valid, not expired, and corners are visible.</li>
                <li>• Address proof must be issued within the last 3 months.</li>
                <li>• Avoid glare, blur, or partial captures in photos.</li>
                <li>• Make sure name matches across both documents.</li>
              </ul>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-mono text-red-600 mb-1">{'// ERROR'}</div>
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            <button
              onClick={handleRetry}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gray-900 text-white text-sm font-semibold rounded hover:bg-gray-800 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Try Again
            </button>
          </div>
        )}

        {/* ─── SDK Mount Point ──────────────────────────────────────── */}
        <div
          id="sumsub-websdk-container"
          ref={sdkContainerRef}
          className={sdkActive ? 'block w-full min-h-[600px]' : 'hidden'}
        />
      </main>

      <Footer />
    </div>
  );
}
