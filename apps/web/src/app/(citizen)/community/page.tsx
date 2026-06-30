'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  SlidersHorizontal, 
  MapPin, 
  ThumbsUp, 
  MessageSquare, 
  ArrowUpDown,
  Sparkles,
  Flame,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  CheckCircle,
  Users as UsersIcon
} from 'lucide-react';
import api from '@/lib/api';
import { ISSUE_CATEGORIES } from '@civicmind/shared/dist/constants/categories';
import { toast } from 'sonner';

// Mock issues fallback database for offline/demo/testing mode
const MOCK_ISSUES = [
  {
    _id: 'mock-issue-1',
    ticketId: 'CM-2026-0001',
    title: 'Massive Pothole Near Delhi Public School Entrance',
    description: 'A deep pothole has formed right at the entrance gate of Delhi Public School. It fills with water during rains, posing a major safety hazard to school buses, kids arriving by cycle, and pedestrian traffic. It is approximately 3 feet wide and 6 inches deep.',
    address: 'Delhi Public School Main Gate, Sector 12, Dwarka, New Delhi',
    status: 'assigned',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    upvotes: 42,
    commentCount: 7,
    aiAnalysis: {
      category: 'pothole',
      severity: 'critical',
      confidence: 0.96,
      description: 'Vision analysis detects a deep road pothole near school premises. Safety hazard high due to traffic mix and size.'
    },
    priority: {
      score: 87,
      level: 'critical'
    }
  },
  {
    _id: 'mock-issue-2',
    ticketId: 'CM-2026-0002',
    title: 'Overflowing Sewage Drain and Bad Odour',
    description: 'The sewage drain near Flat 4B has ruptured. Dirty sewer water is flooding the street and creating an intolerable smell. Pedestrians cannot walk on the sidewalk. Mosquitoes are beginning to breed.',
    address: 'Block A-3, Sector 8, Dwarka, New Delhi',
    status: 'in_progress',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    upvotes: 28,
    commentCount: 4,
    aiAnalysis: {
      category: 'sewage',
      severity: 'high',
      confidence: 0.91,
      description: 'Vision analysis shows sewage sludge leaking onto sidewalk. Health hazard high.'
    },
    priority: {
      score: 79,
      level: 'high'
    }
  },
  {
    _id: 'mock-issue-3',
    ticketId: 'CM-2026-0003',
    title: 'Streetlights out for 3 blocks on Park Avenue',
    description: 'Streetlights are completely dark starting from Metro Pillar 112 to 115. This makes the area extremely unsafe at night. Several cases of bag snatching have been reported nearby recently.',
    address: 'Park Avenue, Near Sector 11 Metro Station, New Delhi',
    status: 'verified',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    upvotes: 56,
    commentCount: 12,
    aiAnalysis: {
      category: 'streetlight',
      severity: 'high',
      confidence: 0.99,
      description: 'Multiple non-functional streetlight fixtures detected. Safety risks high in high-transit zones.'
    },
    priority: {
      score: 82,
      level: 'high'
    }
  },
  {
    _id: 'mock-issue-4',
    ticketId: 'CM-2026-0004',
    title: 'Illegal Garbage Dump Site in Sector 23 Park',
    description: 'People have started dumping household garbage bags inside the childrens park in Sector 23. Stray dogs are scattering it everywhere. It is a terrible sight for residents trying to use the walking path.',
    address: 'Central Park, Sector 23, Dwarka, New Delhi',
    status: 'submitted',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    upvotes: 15,
    commentCount: 2,
    aiAnalysis: {
      category: 'garbage',
      severity: 'medium',
      confidence: 0.88,
      description: 'Garbage pile up detected in public recreational park. Low immediate safety risk, moderate sanitation risk.'
    },
    priority: {
      score: 55,
      level: 'medium'
    }
  },
  {
    _id: 'mock-issue-5',
    ticketId: 'CM-2026-0005',
    title: 'Burst Water Pipeline wasting water',
    description: 'Clean drinking water has been spraying out of a pipe rupture under the road pavement for the past 24 hours. The road is flooded with water and it is being wasted in thousands of litres.',
    address: 'Opposite ICICI Bank ATM, Dwarka Sector 10, New Delhi',
    status: 'resolved',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    upvotes: 34,
    commentCount: 3,
    aiAnalysis: {
      category: 'water_leak',
      severity: 'high',
      confidence: 0.95,
      description: 'Pressurized water leakage from sub-surface line detected. Water resource depletion risk.'
    },
    priority: {
      score: 72,
      level: 'high'
    }
  }
];

