// ============================================
// ZUSTAND AUTH STORE
// ============================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserData {
  _id: string;
  firebaseUid: string;
  email: string;
  displayName: string;
  phone?: string;
  avatarUrl?: string;
  role: 'citizen' | 'officer' | 'admin';
  department?: string;
  reputationScore: number;
  issuesReported: number;
  issuesResolved: number;
  isActive: boolean;
}

interface AuthState {
  user: UserData | null;
  firebaseToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;

  setUser: (user: UserData | null) => void;
  setFirebaseToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      firebaseToken: null,
      isAuthenticated: false,
      isLoading: true,
      isHydrated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      setFirebaseToken: (token) =>
        set({ firebaseToken: token }),

      setLoading: (loading) =>
        set({ isLoading: loading }),

      setHydrated: (hydrated) =>
        set({ isHydrated: hydrated }),

      logout: () =>
        set({
          user: null,
          firebaseToken: null,
          isAuthenticated: false,
          isLoading: false,
        }),
    }),
    {
      name: 'civicmind-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
