import { create } from 'zustand';

import * as authApi from '@/api/auth/auth.api';
import { registerRefreshHandler } from '@/api/client/refresh-manager';
import type { User } from '@/api/users/users.types';

import { session } from './session';

export type AuthStatus = 'idle' | 'bootstrapping' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: User | null;
  permissions: string[];
  status: AuthStatus;

  /** Stores user + permissions and mirrors the access token into the in-memory session. */
  setSession: (params: { user: User; permissions: string[]; accessToken: string }) => void;
  /** Clears all session state (token, user, permissions) and marks unauthenticated. */
  clearSession: () => void;

  /** App-boot recovery: refresh → me. Resolves to whether a session was recovered. */
  bootstrap: () => Promise<boolean>;
  /** Email/password login → token + user + live permissions. */
  login: (email: string, password: string) => Promise<void>;
  /** Best-effort backend logout, then local clear. */
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  permissions: [],
  status: 'idle',

  setSession: ({ user, permissions, accessToken }) => {
    session.setAccessToken(accessToken);
    set({ user, permissions, status: 'authenticated' });
  },

  clearSession: () => {
    session.clear();
    set({ user: null, permissions: [], status: 'unauthenticated' });
  },

  bootstrap: async () => {
    set({ status: 'bootstrapping' });
    try {
      const { accessToken } = await authApi.refresh();
      session.setAccessToken(accessToken);
      const { user, permissions } = await authApi.me();
      set({ user, permissions, status: 'authenticated' });
      return true;
    } catch {
      session.clear();
      set({ user: null, permissions: [], status: 'unauthenticated' });
      return false;
    }
  },

  login: async (email, password) => {
    const { accessToken } = await authApi.login({ email, password });
    session.setAccessToken(accessToken);
    // Fetch live permissions rather than trusting the login payload.
    const { user, permissions } = await authApi.me();
    set({ user, permissions, status: 'authenticated' });
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network/logout errors — we clear locally regardless.
    }
    session.clear();
    set({ user: null, permissions: [], status: 'unauthenticated' });
  },
}));

// ── Wire the HTTP layer to the store (registered once at module load) ────────

// Single-flight refresh implementation used by the Axios 401 interceptor.
registerRefreshHandler(async () => {
  const { accessToken } = await authApi.refresh();
  session.setAccessToken(accessToken);
  return accessToken;
});

// Terminal refresh failure → drop the session so guards redirect to login.
session.setOnUnauthenticated(() => {
  useAuthStore.getState().clearSession();
});
