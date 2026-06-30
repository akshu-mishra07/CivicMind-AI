'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  CheckCircle, 
  MessageSquare, 
  Brain,
  ShieldCheck,
  Send,
  User,
  Wrench
} from 'lucide-react';
import api from '@/lib/api';
import { ISSUE_CATEGORIES } from '@civicmind/shared/dist/constants/categories';
import { toast } from 'sonner';

// Mock detailed issue tracking data fallback database
const MOCK_ISSUE_DETAILS: Record<string, any> = {
  'mock-issue-1': {
    _id: 'mock-issue-1',
    ticketId: 'CM-2026-0001',
    title: 'Massive Pothole Near Delhi Public School Entrance',
    description: 'A deep pothole has formed right at the entrance gate of Delhi Public School. It fills with water during rains, posing a major safety hazard to school buses, kids arriving by cycle, and pedestrian traffic. It is approximately 3 feet wide and 6 inches deep.',
    address: 'Delhi Public School Main Gate, Dwarka, New Delhi',
    status: 'assigned',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    aiAnalysis: {
      category: 'pothole',
      severity: 'critical',
      confidence: 0.96,
      suggestions: ['Establish warning cones', 'Apply temporary asphalt fill', 'Conduct stormwater pipe check']
    },
    priority: {
      score: 87,
      level: 'critical'
    },
    repairPlan: {
      plan: {
        summary: 'Standard deep pothole repair requiring debris excavation, gravel sub-base reinforcement, asphalt pouring, and thermal sealing to withstand heavy bus loads.',
        steps: [
          { order: 1, description: 'Excavate loose asphalt and mud from affected subgrade area', estimatedDuration: '2 hours', status: 'completed' },
          { order: 2, description: 'Fill foundation core with compacted aggregate gravel mix', estimatedDuration: '1.5 hours', status: 'completed' },
          { order: 3, description: 'Pour hot-mix bitumen binder course and level with grade', estimatedDuration: '2.5 hours', status: 'pending' },
          { order: 4, description: 'Apply thermal surface sealer coating to edges and compact', estimatedDuration: '1 hour', status: 'pending' }
        ]
      }
    },
    comments: [
      { id: 'c1', authorName: 'System Agent Swarm', isOfficial: true, isAIGenerated: true, text: 'Ticket successfully ingested. Vision analysis categorised this as Pothole (critical severity).', time: '3 days ago' },
      { id: 'c2', authorName: 'Inspector Vikram Rathore', isOfficial: true, isAIGenerated: false, text: 'Roads crew scheduled to dispatch hot-bitumen course on Monday morning. Road lanes will be partially closed.', time: '1 day ago' }
    ]
  },
  'mock-issue-2': {
    _id: 'mock-issue-2',
    ticketId: 'CM-2026-0002',
    title: 'Overflowing Sewage Drain and Rupture',
    description: 'The sewage drain near Flat 4B has ruptured. Dirty water flooding the street.',
    address: 'Block A-3, Sector 8, Dwarka, New Delhi',
    status: 'in_progress',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    aiAnalysis: {
      category: 'sewage',
      severity: 'high',
      confidence: 0.91,
      suggestions: ['Dispatch vacuum trucks', 'Replace segment joints']
    },
    priority: {
      score: 79,
      level: 'high'
    },
    repairPlan: {
      plan: {
        summary: 'Expose damaged coupling joint, pump sewage leakage blocks, install new high-pressure collar joints.',
        steps: [
          { order: 1, description: 'Pump surface sewage blocks out', estimatedDuration: '3 hours', status: 'completed' },
          { order: 2, description: 'Cut ruptured pipeline collar out', estimatedDuration: '2 hours', status: 'in_progress' }
        ]
      }
    },
    comments: [
      { id: 'c1', authorName: 'System Agent Swarm', isOfficial: true, isAIGenerated: true, text: 'Sewage leakage alert raised to Water department dispatcher.', time: '5 days ago' }
    ]
  }
};

