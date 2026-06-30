'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { 
  CheckSquare, 
  MapPin, 
  TrendingUp, 
  AlertOctagon, 
  ArrowUpRight, 
  Users, 
  CheckCircle, 
  Clock, 
  ShieldAlert,
  Flame
} from 'lucide-react';
import api from '@/lib/api';
import { ISSUE_CATEGORIES } from '@civicmind/shared/dist/constants/categories';

// Mock Officer Assigned Priority Queue fallback data
const MOCK_OFFICER_ISSUES = [
  {
    _id: 'mock-issue-1',
    ticketId: 'CM-2026-0001',
    title: 'Massive Pothole Near Delhi Public School Entrance',
    description: 'A deep pothole has formed right at the entrance gate of Delhi Public School. It fills with water during rains, posing a safety hazard.',
    address: 'Delhi Public School Main Gate, Dwarka, New Delhi',
    status: 'assigned',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    upvotes: 42,
    aiAnalysis: {
      category: 'pothole',
      severity: 'critical'
    },
    priority: {
      score: 87,
      level: 'critical',
      reasoning: 'Critical severity pothole situated near high traffic school entrance corridor.'
    }
  },
  {
    _id: 'mock-issue-3',
    ticketId: 'CM-2026-0003',
    title: 'Streetlights out for 3 blocks on Park Avenue',
    description: 'Streetlights are completely dark starting from Metro Pillar 112 to 115. Snatching incident reported.',
    address: 'Park Avenue, Near Sector 11 Metro Station, New Delhi',
    status: 'verified',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    upvotes: 56,
    aiAnalysis: {
      category: 'streetlight',
      severity: 'high'
    },
    priority: {
      score: 82,
      level: 'high',
      reasoning: 'Fixtures failure reported in dark municipal pathway, increasing safety vulnerability.'
    }
  },
  {
    _id: 'mock-issue-2',
    ticketId: 'CM-2026-0002',
    title: 'Overflowing Sewage Drain and Rupture',
    description: 'The sewage drain near Flat 4B has ruptured. Dirty water flooding the street.',
    address: 'Block A-3, Sector 8, Dwarka, New Delhi',
    status: 'in_progress',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    upvotes: 28,
    aiAnalysis: {
      category: 'sewage',
      severity: 'high'
    },
    priority: {
      score: 79,
      level: 'high',
      reasoning: 'Biological wastewater leakage posing community sanitation hazard.'
    }
  }
];

