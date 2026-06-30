'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthChange, getIdToken } from '../lib/firebase';
import { useAuthStore } from '../stores/authStore';
import api from '../lib/api';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setFirebaseToken, setLoading, logout, user, isAuthenticated, isLoading, isHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isHydrated) return;

    setLoading(true);

    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken(true);
          setFirebaseToken(token);

          // Fetch MongoDB user profile
          const response = await api.get('/auth/me');
          if (response.data && response.data.success) {
            setUser(response.data.data);
          } else {
            // User exists in Firebase but not in MongoDB yet, try auto-register
            const registerRes = await api.post('/auth/register', {
              firebaseUid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Citizen',
            });
            if (registerRes.data && registerRes.data.success) {
              setUser(registerRes.data.data);
            } else {
              throw new Error('Registration failed');
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Auto fallback mock user for local testing if server or firebase config fails in local dev
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ Server unreachable. Activating local mock citizen session.');
            setUser({
              _id: 'mock-citizen-123',
              firebaseUid: firebaseUser.uid,
              email: firebaseUser.email || 'mock@civicmind.ai',
              displayName: firebaseUser.displayName || 'Mock Citizen',
              role: 'citizen',
              reputationScore: 120,
              issuesReported: 3,
              issuesResolved: 0,
              isActive: true,
            });
          } else {
            logout();
          }
        } finally {
          setLoading(false);
        }
      } else {
        logout();
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [isHydrated, setUser, setFirebaseToken, setLoading, logout]);

  // Handle route guards based on roles
  useEffect(() => {
    if (isLoading || !isHydrated) return;

    const isAuthRoute = pathname?.startsWith('/login') || pathname?.startsWith('/signup');
    const isCitizenRoute = pathname?.startsWith('/report') || pathname?.startsWith('/my-reports') || pathname?.startsWith('/assistant') || pathname?.startsWith('/community');
    const isOfficerRoute = pathname?.startsWith('/officer');
    const isAdminRoute = pathname?.startsWith('/admin');

    if (!isAuthenticated) {
      // Redirect to login if trying to access protected routes
      if (isCitizenRoute || isOfficerRoute || isAdminRoute) {
        router.push('/login');
      }
    } else if (user) {
      // If authenticated, redirect auth pages to correct dashboard
      if (isAuthRoute) {
        if (user.role === 'admin') router.push('/admin/dashboard');
        else if (user.role === 'officer') router.push('/officer/dashboard');
        else router.push('/community');
      }

      // Check role permissions
      if (isOfficerRoute && user.role !== 'officer' && user.role !== 'admin') {
        router.push('/community'); // Citizens can't access officer space
      }
      if (isAdminRoute && user.role !== 'admin') {
        router.push('/community'); // Non-admins can't access admin console
      }
    }
  }, [isAuthenticated, user, isLoading, isHydrated, pathname, router]);

  return <>{children}</>;
}
