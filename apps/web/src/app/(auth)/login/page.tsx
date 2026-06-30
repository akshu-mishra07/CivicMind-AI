'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldAlert, LogIn, Lock, Mail, AlertCircle, Sparkles, User, Shield, Briefcase } from 'lucide-react';
import { loginSchema, type LoginFormData } from '@/lib/validators';
import { loginWithEmail, loginWithGoogle } from '@/lib/firebase';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { setUser, setFirebaseToken, isAuthenticated, user, isLoading } = useAuthStore();
  const [localLoading, setLocalLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') router.push('/admin/dashboard');
      else if (user.role === 'officer') router.push('/officer/dashboard');
      else router.push('/community');
    }
  }, [isAuthenticated, user, router]);

  const onSubmit = async (data: LoginFormData) => {
    setLocalLoading(true);
    setError(null);
    try {
      await loginWithEmail(data.email, data.password);
      toast.success('Logged in successfully!');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Invalid email or password.');
      toast.error('Authentication failed.');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLocalLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      toast.success('Logged in with Google!');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google authentication failed.');
      toast.error('Google Auth failed.');
    } finally {
      setLocalLoading(false);
    }
  };

  // Mock Developer login bypass for hackathon demo evaluation
  const handleFastPass = (role: 'citizen' | 'officer' | 'admin') => {
    setLocalLoading(true);
    toast.info(`Activating demo ${role} session...`);
    
    setTimeout(() => {
      if (role === 'citizen') {
        setUser({
          _id: 'demo-citizen-id',
          firebaseUid: 'demo-citizen-uid',
          email: 'citizen@civicmind.ai',
          displayName: 'Aarav Sharma',
          role: 'citizen',
          reputationScore: 180,
          issuesReported: 5,
          issuesResolved: 0,
          isActive: true,
        });
        setFirebaseToken('mock-token-citizen');
        toast.success('Welcome back, Aarav!');
        router.push('/community');
      } else if (role === 'officer') {
        setUser({
          _id: 'demo-officer-id',
          firebaseUid: 'demo-officer-uid',
          email: 'officer@civicmind.ai',
          displayName: 'Inspector Vikram Rathore',
          role: 'officer',
          department: 'demo-dept-roads',
          reputationScore: 450,
          issuesReported: 0,
          issuesResolved: 24,
          isActive: true,
        });
        setFirebaseToken('mock-token-officer');
        toast.success('Duty active. Welcome, Inspector Vikram.');
        router.push('/officer/dashboard');
      } else if (role === 'admin') {
        setUser({
          _id: 'demo-admin-id',
          firebaseUid: 'demo-admin-uid',
          email: 'admin@civicmind.ai',
          displayName: 'Commissioner Meera Sen',
          role: 'admin',
          reputationScore: 900,
          issuesReported: 0,
          issuesResolved: 0,
          isActive: true,
        });
        setFirebaseToken('mock-token-admin');
        toast.success('Administrative portal unlocked.');
        router.push('/admin/dashboard');
      }
      setLocalLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] text-slate-800 font-sans relative px-4 py-10">
      
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Logo Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-[#0b2240] rounded-xl shadow-sm">
            <ShieldAlert className="h-6 w-6 text-white" />
          </div>
          <div className="text-left">
            <h1 className="font-extrabold text-xl tracking-tight text-[#0b2240]">
              CivicMind AI
            </h1>
            <p className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">Public Grievance System</p>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          
          <h2 className="text-lg font-extrabold mb-1 text-left text-[#0b2240]">Sign In</h2>
          <p className="text-slate-500 text-xs mb-6 text-left font-semibold uppercase">Enter details to access your civic workspace</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-700 text-xs text-left font-semibold">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-550" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="name@city.com"
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-[#2563eb]"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-[10px] font-bold mt-0.5">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-550" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-[#2563eb]"
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-[10px] font-bold mt-0.5">{errors.password.message}</p>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={localLoading || isLoading}
              className="w-full py-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold rounded-xl active:scale-98 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer shadow-md disabled:opacity-50"
            >
              {(localLoading || isLoading) ? (
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="h-4.5 w-4.5" />
                  <span>Access Workspace</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-white px-2.5 text-slate-400 font-bold">Or continue with</span>
            </div>
          </div>

          {/* Social Sign-in */}
          <button
            onClick={handleGoogleLogin}
            disabled={localLoading || isLoading}
            className="w-full py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl flex items-center justify-center gap-2.5 text-xs font-bold active:scale-98 transition-all cursor-pointer"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M21.35,11.1H12v2.7h5.38C17.15,15.22,15.73,16.7,13.8,17.4l2.12,1.65c2.61-2.41,4.12-5.95,4.12-10.15a9.54,9.54,0,0,0-.69-2.8Z" fill="#4285f4" />
              <path d="M12,20.5a8.31,8.31,0,0,0,5.77-2.1L15.65,16.75A5.25,5.25,0,0,1,12,17.7a5.3,5.3,0,0,1-5-3.69L4.82,15.7A9.09,9.09,0,0,0,12,20.5Z" fill="#34a853" />
              <path d="M7,12a5.27,5.27,0,0,1,0-1.6L4.82,8.7A9,9,0,0,0,4.82,15.3L7,13.6A5.27,5.27,0,0,1,7,12Z" fill="#fbbc05" />
              <path d="M12,6.3a5.08,5.08,0,0,1,3.61,1.4l2.7-2.7A8.77,8.77,0,0,0,12,2.5,9.09,9.09,0,0,0,4.82,7.3L7,9A5.3,5.3,0,0,1,12,6.3Z" fill="#ea4335" />
            </svg>
            <span>Sign in with Google Account</span>
          </button>

          {/* Footer Link */}
          <p className="text-center text-xs text-slate-500 mt-6 font-semibold">
            Don't have an account?{' '}
            <Link href="/signup" className="text-[#2563eb] hover:underline">
              Create citizen profile
            </Link>
          </p>
        </div>

        {/* Demo Fast Pass Panel (Government Style Bypass Selector) */}
        <div className="w-full bg-white border border-slate-200 rounded-3xl p-5 mt-6 text-left shadow-sm">
          <div className="flex items-center gap-1 text-[10px] text-indigo-600 font-extrabold uppercase tracking-wider mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Developer Sandbox Bypass</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-normal mb-4">Click below to auto-authenticate with pre-configured mock permissions.</p>
          
          <div className="grid grid-cols-3 gap-2.5">
            <button
              onClick={() => handleFastPass('citizen')}
              disabled={localLoading}
              className="py-2 px-1 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-[10px] font-bold text-slate-650 hover:text-emerald-700 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
            >
              <User className="h-4.5 w-4.5 text-slate-500 hover:text-emerald-600" />
              <span>Citizen Bypass</span>
            </button>
            
            <button
              onClick={() => handleFastPass('officer')}
              disabled={localLoading}
              className="py-2 px-1 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-[10px] font-bold text-slate-650 hover:text-blue-700 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
            >
              <Briefcase className="h-4.5 w-4.5 text-slate-500 hover:text-blue-600" />
              <span>Officer Bypass</span>
            </button>

            <button
              onClick={() => handleFastPass('admin')}
              disabled={localLoading}
              className="py-2 px-1 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-xl text-[10px] font-bold text-slate-650 hover:text-purple-700 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
            >
              <Shield className="h-4.5 w-4.5 text-slate-500 hover:text-purple-600" />
              <span>Admin Bypass</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
