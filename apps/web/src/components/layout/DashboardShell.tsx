'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  ShieldAlert, 
  Users, 
  PlusCircle, 
  FileText, 
  MessageSquare, 
  CheckSquare, 
  Map, 
  TrendingUp, 
  Sliders, 
  UserCheck, 
  Building2, 
  BarChart2,
  Menu, 
  X, 
  LogOut, 
  Bell, 
  Award,
  Trophy,
  User as UserIcon,
  ChevronDown
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

interface DashboardShellProps {
  children: React.ReactNode;
  role: 'citizen' | 'officer' | 'admin';
}

export default function DashboardShell({ children, role }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Mock Notifications for Hackathon display
  const mockNotifications = [
    { id: 1, title: 'AI Verification complete', text: 'Issue #CM-2026-0001 (Pothole) verified by Vision Agent.', time: '2 mins ago', unread: true },
    { id: 2, title: 'Repair plan generated', text: 'Planning Agent scheduled repair for Streetlight Failure.', time: '1 hour ago', unread: true },
    { id: 3, title: 'Issue Resolved', text: 'Road repair completed at Ward 5. Thank you!', time: '1 day ago', unread: false }
  ];

  const handleLogout = () => {
    logout();
    toast.success('Successfully logged out.');
    router.push('/');
  };

  // Define links based on user role
  const citizenLinks = [
    { label: 'Community Feed', href: '/community', icon: Users },
    { label: 'Report Issue', href: '/report', icon: PlusCircle },
    { label: 'My Reports', href: '/my-reports', icon: FileText },
    { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { label: 'AI Assistant', href: '/assistant', icon: MessageSquare },
  ];

  const officerLinks = [
    { label: 'Priority Dispatch Queue', href: '/officer/dashboard', icon: CheckSquare },
    { label: 'Incident Map', href: '/officer/map', icon: Map },
    { label: 'Department Analytics', href: '/officer/analytics', icon: TrendingUp },
  ];

  const adminLinks = [
    { label: 'Command Dashboard', href: '/admin/dashboard', icon: Sliders },
    { label: 'User Roles Registry', href: '/admin/users', icon: UserCheck },
    { label: 'Municipal Departments', href: '/admin/departments', icon: Building2 },
    { label: 'City Forecast Analytics', href: '/admin/analytics', icon: BarChart2 },
  ];

  const navLinks = role === 'admin' ? adminLinks : role === 'officer' ? officerLinks : citizenLinks;

  const getRoleBadgeColor = () => {
    if (role === 'admin') return 'bg-purple-50 text-purple-700 border-purple-200';
    if (role === 'officer') return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  };

  return (
    <div className="min-h-screen flex bg-[#f8fafc] text-slate-800 font-sans">
      
      {/* Desktop Sidebar (Deep Navy Blue BG) */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-[#0b2240]/10 bg-[#0b2240] shrink-0 text-slate-300">
        {/* Brand Header */}
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="p-2 bg-[#2563eb] rounded-xl shadow-md">
            <ShieldAlert className="h-5 w-5 text-white" />
          </div>
          <div className="text-left">
            <span className="font-extrabold text-lg text-white tracking-tight">
              CivicMind AI
            </span>
            <div className={`mt-1 text-[9px] font-extrabold tracking-wider uppercase px-2.5 py-0.5 border rounded-full text-center ${getRoleBadgeColor()}`}>
              {role} portal
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all group ${
                  isActive 
                    ? 'bg-[#2563eb] text-white border-l-4 border-emerald-400' 
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card & Sign Out */}
        <div className="p-4 border-t border-white/10 bg-[#091b34]">
          <div className="flex items-center gap-3 p-2 rounded-xl mb-3">
            <div className="h-9 w-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-bold text-white text-sm shrink-0">
              {user?.displayName?.[0] || 'U'}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-xs font-extrabold truncate text-white">{user?.displayName || 'Loading...'}</p>
              <div className="flex items-center gap-1 text-[10px] text-teal-400 font-bold mt-0.5">
                <Award className="h-3.5 w-3.5 shrink-0" />
                <span>{user?.reputationScore || 0} Rep Points</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-white/10 hover:bg-red-500/10 hover:border-red-400/30 text-slate-300 hover:text-red-400 text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Navbar */}
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 h-16 px-4 sm:px-6 flex items-center justify-between shadow-sm">
          {/* Mobile Menu Trigger */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 hover:bg-slate-100 rounded-xl"
            >
              <Menu className="h-6 w-6 text-slate-600" />
            </button>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-[#2563eb]" />
              <span className="font-extrabold text-sm tracking-tight text-[#0b2240]">
                CivicMind
              </span>
            </div>
          </div>

          <div className="hidden lg:block text-xs font-bold text-slate-400 uppercase tracking-wide">
            Official Municipal Grievance & Dispatch Network
          </div>

          {/* Right Header Operations */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileOpen(false);
                }}
                className="p-2 hover:bg-slate-100 rounded-xl relative cursor-pointer"
              >
                <Bell className="h-5 w-5 text-slate-500 hover:text-[#0b2240]" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full" />
              </button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-3.5 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                    <span className="font-extrabold text-xs uppercase tracking-wider text-[#0b2240]">Notifications</span>
                    <span className="text-[10px] text-slate-400 hover:text-[#2563eb] cursor-pointer font-bold">Mark all read</span>
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {mockNotifications.map((notif) => (
                      <div key={notif.id} className="p-2.5 rounded-xl hover:bg-slate-50 transition-all text-left border border-transparent hover:border-slate-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-bold ${notif.unread ? 'text-[#2563eb]' : 'text-slate-650'}`}>
                            {notif.title}
                          </span>
                          <span className="text-[9px] text-slate-400 font-semibold">{notif.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-normal">{notif.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-1.5 p-1 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                <div className="h-8 w-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[#0b2240] text-xs">
                  {user?.displayName?.[0] || 'U'}
                </div>
                <span className="hidden sm:inline text-xs font-bold text-[#0b2240]">{user?.displayName?.split(' ')[0]}</span>
                <ChevronDown className="hidden sm:inline h-3.5 w-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown Menu */}
              {profileOpen && (
                <div className="absolute right-0 mt-3.5 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50">
                  <div className="px-3.5 py-2 border-b border-slate-100 mb-1.5 text-left">
                    <p className="text-xs font-extrabold text-[#0b2240] truncate">{user?.displayName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { setProfileOpen(false); router.push('/profile'); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-xs font-bold hover:bg-slate-50 rounded-xl text-slate-700 transition-all cursor-pointer"
                  >
                    <UserIcon className="h-3.5 w-3.5 text-slate-400" />
                    <span>My Profile</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-xs font-bold hover:bg-red-50 rounded-xl text-red-650 transition-all cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5 text-slate-400" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Pages Content Container */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto relative overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay (Navy Blue BG) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-[#0b2240]/60 backdrop-blur-xs">
          <div className="w-64 bg-[#0b2240] border-r border-white/10 p-6 flex flex-col relative animate-in slide-in-from-left text-slate-300">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-xl"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>

            {/* Brand Logo */}
            <div className="flex items-center gap-3 mb-8 mt-2 text-left">
              <div className="p-2 bg-[#2563eb] rounded-xl shadow-md">
                <ShieldAlert className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-base text-white tracking-tight">
                  CivicMind AI
                </span>
                <p className="text-[9px] font-extrabold text-teal-400 mt-1 uppercase tracking-wider">{role} portal</p>
              </div>
            </div>

            {/* Nav links */}
            <nav className="flex-1 space-y-1.5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive 
                        ? 'bg-[#2563eb] text-white border-l-4 border-emerald-400' 
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5 shrink-0" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Details */}
            <div className="border-t border-white/10 pt-4 mt-auto">
              <div className="flex items-center gap-3 p-2 rounded-xl mb-3">
                <div className="h-9 w-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-bold text-white text-sm shrink-0">
                  {user?.displayName?.[0] || 'U'}
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-xs font-extrabold truncate text-white">{user?.displayName}</p>
                  <p className="text-[10px] text-teal-400 font-bold">{user?.reputationScore || 0} Rep Points</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-white/10 hover:bg-red-500/10 hover:border-red-400/30 text-xs font-bold text-red-400"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
