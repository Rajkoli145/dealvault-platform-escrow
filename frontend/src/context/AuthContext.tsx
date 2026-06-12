'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  githubUsername: string | null;
  githubAvatar: string | null;
  accountStatus: string;
  bio: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  portfolioUrl: string | null;
  walletAddress?: string | null;
  createdAt?: string;
  followers?: number;
  following?: number;
  kyc?: {
    status: string;
    submittedAt?: string;
    reviewedAt?: string;
    verifiedAt?: string;
    reviewNote?: string;
  };
}

interface AuthContextValue {
  user: AuthUser | null;
  /**
   * In-memory access token, only present right after an email/password login that
   * returns a token in the response body. It is NOT persisted and is null after a
   * refresh — the httpOnly `jwt` cookie is the durable session. Treat as optional.
   */
  token: string | null;
  isLoading: boolean;
  /** Email/password login path: stores the body token in memory and loads the user. */
  loginWithToken: (jwt: string) => void;
  /** Re-fetch the session from the httpOnly cookie (used after OAuth callback). */
  refreshSession: () => Promise<void>;
  logout: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Helpers ──────────────────────────────────────────────────────────────────

// SECURITY: The JWT now lives in an httpOnly cookie set by the backend OAuth callback;
// JS cannot (and must not) read it. Auth state is derived solely from /auth/me, which
// is called with credentials:'include' so the cookie rides along.
//
// LOCAL DEV NOTE: a cross-origin cookie is only sent on XHR when SameSite=None+Secure
// over HTTPS. With the frontend on :3000 and the API on :5000 over plain http, the
// cookie will NOT be sent to /auth/me. For local dev, serve the frontend and API
// SAME-ORIGIN behind a proxy (e.g. Next rewrites or nginx) so NEXT_PUBLIC_API_URL is a
// same-origin path. Otherwise OAuth sessions won't establish in dev.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken]     = useState<string | null>(null);
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load the user from /auth/me. Sends the httpOnly cookie (credentials:'include');
   * also sends a Bearer header when an in-memory token exists (email-login path).
   */
  const fetchMe = useCallback(async (jwt?: string | null) => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        credentials: 'include', // SECURITY: send the httpOnly jwt cookie
        headers: jwt ? { Authorization: `Bearer ${jwt}` } : undefined,
      });
      if (!res.ok) throw new Error('Unauthorised');
      const data = await res.json();
      setUser(data.data.user as AuthUser);
    } catch {
      // Not authenticated (no/expired cookie or token)
      setToken(null);
      setUser(null);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    await fetchMe();
  }, [fetchMe]);

  /** Email/password login: keep the body token in memory (not persisted) + load user. */
  const loginWithToken = useCallback(
    (jwt: string) => {
      setToken(jwt);
      fetchMe(jwt);
    },
    [fetchMe]
  );

  const logout = useCallback(async () => {
    try {
      // SECURITY: Clear the httpOnly cookie server-side; JS cannot delete it directly.
      await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch {
      /* ignore network errors on logout */
    }
    setToken(null);
    setUser(null);
  }, []);

  // On mount: establish session from the httpOnly cookie (no storage read).
  useEffect(() => {
    fetchMe().finally(() => setIsLoading(false));
  }, [fetchMe]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, loginWithToken, refreshSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