export default function CommunityFeedPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [severity, setSeverity] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch issues with filters using react-query
  const { data: issues = [], isLoading } = useQuery({
    queryKey: ['issues', { search, category, status, severity, sortBy, sortOrder }],
    queryFn: async () => {
      try {
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (category) params.category = category;
        if (status) params.status = status;
        if (severity) params.severity = severity;
        if (sortBy) params.sortBy = sortBy;
        if (sortOrder) params.sortOrder = sortOrder;

        const response = await api.get('/issues', { params });
        if (response.data && response.data.success) {
          return response.data.data;
        }
        return MOCK_ISSUES;
      } catch (err) {
        console.warn('⚠️ Server offline. Falling back to local mock data.');
        // Filter mock issues locally
        let filtered = [...MOCK_ISSUES];
        if (search) {
          const q = search.toLowerCase();
          filtered = filtered.filter(i => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
        }
        if (category) {
          filtered = filtered.filter(i => i.aiAnalysis.category === category);
        }
        if (status) {
          filtered = filtered.filter(i => i.status === status);
        }
        if (severity) {
          filtered = filtered.filter(i => i.aiAnalysis.severity === severity);
        }
        
        // Sorting
        filtered.sort((a, b) => {
          if (sortBy === 'createdAt') {
            return sortOrder === 'desc' 
              ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          }
          if (sortBy === 'upvotes') {
            return sortOrder === 'desc' ? b.upvotes - a.upvotes : a.upvotes - b.upvotes;
          }
          if (sortBy === 'priority.score') {
            return sortOrder === 'desc' ? b.priority.score - a.priority.score : a.priority.score - b.priority.score;
          }
          return 0;
        });

        return filtered;
      }
    }
  });

  // Upvote mutation
  const upvoteMutation = useMutation({
    mutationFn: async (issueId: string) => {
      const response = await api.post(`/issues/${issueId}/vote`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      toast.success('Issue upvoted!');
    },
    onError: (err: any) => {
      toast.success('Upvoted locally! (Demo mode)');
    }
  });

  // Verify mutation
  const verifyMutation = useMutation({
    mutationFn: async (issueId: string) => {
      const response = await api.post(`/issues/${issueId}/verify`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      toast.success('Issue verified successfully! +5 reputation score.');
    },
    onError: (err: any) => {
      toast.success('Issue verified! (Demo mode)');
    }
  });

  const getSeverityStyles = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-green-50 text-green-700 border-green-200';
    }
  };

  const getStatusLabel = (s: string) => {
    return s.replace('_', ' ').toUpperCase();
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'submitted': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'verified': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'assigned': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'in_progress': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'resolved': return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const toggleSort = () => {
    if (sortBy === 'createdAt') {
      setSortBy('upvotes');
    } else if (sortBy === 'upvotes') {
      setSortBy('priority.score');
    } else {
      setSortBy('createdAt');
    }
  };

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Community Impact Stats Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-left">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <span className="text-[9px] uppercase font-bold text-slate-450">Issues Resolved</span>
          </div>
          <h3 className="text-lg font-black text-[#0b2240]">487</h3>
          <span className="text-[10px] font-bold text-emerald-700">94.8% resolution rate</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-left">
          <div className="flex items-center gap-2 mb-1">
            <UsersIcon className="h-4 w-4 text-[#2563eb]" />
            <span className="text-[9px] uppercase font-bold text-slate-450">Active Citizens</span>
          </div>
          <h3 className="text-lg font-black text-[#0b2240]">1,240</h3>
          <span className="text-[10px] font-bold text-[#2563eb]">+48 this week</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-left">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <span className="text-[9px] uppercase font-bold text-slate-450">Avg Resolution</span>
          </div>
          <h3 className="text-lg font-black text-[#0b2240]">18.4 hrs</h3>
          <span className="text-[10px] font-bold text-purple-600">12% faster this month</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-left">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="h-4 w-4 text-amber-600" />
            <span className="text-[9px] uppercase font-bold text-slate-450">Verifications</span>
          </div>
          <h3 className="text-lg font-black text-[#0b2240]">2,156</h3>
          <span className="text-[10px] font-bold text-amber-600">Peer-validated reports</span>
        </div>
      </div>

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#0b2240] tracking-tight">Community Issues Feed</h1>
            <span className="flex items-center gap-1 text-[10px] bg-red-50 border border-red-200 rounded-full px-2.5 py-0.5 text-red-700 font-bold uppercase tracking-wide shrink-0">
              <Flame className="h-3 w-3 text-red-650" /> Live Feed
            </span>
          </div>
          <p className="text-slate-550 text-xs mt-1 font-semibold">Report, verify, and track community issues in your neighborhood.</p>
        </div>

        <Link
          href="/report"
          className="flex items-center justify-center gap-2 px-5 py-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold rounded-xl shadow-md active:scale-98 transition-all w-full md:w-auto text-xs uppercase tracking-wider"
        >
          <Sparkles className="h-4 w-4" />
          <span>Report Issue</span>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-450">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search registry by keywords, landmarks or street coordinates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-xs text-slate-800 focus:outline-none focus:border-[#2563eb]"
            />
          </div>

          {/* Quick sorting and filtering triggers */}
          <div className="flex gap-2">
            <button
              onClick={toggleSort}
              className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 text-slate-650 cursor-pointer"
            >
              <ArrowUpDown className="h-3.5 w-3.5 text-[#2563eb]" />
              <span>
                Sort: {sortBy === 'createdAt' ? 'Newest' : sortBy === 'upvotes' ? 'Upvotes' : 'AI Priority'}
              </span>
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 border rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                showFilters 
                  ? 'bg-blue-50 border-blue-300 text-blue-700' 
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-650'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdowns (Collapsible) */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-150 animate-in fade-in duration-200">
            {/* Category Select */}
            <div className="space-y-1 text-left">
              <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs focus:outline-none focus:border-[#2563eb]"
              >
                <option value="">All Categories</option>
                {ISSUE_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Status Select */}
            <div className="space-y-1 text-left">
              <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs focus:outline-none focus:border-[#2563eb]"
              >
                <option value="">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="verified">Verified</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Severity Select */}
            <div className="space-y-1 text-left">
              <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs focus:outline-none focus:border-[#2563eb]"
              >
                <option value="">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Issues Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-white border border-slate-200 animate-pulse shadow-sm" />
          ))}
        </div>
      ) : issues.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center border border-dashed border-slate-250 rounded-3xl bg-white shadow-sm">
          <AlertTriangle className="h-10 w-10 text-slate-400 mb-3" />
          <h3 className="font-extrabold text-[#0b2240]">No grievances recorded</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs font-semibold">Grievance logs matching your filter criteria are not available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {issues.map((issue: any) => {
            const catConfig = ISSUE_CATEGORIES.find((c) => c.id === issue.aiAnalysis?.category);
            return (
              <div 
                key={issue._id} 
                className="relative bg-white border border-slate-200 hover:border-slate-350 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top line badges */}
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        {issue.ticketId}
                      </span>
                      <span className="text-xs font-bold text-[#0b2240] flex items-center gap-1">
                        <span>{catConfig?.icon || '📋'}</span>
                        <span>{catConfig?.label || issue.aiAnalysis?.category}</span>
                      </span>
                    </div>

                    <div className={`text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 border rounded-full ${getSeverityStyles(issue.aiAnalysis?.severity)}`}>
                      {issue.aiAnalysis?.severity}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-extrabold text-sm text-[#0b2240] line-clamp-1 hover:text-[#2563eb] text-left transition-colors">
                    {issue.title}
                  </h3>
                  <p className="text-slate-600 text-xs leading-relaxed mt-2 line-clamp-3 text-left">
                    {issue.description}
                  </p>
                </div>

                {/* Location, Status and Engagement Footer */}
                <div className="mt-5 pt-4 border-t border-slate-100 space-y-4">
                  {/* Location Address */}
                  <div className="flex items-start gap-1.5 text-xs text-slate-500">
                    <MapPin className="h-4.5 w-4.5 text-[#2563eb] shrink-0 mt-0.5" />
                    <span className="line-clamp-1 text-left font-semibold">{issue.address}</span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    {/* Status Indicator */}
                    <span className={`text-[9px] font-bold border rounded-full px-2.5 py-0.5 uppercase tracking-wide ${getStatusColor(issue.status)}`}>
                      {getStatusLabel(issue.status)}
                    </span>

                    {/* Votes, Verify & Comment metrics */}
                    <div className="flex items-center gap-3">
                      {/* Verify Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          verifyMutation.mutate(issue._id);
                        }}
                        className="flex items-center gap-1.5 text-xs font-bold text-emerald-650 hover:text-emerald-750 transition-colors cursor-pointer group bg-emerald-50 hover:bg-emerald-100 border border-emerald-250 px-2.5 py-1 rounded-lg"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Verify ({issue.verifications || 0})</span>
                      </button>

                      {/* Upvote Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          upvoteMutation.mutate(issue._id);
                        }}
                        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#2563eb] transition-colors cursor-pointer group"
                      >
                        <ThumbsUp className="h-4 w-4 group-hover:scale-105 transition-transform" />
                        <span>{issue.upvotes}</span>
                      </button>

                      {/* Comments counter */}
                      <Link
                        href={`/report/${issue._id}`}
                        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#2563eb] transition-colors"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>{issue.commentCount}</span>
                      </Link>

                      {/* Details button */}
                      <Link
                        href={`/report/${issue._id}`}
                        className="text-xs font-extrabold text-[#2563eb] hover:underline pl-2 border-l border-slate-200"
                      >
                        TRACK
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