export default function IssueTrackingPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const issueId = params.id as string;
  const [commentInput, setCommentInput] = useState('');
  const [localComments, setLocalComments] = useState<any[]>([]);

  // Query details
  const { data: issueDetails, isLoading } = useQuery({
    queryKey: ['tracking-issue', issueId],
    queryFn: async () => {
      try {
        const response = await api.get(`/issues/${issueId}`);
        if (response.data && response.data.success) {
          return response.data.data;
        }
        return MOCK_ISSUE_DETAILS[issueId] || MOCK_ISSUE_DETAILS['mock-issue-1'];
      } catch (err) {
        return MOCK_ISSUE_DETAILS[issueId] || MOCK_ISSUE_DETAILS['mock-issue-1'];
      }
    }
  });

  // Sync comment details
  useEffect(() => {
    if (issueDetails?.comments) {
      setLocalComments(issueDetails.comments);
    } else if (issueDetails) {
      setLocalComments(issueDetails.comments || []);
    }
  }, [issueDetails]);

  // Comment submission mutation
  const commentMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await api.post(`/issues/${issueId}/comments`, { content: text });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracking-issue', issueId] });
      toast.success('Comment posted successfully.');
    },
    onError: () => {
      toast.success('Comment posted locally (Demo Mode).');
    }
  });

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newComment = {
      id: `comment-${Date.now()}`,
      authorName: 'Aarav Sharma (You)',
      isOfficial: false,
      isAIGenerated: false,
      text: commentInput.trim(),
      time: 'Just now'
    };

    setLocalComments((prev) => [...prev, newComment]);
    commentMutation.mutate(commentInput.trim());
    setCommentInput('');
  };

  if (isLoading) {
    return <div className="h-64 rounded-3xl bg-white border border-slate-200 animate-pulse shadow-sm" />;
  }

  const issue = issueDetails || MOCK_ISSUE_DETAILS['mock-issue-1'];
  const catConfig = ISSUE_CATEGORIES.find((c) => c.id === issue.aiAnalysis?.category);
  const steps = issue.repairPlan?.plan?.steps || [];

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'submitted': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'verified': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'assigned': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'in_progress': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'resolved': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Header back button */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-5">
        <Link 
          href="/community" 
          className="p-2.5 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 text-slate-500 hover:text-[#0b2240] transition-all shrink-0 cursor-pointer"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </Link>
        <div className="text-left">
          <span className="text-[9px] font-mono text-slate-500 font-bold bg-slate-50 px-2 py-0.5 border border-slate-200 rounded">
            Incident control: {issue.ticketId}
          </span>
          <h1 className="text-xl font-black text-[#0b2240] tracking-tight mt-1">Grievance Tracking Pipeline</h1>
        </div>
      </div>

      {/* Details layout grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Issue info & repair steps */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 text-left">
            <div className="flex justify-between items-start gap-3">
              <div>
                <span className="text-xs font-bold text-slate-450 flex items-center gap-1.5">
                  <span>{catConfig?.icon || '📋'}</span>
                  <span>{catConfig?.label || issue.aiAnalysis?.category}</span>
                </span>
                <h3 className="font-extrabold text-base text-[#0b2240] mt-1.5 leading-normal">{issue.title}</h3>
              </div>
              <span className={`text-[9px] font-bold border rounded-full px-2.5 py-0.5 uppercase tracking-wide shrink-0 ${getStatusColor(issue.status)}`}>
                {issue.status.replace('_', ' ')}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{issue.description}</p>
            
            <div className="flex items-start gap-1.5 pt-3 border-t border-slate-100 text-xs text-slate-500 font-semibold">
              <MapPin className="h-4.5 w-4.5 text-[#2563eb] shrink-0 mt-0.5" />
              <span className="leading-normal">{issue.address}</span>
            </div>
          </div>

          {/* Active Repair Plan Details */}
          {steps.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 text-left">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="p-1.5 bg-blue-50 text-[#2563eb] rounded-lg">
                  <Wrench className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#0b2240]">AI Swarm Repair Schedule</h3>
              </div>

              {issue.repairPlan?.plan?.summary && (
                <p className="text-xs text-slate-650 leading-relaxed italic border-b border-slate-50 pb-3">
                  "{issue.repairPlan.plan.summary}"
                </p>
              )}

              {/* Steps timeline list */}
              <div className="space-y-3">
                {steps.map((st: any) => {
                  const isDone = st.status === 'completed';
                  return (
                    <div 
                      key={st.order} 
                      className={`p-3.5 rounded-xl border flex gap-3.5 items-start transition-all ${
                        isDone 
                          ? 'bg-emerald-50/20 border-emerald-100 text-slate-650' 
                          : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className={`h-6 w-6 rounded-full border flex items-center justify-center shrink-0 text-[10px] font-bold ${
                        isDone 
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                          : 'border-slate-200 bg-slate-50 text-slate-550'
                      }`}>
                        {isDone ? '✓' : st.order}
                      </div>
                      <div>
                        <p className={`text-xs font-bold leading-normal ${isDone ? 'line-through text-slate-450 decoration-slate-350' : 'text-[#0b2240]'}`}>
                          {st.description}
                        </p>
                        <span className="text-[9px] font-bold text-slate-400 mt-1 block uppercase tracking-wide">SLA Target Duration: {st.estimatedDuration}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Column: Discussion & Comment Thread Feed */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col h-[500px]">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#0b2240] flex items-center gap-1.5 mb-3 border-b border-slate-100 pb-3 text-left">
            <MessageSquare className="h-4.5 w-4.5 text-[#2563eb]" />
            <span>Resolution discussion logs</span>
          </h3>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 mb-4 text-left">
            {localComments.map((c: any) => (
              <div key={c.id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1">
                <div className="flex justify-between items-center gap-2">
                  <span className={`text-[10px] font-bold ${c.isOfficial ? 'text-[#2563eb]' : 'text-slate-550'} flex items-center gap-1`}>
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span>{c.authorName}</span>
                  </span>
                  <span className="text-[8px] text-slate-400 font-bold">{c.time}</span>
                </div>
                <p className="text-xs text-slate-650 leading-normal font-semibold">{c.text}</p>
                {c.isAIGenerated && (
                  <span className="inline-flex items-center gap-1 text-[8px] bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded font-extrabold uppercase tracking-wide">
                    AI Swarm Log
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Form write comment */}
          <form onSubmit={handlePostComment} className="flex gap-2 border-t border-slate-100 pt-3">
            <input
              type="text"
              placeholder="Submit feedback or query..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              className="flex-1 bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-[#2563eb]"
            />
            <button
              type="submit"
              className="p-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl active:scale-95 transition-all shrink-0 cursor-pointer shadow-sm"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
