'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  MapPin, 
  Sparkles, 
  TrendingUp, 
  Users, 
  ChevronRight, 
  Building2, 
  Bot, 
  Layers, 
  UserCheck2,
  FileText,
  Activity,
  CheckCircle,
  Briefcase
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export default function Home() {
  const { isAuthenticated, user } = useAuthStore();

  const getDashboardLink = () => {
    if (!isAuthenticated || !user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'officer') return '/officer/dashboard';
    return '/community';
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-[#2563eb] selection:text-white overflow-x-hidden">
      
      {/* Official Government Flag Header Stripe */}
      <div className="bg-[#0b2240] text-slate-300 text-[10px] font-bold py-1.5 px-6 flex items-center justify-between border-b border-[#1e293b]">
        <span>COMMUNITY HERO PLATFORM • POWERED BY CIVICMIND AI</span>
        <span className="hidden md:inline">GOOGLE HACKATHON 2026</span>
      </div>

      {/* Primary Sticky Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#0b2240] rounded-xl">
            <ShieldAlert className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-[#0b2240]">
              CivicMind AI
            </span>
            <span className="hidden md:inline-block ml-2.5 text-[9px] font-extrabold tracking-wider bg-slate-100 border border-slate-200 text-[#0b2240] rounded-full px-2.5 py-0.5 uppercase">
              Swarm Dispatch Network
            </span>
          </div>
        </div>

        <nav className="flex items-center gap-4">
          <Link 
            href={getDashboardLink()} 
            className="text-xs font-bold text-slate-500 hover:text-[#0b2240] transition-colors uppercase tracking-wider"
          >
            Go to Portal
          </Link>
          <Link 
            href="/login" 
            className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white transition-all shadow-md"
          >
            ACCESS WORKSPACE
          </Link>
        </nav>
      </header>

      {/* Institutional Hero Section */}
      <section className="relative max-w-6xl mx-auto px-6 pt-16 pb-12 w-full text-left">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-[10px] font-bold text-emerald-700 uppercase tracking-wide">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Community Hero • Hyperlocal Problem Solver</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-[#0b2240] leading-tight tracking-tight">
              Your Community, <br />
              <span className="text-[#2563eb]">Your Voice, AI-Powered</span>
            </h1>

            <p className="text-slate-650 text-base max-w-xl leading-relaxed">
              Empowering citizens to identify, report, verify, track, and resolve community issues through collaboration, data, and intelligent AI automation. Built for transparency, accountability, and civic participation.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full sm:w-auto">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold rounded-xl shadow-md active:scale-98 transition-all text-xs"
              >
                <span>Report Public Grievance</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl active:scale-98 transition-all text-xs"
              >
                <Bot className="h-4 w-4 text-[#2563eb]" />
                <span>AI Assistant Workspace</span>
              </Link>
            </div>
          </div>

          {/* Hero Right: AI Swarm Dispatch Monitor Console */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5 text-left relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#0b2240] flex items-center gap-2">
                <Activity className="h-4.5 w-4.5 text-[#2563eb]" />
                <span>AI Swarm Dispatch Monitor</span>
              </h3>
              <span className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                Swarm Active
              </span>
            </div>

            {/* Swarm Nodes status grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'Vision Agent', status: 'Idle', load: '0%', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                { name: 'Duplicate check', status: 'Active', load: '12%', color: 'text-[#2563eb] bg-blue-50 border-blue-100' },
                { name: 'Priority Matrix', status: 'Idle', load: '0%', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                { name: 'Repair Planner', status: 'Idle', load: '0%', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' }
              ].map((node, idx) => (
                <div key={idx} className="p-3 border border-slate-100 bg-slate-50/50 rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-[#0b2240]">{node.name}</span>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-[8px] uppercase font-bold px-2 py-0.5 border rounded-full ${node.color}`}>
                      {node.status}
                    </span>
                    <span className="text-[10px] font-bold font-mono text-slate-500">{node.load}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Performance charts section */}
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-650 uppercase tracking-wider">SLA Target Resolution</span>
                  <span className="text-slate-400">94.8% SLA</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[#2563eb] transition-all" style={{ width: '94.8%' }} />
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-650 uppercase tracking-wider">Community Verification Rate</span>
                  <span className="text-slate-400">82.1% Validated</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: '82.1%' }} />
                </div>
              </div>
            </div>

            {/* Live Ticker Feed */}
            <div className="border-t border-slate-100 pt-4 space-y-2.5">
              <span className="text-[9px] uppercase font-extrabold tracking-widest text-slate-450 block">Live Network Log</span>
              
              <div className="space-y-2">
                {[
                  { text: 'Priya R. verified #CM-2026-0003 in Sector 11', time: '2m ago', color: 'bg-emerald-500' },
                  { text: 'Planning Agent generated checklist for Water Leak', time: '12m ago', color: 'bg-indigo-500' },
                  { text: 'Vision Agent classified "Pothole" severity: High', time: '14m ago', color: 'bg-[#2563eb]' }
                ].map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[10px] font-semibold leading-normal text-slate-500">
                    <span className={`h-1.5 w-1.5 rounded-full mt-1.5 flex-shrink-0 ${log.color}`}></span>
                    <span className="flex-1 truncate">{log.text}</span>
                    <span className="text-slate-400 font-bold shrink-0">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Community Impact Stats Bar */}
      <section className="bg-white border-y border-slate-200 py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-[#0b2240] mb-6 text-left">Community Impact Dashboard</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Issues Resolved', value: '487', sub: '94.8% resolution rate', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
              { label: 'Active Citizens', value: '1,240', sub: 'Contributing members', color: 'bg-blue-50 text-[#2563eb] border-blue-200' },
              { label: 'Avg Resolution', value: '18.4 hrs', sub: '12% faster this month', color: 'bg-purple-50 text-purple-700 border-purple-200' },
              { label: 'Community Verifications', value: '2,156', sub: 'Peer-validated reports', color: 'bg-amber-50 text-amber-700 border-amber-200' }
            ].map((stat, idx) => (
              <div key={idx} className={`rounded-2xl border p-5 text-left ${stat.color}`}>
                <span className="text-[9px] uppercase font-bold tracking-wider opacity-80">{stat.label}</span>
                <h3 className="text-2xl font-black mt-1">{stat.value}</h3>
                <span className="text-[10px] font-bold opacity-70">{stat.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section className="max-w-6xl mx-auto px-6 py-12 w-full text-left">
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-[#0b2240] mb-6">
          Platform Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:border-slate-350 transition-all flex flex-col justify-between">
            <div>
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl w-fit mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base mb-2 text-[#0b2240]">Report & Verify Issues</h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-6">
                Upload photos or videos of community problems. AI instantly classifies, and neighbors verify issues to boost priority.
              </p>
            </div>
            <Link href="/login" className="inline-flex items-center gap-1 text-xs font-bold text-[#2563eb] hover:underline uppercase tracking-wide">
              <span>Start Reporting</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:border-slate-350 transition-all flex flex-col justify-between">
            <div>
              <div className="p-3 bg-blue-50 text-[#2563eb] rounded-2xl w-fit mb-4">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base mb-2 text-[#0b2240]">Track & Resolve</h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-6">
                Real-time tracking from submission to resolution. AI generates repair plans, assigns departments, and monitors SLA.
              </p>
            </div>
            <Link href="/login" className="inline-flex items-center gap-1 text-xs font-bold text-[#2563eb] hover:underline uppercase tracking-wide">
              <span>Track Issues</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:border-slate-350 transition-all flex flex-col justify-between">
            <div>
              <div className="p-3 bg-purple-50 text-purple-700 rounded-2xl w-fit mb-4">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base mb-2 text-[#0b2240]">Gamification & Leaderboard</h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-6">
                Earn reputation points, unlock achievement badges, and climb the community leaderboard as you contribute to civic improvement.
              </p>
            </div>
            <Link href="/login" className="inline-flex items-center gap-1 text-xs font-bold text-[#2563eb] hover:underline uppercase tracking-wide">
              <span>View Leaderboard</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* Swarm Sequence details */}
      <section className="bg-white border-t border-slate-200 py-16 px-6">
        <div className="max-w-6xl mx-auto text-left">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-[#0b2240] mb-2">How AI Solves Community Issues</h2>
          <p className="text-xs text-slate-500 mb-10 font-semibold uppercase">Four AI agents work together to analyze, verify, prioritize, and plan repairs</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { order: 1, title: 'AI Image Analysis', desc: 'Analyzes uploaded photos/videos to automatically classify issue type and assess severity.' },
              { order: 2, title: 'Duplicate Detection', desc: 'Cross-checks nearby reports within 1km radius to prevent duplicate filings.' },
              { order: 3, title: 'Smart Prioritization', desc: 'Weighs proximity to schools, hospitals, traffic density and community votes to rank urgency.' },
              { order: 4, title: 'Resolution Planning', desc: 'Generates repair plans with cost estimates, crew requirements, and department assignments.' }
            ].map((node, index) => (
              <div key={index} className="p-5 bg-[#f8fafc] border border-slate-200 rounded-2xl space-y-3">
                <div className="h-8 w-8 rounded-lg bg-[#0b2240] text-white flex items-center justify-center font-bold text-xs">
                  {node.order}
                </div>
                <h4 className="font-bold text-sm text-[#0b2240]">{node.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{node.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-[#0b2240] text-slate-300 py-8 px-6 text-center text-xs font-bold space-y-2">
        <p>&copy; {new Date().getFullYear()} CivicMind AI — Community Hero Platform</p>
        <p className="text-slate-400 font-semibold">Built for Google Hackathon 2026 • Community Hero: Hyperlocal Problem Solver Challenge</p>
      </footer>

    </div>
  );
}
