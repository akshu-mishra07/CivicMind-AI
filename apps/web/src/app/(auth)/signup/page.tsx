'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldAlert, UserPlus, Lock, Mail, AlertCircle, Phone, User } from 'lucide-react';
import { signupSchema, type SignupFormData } from '@/lib/validators';
import { signupWithEmail, loginWithGoogle } from '@/lib/firebase';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user, isLoading, setUser, setFirebaseToken } = useAuthStore();
  const [localLoading, setLocalLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') router.push('/admin/dashboard');
      else if (user.role === 'officer') router.push('/officer/dashboard');
      else router.push('/community');
    }
  }, [isAuthenticated, user, router]);

  const onSubmit = async (data: SignupFormData) => {
    setLocalLoading(true);
    setError(null);
    try {
      // 1. Create user in Firebase Auth
      const firebaseUser = await signupWithEmail(data.email, data.password);
      const token = await firebaseUser.getIdToken(true);
      setFirebaseToken(token);

      // 2. Synchronize user in MongoDB via our API
      const response = await api.post('/auth/register', {
        firebaseUid: firebaseUser.uid,
        email: data.email,
        displayName: data.displayName,
        phone: data.phone || undefined,
        role: 'citizen',
      });

      if (response.data && response.data.success) {
        setUser(response.data.data);
        toast.success('Registration successful! Welcome to CivicMind.');
        router.push('/community');
      } else {
        throw new Error('Failed to register profile on central server.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during sign up.');
      toast.error('Signup failed.');
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
      setError(err.message || 'Google signup failed.');
      toast.error('Google Auth failed.');
    } finally {
      setLocalLoading(false);
    }
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

        {/* Main Card */}
        <div className="w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          
          <h2 className="text-lg font-extrabold mb-1 text-left text-[#0b2240]">Create Citizen Account</h2>
          <p className="text-slate-500 text-xs mb-6 text-left font-semibold uppercase">Register to file public infrastructure grievances</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-700 text-xs text-left font-semibold">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-550" htmlFor="displayName">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  id="displayName"
                  type="text"
                  placeholder="Rahul Verma"
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-[#2563eb]"
                  {...register('displayName')}
                />
              </div>
              {errors.displayName && (
                <p className="text-red-500 text-[10px] font-bold mt-0.5">{errors.displayName.message}</p>
              )}
            </div>

            {/* Email Address */}
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

            {/* Phone (Optional) */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-550" htmlFor="phone">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-[#2563eb]"
                  {...register('phone')}
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-[10px] font-bold mt-0.5">{errors.phone.message}</p>
              )}
            </div>

            {/* Password */}
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

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-550" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-[#2563eb]"
                  {...register('confirmPassword')}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-[10px] font-bold mt-0.5">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={localLoading || isLoading}
              className="w-full py-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold rounded-xl active:scale-98 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer shadow-md disabled:opacity-50"
            >
              {(localLoading || isLoading) ? (
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="h-4.5 w-4.5" />
                  <span>Register Profile</span>
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
              <span className="bg-white px-2.5 text-slate-400 font-bold">Or sign up with</span>
            </div>
          </div>

          {/* Google Sign-in */}
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
            <span>Sign up with Google Account</span>
          </button>

          {/* Footer Link */}
          <p className="text-center text-xs text-slate-500 mt-6 font-semibold">
            Already have an account?{' '}
            <Link href="/login" className="text-[#2563eb] hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
