'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { 
  FileText, 
  MapPin, 
  Clock, 
  ArrowUpRight, 
  CheckCircle2, 
  Award,
  AlertTriangle
} from 'lucide-react';
import api from '@/lib/api';
import { ISSUE_CATEGORIES } from '@civicmind/shared/dist/constants/categories';

// Local Mock Reports matching user reported history
const MOCK_MY_REPORTS = [
  {
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
    aiAnalysis: {
      category: 'garbage',
      severity: 'medium',
      confidence: 0.88,
      suggestions: ['Dispatch waste clearance truck', 'Place standard community bin']
    },
    priority: {
      score: 55,
      level: 'medium'
    }
  }
];

export default function MyReportsPage() {
  const { data: myIssues = [], isLoading } = useQuery({
    queryKey: ['my-issues'],
    queryFn: async () => {
      try {
        const response = await api.get('/issues/my-reports');
        if (response.data && response.data.success) {
          return response.data.data;
        }
        return MOCK_MY_REPORTS;
      } catch (err) {
        console.warn('⚠️ Central server offline. Displaying local mock reported issues.');
        return MOCK_MY_REPORTS;
      }
    }
  });

  const getStatusStepIndex = (status: string) => {
    switch (status) {
      case 'submitted': return 1;
      case 'verified': return 2;
      case 'assigned': return 3;
      case 'in_progress': return 4;
      case 'resolved': return 5;
      default: return 1;
    }
  };

  const getSeverityStyles = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-50 text-red-700 border-red-200';
      case 'high': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-green-50 text-green-700 border-green-200';
    }
  };

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
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="text-left">
          <h1 className="text-2xl font-black text-[#0b2240] tracking-tight">My Grievance Submissions</h1>
          <p className="text-slate-555 text-xs mt-1 font-semibold">Monitor coordinates routing checkpoints, status milestones, and resolution details.</p>
        </div>

        {/* Reputation Score Metric Box */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-xs shrink-0">
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
            <Award className="h-5 w-5" />
          </div>
          <div className="text-left">
            <span className="text-[9px] uppercase font-bold text-slate-450">Verified Contribution Points</span>
            <p className="text-sm font-black text-[#0b2240]">180 Points</p>
          </div>
        </div>
      </div>

      {/* Reports Tracker List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 rounded-3xl bg-white border border-slate-200 animate-pulse shadow-sm" />
          ))}
        </div>
      ) : myIssues.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center border border-dashed border-slate-250 rounded-3xl bg-white shadow-sm">
          <FileText className="h-10 w-10 text-slate-400 mb-3" />
          <h3 className="font-extrabold text-[#0b2240]">No grievances recorded</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs font-semibold">You have not submitted any public grievances to the registry.</p>
          <Link
            href="/report"
            className="mt-4 px-5 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold rounded-xl text-xs active:scale-98 transition-all"
          >
            Submit Grievance
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {myIssues.map((issue: any) => {
            const catConfig = ISSUE_CATEGORIES.find((c) => c.id === issue.aiAnalysis?.category);
            const currentStep = getStatusStepIndex(issue.status);
            
            return (
              <div 
                key={issue._id} 
                className="bg-white border border-slate-200 hover:border-slate-350 rounded-3xl p-6 shadow-xs hover:shadow-sm transition-all space-y-5"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="text-left">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        {issue.ticketId}
                      </span>
                      <span className="text-xs font-bold text-[#0b2240] flex items-center gap-1">
                        <span>{catConfig?.icon || '📋'}</span>
                        <span>{catConfig?.label || issue.aiAnalysis?.category}</span>
                      </span>
                      <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 border rounded-full ${getSeverityStyles(issue.aiAnalysis?.severity)}`}>
                        {issue.aiAnalysis?.severity}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-base text-[#0b2240]">{issue.title}</h3>
                  </div>

                  <Link
                    href={`/report/${issue._id}`}
                    className="flex items-center gap-1 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl text-[10px] font-bold text-[#2563eb] hover:text-[#1d4ed8] self-start transition-all shrink-0 uppercase tracking-wide"
                  >
                    <span>Track Resolution</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {/* Progress Timeline steps */}
                <div className="bg-[#f8fafc] border border-slate-200/60 rounded-2xl p-5">
                  <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 uppercase mb-3">
                    <span>Resolution pipeline milestones</span>
                    <span className={`px-2 py-0.5 border rounded-full text-[9px] ${getStatusColor(issue.status)}`}>
                      Status: {issue.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Visual pipeline */}
                  <div className="grid grid-cols-5 gap-1.5 relative pt-4">
                    {/* Background connecter line */}
                    <div className="absolute top-[27px] left-[10%] right-[10%] h-[2px] bg-slate-200 -z-10" />
                    <div 
                      className="absolute top-[27px] left-[10%] h-[2px] bg-[#2563eb] -z-10 transition-all duration-500" 
                      style={{ width: `${(currentStep - 1) * 20}%` }}
                    />

                    {[
                      { step: 1, label: 'Submitted' },
                      { step: 2, label: 'AI Review' },
                      { step: 3, label: 'Assigned' },
                      { step: 4, label: 'Resolving' },
                      { step: 5, label: 'Complete' }
                    ].map((st) => {
                      const isCompleted = currentStep >= st.step;
                      const isCurrent = currentStep === st.step;
                      return (
                        <div key={st.step} className="flex flex-col items-center text-center">
                          <div className={`h-6 w-6 rounded-full flex items-center justify-center border transition-all ${
                            isCurrent
                              ? 'bg-blue-50 border-[#2563eb] text-[#2563eb]'
                              : isCompleted
                              ? 'bg-[#2563eb] border-[#2563eb] text-white'
                              : 'bg-white border-slate-200 text-slate-400'
                          }`}>
                            {isCompleted && !isCurrent ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                              <span className="text-[10px] font-bold">{st.step}</span>
                            )}
                          </div>
                          <span className={`text-[9px] font-bold mt-2 ${
                            isCurrent ? 'text-[#2563eb]' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                          }`}>
                            {st.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Sub info footer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-[#2563eb] shrink-0" />
                    <span className="truncate max-w-sm font-semibold">{issue.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>Logged {new Date(issue.createdAt).toLocaleDateString()}</span>
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
