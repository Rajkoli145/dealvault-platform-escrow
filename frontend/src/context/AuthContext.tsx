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
  token: string | null;
  isLoading: boolean;
  loginWithToken: (jwt: string) => void;
  logout: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Decode a JWT payload without verifying the signature (client-side display only). */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

const TOKEN_KEY = 'dv_token';
const API_BASE  = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken]     = useState<string | null>(null);
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /** Fetch the full user profile from /api/auth/me using the stored token. */
  const fetchMe = useCallback(async (jwt: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (!res.ok) throw new Error('Unauthorised');
      const data = await res.json();
      setUser(data.data.user as AuthUser);
    } catch {
      // Token invalid / expired — clear everything
      sessionStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    }
  }, []);

  /** Called from AuthCallback page after GitHub redirects back with ?token= */
  const loginWithToken = useCallback(
    (jwt: string) => {
      sessionStorage.setItem(TOKEN_KEY, jwt);
      setToken(jwt);
      fetchMe(jwt);
    },
    [fetchMe]
  );

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // On mount: restore session from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem(TOKEN_KEY);
    if (stored) {
      // Quick expiry check via payload before hitting the server
      const payload = decodeJwtPayload(stored);
      const isExpired = payload?.exp ? (payload.exp as number) * 1000 < Date.now() : false;

      if (isExpired) {
        sessionStorage.removeItem(TOKEN_KEY);
        setIsLoading(false);
      } else {
        setToken(stored);
        fetchMe(stored).finally(() => setIsLoading(false));
      }
    } else {
      setIsLoading(false);
    }
  }, [fetchMe]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, loginWithToken, logout }}>
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