export default function OfficerDashboardPage() {
  const [filterCategory, setFilterCategory] = useState('');

  const { data: issues = [], isLoading } = useQuery({
    queryKey: ['officer-issues'],
    queryFn: async () => {
      try {
        const response = await api.get('/issues/assigned');
        if (response.data && response.data.success) {
          return response.data.data;
        }
        return MOCK_OFFICER_ISSUES;
      } catch (err) {
        console.warn('⚠️ Central server offline. Displaying department priority queue fallback.');
        return MOCK_OFFICER_ISSUES;
      }
    }
  });

  const getSeverityStyles = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-50 text-red-700 border-red-200';
      case 'high': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-green-50 text-green-700 border-green-200';
    }
  };

  const getPriorityScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-700 border-red-200 bg-red-50';
    if (score >= 60) return 'text-orange-700 border-orange-200 bg-orange-50';
    return 'text-amber-700 border-amber-200 bg-amber-50';
  };

  const displayedIssues = filterCategory 
    ? issues.filter((i: any) => i.aiAnalysis?.category === filterCategory)
    : issues;

  const sortedIssues = [...displayedIssues].sort((a: any, b: any) => 
    (b.priority?.score || 0) - (a.priority?.score || 0)
  );

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Officer Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="text-left">
          <h1 className="text-2xl font-black text-[#0b2240] tracking-tight">Priority Grievance Dispatch Queue</h1>
          <p className="text-slate-550 text-xs mt-1 font-semibold">Review AI prioritized community incidents, generate mobilization tasks, and track resolution.</p>
        </div>

        <div className="text-xs font-bold text-[#2563eb] bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 flex items-center gap-2 uppercase tracking-wide shrink-0">
          <Clock className="h-4 w-4 animate-pulse text-[#2563eb]" />
          <span>Active Shift: 08:00 - 17:00</span>
        </div>
      </div>

      {/* Stats Counters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs text-left">
          <span className="text-[9px] uppercase font-bold text-slate-450">Assigned In Queue</span>
          <h3 className="text-xl font-black mt-1 text-[#0b2240]">{issues.length} Issues</h3>
          <div className="flex items-center gap-1.5 text-[10px] text-red-700 font-bold uppercase mt-1">
            <AlertOctagon className="h-3.5 w-3.5" />
            <span>2 Critical Items</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs text-left">
          <span className="text-[9px] uppercase font-bold text-slate-450">Active Repairs</span>
          <h3 className="text-xl font-black mt-1 text-[#0b2240]">1 In Progress</h3>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-bold uppercase mt-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Team Dispatched</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs text-left">
          <span className="text-[9px] uppercase font-bold text-slate-450">Resolved This Month</span>
          <h3 className="text-xl font-black mt-1 text-[#0b2240]">24 Tickets</h3>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-bold uppercase mt-1">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>Avg: 18.4 hrs</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs text-left">
          <span className="text-[9px] uppercase font-bold text-slate-450">SLA Rating Index</span>
          <h3 className="text-xl font-black mt-1 text-[#0b2240]">92% SLA</h3>
          <div className="flex items-center gap-1.5 text-[10px] text-[#2563eb] font-bold uppercase mt-1">
            <Users className="h-3.5 w-3.5" />
            <span>Rank 1st in Zone</span>
          </div>
        </div>
      </div>

      {/* Main Layout split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Priority Incident Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-base font-extrabold text-[#0b2240] flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-[#2563eb]" />
              <span>Prioritized Grievances</span>
            </h2>

            {/* Quick Category Filter Selector */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-500 focus:outline-none focus:border-[#2563eb]"
            >
              <option value="">All Categories</option>
              {ISSUE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Incidents List Cards */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-40 rounded-3xl bg-white border border-slate-200 animate-pulse shadow-sm" />
              ))}
            </div>
          ) : sortedIssues.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-200 rounded-3xl text-slate-500 text-xs bg-white shadow-sm">
              No issues matching current parameters.
            </div>
          ) : (
            <div className="space-y-4">
              {sortedIssues.map((issue: any) => {
                const catConfig = ISSUE_CATEGORIES.find((c) => c.id === issue.aiAnalysis?.category);
                return (
                  <div 
                    key={issue._id}
                    className="bg-white border border-slate-200 hover:border-slate-350 rounded-3xl p-5 shadow-xs hover:shadow-sm transition-all flex flex-col sm:flex-row gap-4 items-start justify-between text-left"
                  >
                    <div className="space-y-2 flex-1 min-w-0">
                      {/* Badge line */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Priority Score Shield */}
                        <div className={`text-[9px] font-mono font-bold px-2 py-0.5 border rounded flex items-center gap-1 ${getPriorityScoreColor(issue.priority?.score || 50)}`}>
                          <Flame className="h-3.5 w-3.5 text-red-500 animate-pulse" />
                          <span>AI Urgency: {issue.priority?.score || 50}</span>
                        </div>
                        {/* Category Badge */}
                        <span className="text-xs font-bold text-[#0b2240] flex items-center gap-1">
                          <span>{catConfig?.icon || '📋'}</span>
                          <span>{catConfig?.label || issue.aiAnalysis?.category}</span>
                        </span>
                        {/* Severity */}
                        <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 border rounded-full ${getSeverityStyles(issue.aiAnalysis?.severity)}`}>
                          {issue.aiAnalysis?.severity}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-extrabold text-sm text-[#0b2240] truncate">{issue.title}</h3>
                      
                      {/* Dispatch target Address */}
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                        <MapPin className="h-3.5 w-3.5 text-[#2563eb]" />
                        <span className="truncate max-w-md font-semibold">{issue.address}</span>
                      </div>
                    </div>

                    {/* Dispatch Link CTA */}
                    <Link
                      href={`/officer/issues/${issue._id}`}
                      className="w-full sm:w-auto px-4 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold rounded-xl text-xs active:scale-98 transition-all flex items-center justify-center gap-1 shrink-0 shadow-sm uppercase tracking-wide"
                    >
                      <span>Examine Plan</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Visual Charts & Analytics */}
        <div className="space-y-6">
          {/* Department Performance Panel */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 text-left">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#0b2240] border-b border-slate-50 pb-2">Department Workloads</h3>
            
            <div className="space-y-3.5 pt-2">
              {[
                { name: 'Roads & Infrastructure', count: 8, color: 'bg-red-500', percentage: '80%' },
                { name: 'Sanitation & Waste', count: 4, color: 'bg-orange-500', percentage: '40%' },
                { name: 'Electrical Grid', count: 3, color: 'bg-yellow-500', percentage: '30%' },
                { name: 'Water Distribution', count: 2, color: 'bg-blue-500', percentage: '20%' }
              ].map((workload, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-650">{workload.name}</span>
                    <span className="text-slate-450">{workload.count} cases</span>
                  </div>
                  <div className="bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${workload.color} transition-all`} 
                      style={{ width: workload.percentage }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Prioritization factors breakdown Info Card */}
          <div className="bg-blue-50/45 border border-blue-200 rounded-3xl p-5 space-y-3 text-left shadow-xs">
            <div className="flex items-center gap-2 text-xs text-[#0b2240] font-extrabold uppercase tracking-wide">
              <ShieldAlert className="h-4.5 w-4.5 text-[#2563eb]" />
              <span>Prioritization Matrix</span>
            </div>
            <p className="text-[10px] text-slate-550 leading-relaxed font-semibold">
              The AI dispatch engine calculates incident scores utilizing multimodal parameters:
            </p>
            <ul className="text-[10px] text-slate-500 space-y-1.5 pl-2 list-disc font-semibold">
              <li><span className="text-slate-700">Severity Match (25%):</span> Derived from Vision Agent pixels.</li>
              <li><span className="text-slate-700">Proximity Matches (27%):</span> Distance to Schools/Hospitals.</li>
              <li><span className="text-slate-700">Traffic Density (12%):</span> Sourced from Maps live layers.</li>
              <li><span className="text-slate-700">Community Support (10%):</span> Aggregated citizen upvotes.</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
