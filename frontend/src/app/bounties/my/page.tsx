'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowDownToLine,
  BadgeCheck,
  Check,
  Clock,
  GitBranch,
  Inbox,
  Send,
  Wallet,
} from 'lucide-react';
import AppNavBar from '../../../components/AppNavBar';
import Footer from '../../../components/Footer';
import { useAuth } from '../../../context/AuthContext';
import {
  DemoApplication,
  readDemoApplications,
  updateDemoApplicationStatus,
} from '../../../lib/demoFlow';

const statusCopy = {
  applied: {
    label: 'Applied',
    helper: 'Waiting for selection',
    icon: Send,
  },
  selected: {
    label: 'Selected',
    helper: 'Work can begin',
    icon: BadgeCheck,
  },
  completed: {
    label: 'Completed',
    helper: 'Reward ready on Financial',
    icon: Check,
  },
  paid: {
    label: 'Paid',
    helper: 'Reward sent to wallet',
    icon: ArrowDownToLine,
  },
};

export default function MyApplicationsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<DemoApplication[]>([]);

  useEffect(() => {
    if (!isLoading && !user) router.replace('/');
  }, [isLoading, router, user]);

  useEffect(() => {
    setApplications(readDemoApplications());
  }, []);

  const updateStatus = (id: string, status: DemoApplication['status']) => {
    setApplications(updateDemoApplicationStatus(id, status));
  };

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

  return (
    <>
      <AppNavBar />
      <div className="min-h-screen bg-gray-50 pt-20">
        <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8">
          <section className="flex flex-col gap-5 border-b border-gray-200 pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-600">
                <Inbox className="h-3.5 w-3.5" />
                Applied issues
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">My Applications</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                Issues you apply to from Explore appear here. When an application is selected and completed, its reward moves to Financial.
              </p>
            </div>
            <button
              onClick={() => router.push('/bounties')}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
            >
              <GitBranch className="h-4 w-4" />
              Explore issues
            </button>
          </section>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { label: 'Applied', value: applications.length, helper: 'Submitted by you', icon: Inbox },
              { label: 'Selected', value: applications.filter((app) => app.status === 'selected').length, helper: 'Ready for work', icon: BadgeCheck },
              { label: 'Completed', value: applications.filter((app) => app.status === 'completed' || app.status === 'paid').length, helper: 'Visible on Financial', icon: Check },
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

          {applications.length === 0 ? (
            <section className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white py-24 text-center">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-gray-100">
                <Inbox className="h-7 w-7 text-gray-400" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">No applications yet</h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                Apply to a funded issue from Explore and it will show here.
              </p>
              <button
                onClick={() => router.push('/bounties')}
                className="mt-5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
              >
                Find an issue
              </button>
            </section>
          ) : (
            <section className="space-y-4">
              {applications.map((application) => {
                const status = statusCopy[application.status];
                const StatusIcon = status.icon;

                return (
                  <div key={application.id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">{application.applicationId}</span>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white">
                            <StatusIcon className="h-3.5 w-3.5" />
                            {status.label}
                          </span>
                          <span className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600">${application.reward.toFixed(2)} reward</span>
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">{application.title}</h2>
                        <p className="mt-1 text-sm text-gray-500">{application.repo}</p>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">{status.helper}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {/* Maintainer actions like 'Mark selected' and 'Mark completed' have been removed from the contributor view */}
                        {(application.status === 'completed' || application.status === 'paid') && (
                          <button
                            onClick={() => router.push('/financial')}
                            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
                          >
                            <Wallet className="h-4 w-4" />
                            View reward
                          </button>
                        )}
                        {application.status === 'selected' && (
                          <div className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-600">
                            <Clock className="h-4 w-4" />
                            Financial pending
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
}
