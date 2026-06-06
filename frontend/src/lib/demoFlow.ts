'use client';

export type DemoApplicationStatus = 'applied' | 'selected' | 'completed' | 'paid';

export type DemoBounty = {
  id: string;
  title: string;
  repo: string;
  label: string;
  stack: string;
  reward: number;
  applicants: number;
  posted: string;
  description: string;
};

export type DemoApplication = DemoBounty & {
  applicationId: string;
  status: DemoApplicationStatus;
  appliedAt: string;
  completedAt?: string;
};

export const DEMO_APPLICATIONS_KEY = 'dv_demo_applications';
export const DEMO_WALLET_KEY = 'dv_demo_wallet';

export const demoBounties: DemoBounty[] = [
  {
    id: 'dv-wallet-copy-state',
    title: 'Fix wallet copy state',
    repo: 'dealvault/platform',
    label: 'bug',
    stack: 'TypeScript',
    reward: 2,
    applicants: 0,
    posted: 'Today',
    description: 'Improve the wallet address copy button so contributors get clear copied feedback.',
  },
  {
    id: 'dv-empty-issues-state',
    title: 'Add empty state for issues',
    repo: 'dealvault/frontend',
    label: 'good first issue',
    stack: 'React',
    reward: 5,
    applicants: 1,
    posted: 'Jun 04',
    description: 'Design the empty state shown when there are no funded issues available.',
  },
];

export function readDemoApplications(): DemoApplication[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(DEMO_APPLICATIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DemoApplication[];
  } catch {
    return [];
  }
}

export function writeDemoApplications(applications: DemoApplication[]) {
  window.localStorage.setItem(DEMO_APPLICATIONS_KEY, JSON.stringify(applications));
}

export function applyToDemoBounty(bounty: DemoBounty) {
  const applications = readDemoApplications();
  if (applications.some((application) => application.id === bounty.id)) return applications;

  const nextApplications: DemoApplication[] = [
    {
      ...bounty,
      applicationId: `Application #${String(applications.length + 1042).padStart(4, '0')}`,
      status: 'applied',
      appliedAt: new Date().toISOString(),
    },
    ...applications,
  ];

  writeDemoApplications(nextApplications);
  return nextApplications;
}

export function updateDemoApplicationStatus(id: string, status: DemoApplicationStatus) {
  const applications = readDemoApplications();
  const nextApplications = applications.map((application) => (
    application.id === id
      ? {
          ...application,
          status,
          completedAt: status === 'completed' || status === 'paid' ? new Date().toISOString() : application.completedAt,
        }
      : application
  ));

  writeDemoApplications(nextApplications);
  return nextApplications;
}

export function readDemoWallet() {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(DEMO_WALLET_KEY) || '';
}

export function writeDemoWallet(walletAddress: string) {
  if (walletAddress) {
    window.localStorage.setItem(DEMO_WALLET_KEY, walletAddress);
  } else {
    window.localStorage.removeItem(DEMO_WALLET_KEY);
  }
}
