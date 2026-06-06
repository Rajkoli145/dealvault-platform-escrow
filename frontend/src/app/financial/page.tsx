'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowDownToLine,
  BadgeCheck,
  Check,
  Clock,
  Copy,
  ExternalLink,
  GitPullRequest,
  Inbox,
  ReceiptText,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import AppNavBar from '../../components/AppNavBar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import {
  DemoApplication,
  readDemoApplications,
  readDemoWallet,
  writeDemoApplications,
} from '../../lib/demoFlow';

export default function FinancialPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [applications, setApplications] = useState<DemoApplication[]>([]);

  useEffect(() => {
    if (!isLoading && !user) router.replace('/');
  }, [isLoading, router, user]);

  useEffect(() => {
    setApplications(readDemoApplications());
    setWalletAddress(readDemoWallet());
  }, []);

  const releasedApplications = useMemo(
    () => applications.filter((application) => application.status === 'completed' || application.status === 'paid'),
    [applications]
  );

  const paidApplications = releasedApplications.filter((application) => application.status === 'paid');
  const readyApplications = releasedApplications.filter((application) => application.status === 'completed');
  const pendingApplications = applications.filter((application) => application.status === 'applied' || application.status === 'selected');
  const readyAmount = readyApplications.reduce((total, application) => total + application.reward, 0);
  const paidAmount = paidApplications.reduce((total, application) => total + application.reward, 0);

  if (isLoading || !user) {
    return (
      <>
        <AppNavBar />
        <div className="min-h-screen bg-gray-50 pt-20">
          <main className="mx-auto flex min-h-[520px] max-w-7xl items-center justify-center px-6">
            <div className="h-10 w-10 rounded-full border-2 border-gray-100 border-t-black animate-spin" />
          </main>
        </div>
      </>
    );
  }

  const handleCopy = () => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleWithdraw = () => {
    const nextApplications = applications.map((application) => (
      application.status === 'completed' ? { ...application, status: 'paid' as const } : application
    ));
    writeDemoApplications(nextApplications);
    setApplications(nextApplications);
  };

  return (
    <>
      <AppNavBar />
      <div className="min-h-screen bg-gray-50 pt-20">
        <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8">
          <section className="flex flex-col gap-5 border-b border-gray-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-600">
                <ReceiptText className="h-3.5 w-3.5" />
                Contributor payments
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">Financial</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                Completed assigned issues appear here after approval. The released reward can be withdrawn to the wallet connected in your profile.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => router.push('/profile')}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-100"
              >
                <Wallet className="h-4 w-4" />
                Manage wallet
              </button>
              <button
                onClick={handleWithdraw}
                disabled={readyAmount === 0 || !walletAddress}
                className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
              >
                <ArrowDownToLine className="h-4 w-4" />
                Withdraw ${readyAmount.toFixed(2)}
              </button>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Ready to withdraw', value: `$${readyAmount.toFixed(2)}`, helper: `${readyApplications.length} completed issue${readyApplications.length === 1 ? '' : 's'}`, icon: ArrowDownToLine },
              { label: 'Paid to wallet', value: `$${paidAmount.toFixed(2)}`, helper: 'Already received', icon: BadgeCheck },
              { label: 'Pending applications', value: pendingApplications.length, helper: 'Applied or selected', icon: Clock },
              { label: 'Completed issues', value: releasedApplications.length, helper: 'Rewards released here', icon: GitPullRequest },
            ].map(({ label, value, helper, icon: Icon }) => (
              <div key={label} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">{label}</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-bold tracking-tight text-gray-900">{value}</div>
                <p className="mt-2 text-sm text-gray-500">{helper}</p>
              </div>
            ))}
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
              <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Released rewards</h2>
                  <p className="mt-1 text-sm text-gray-500">Only completed assigned applications create records here.</p>
                </div>
                <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">{releasedApplications.length} records</span>
              </div>

              {releasedApplications.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-20 text-center">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-white">
                    <ReceiptText className="h-7 w-7 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">No released rewards yet</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                    Apply to an issue, get selected, then mark it completed in My Applications to create a financial record.
                  </p>
                  <button
                    onClick={() => router.push(applications.length ? '/bounties/my' : '/bounties')}
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
                  >
                    <Inbox className="h-4 w-4" />
                    {applications.length ? 'Open My Applications' : 'Explore issues'}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {releasedApplications.map((application) => (
                    <div key={application.applicationId} className="rounded-lg border border-gray-200 p-4">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">{application.applicationId}</span>
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${application.status === 'paid' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
                              {application.status === 'paid' ? 'Paid to wallet' : 'Ready to withdraw'}
                            </span>
                          </div>
                          <p className="truncate text-sm font-bold text-gray-900">
                            Your ${application.reward.toFixed(2)} reward has been released for {application.title}.
                          </p>
                          <p className="mt-1 truncate text-xs text-gray-500">{application.repo}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-sm md:min-w-[360px]">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Amount</p>
                            <p className="mt-1 font-bold text-gray-900">${application.reward.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Wallet</p>
                            <p className="mt-1 font-mono font-semibold text-gray-900">{walletAddress || 'Not connected'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Status</p>
                            <p className="mt-1 font-semibold text-gray-700">{application.status === 'paid' ? 'Received' : 'Released'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-white">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Receiving wallet</h2>
                  <p className="mt-1 text-sm text-gray-500">Connected from your profile.</p>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">Primary Stellar wallet</p>
                <div className="flex items-center gap-2">
                  <span className="flex-1 truncate font-mono text-sm font-semibold text-gray-900">{walletAddress || 'No wallet connected'}</span>
                  <button onClick={handleCopy} disabled={!walletAddress} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300" aria-label="Copy wallet address">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  'Apply to a funded issue',
                  'Get selected and complete the issue',
                  'Reward appears here for withdrawal',
                ].map((step, index) => (
                  <div key={step} className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">{index + 1}</div>
                    <span className="text-sm font-semibold text-gray-800">{step}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => router.push('/profile')}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100"
              >
                {walletAddress ? 'Edit wallet in profile' : 'Connect wallet in profile'}
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 bg-gray-900 p-6 text-white shadow-sm">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Reward release flow</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-300">
                    Financial stays empty until your applied issue is selected and completed. After completion, the released dollar amount is shown here and can be withdrawn to your connected wallet.
                  </p>
                </div>
              </div>
              <div className="rounded-lg border border-white/10 p-4 md:min-w-[180px]">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Next payout</p>
                <p className="mt-2 text-2xl font-bold">${readyAmount.toFixed(2)}</p>
              </div>
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </>
  );
}
