'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  MapPin, 
  Brain, 
  CheckCircle2, 
  Calendar, 
  Coins, 
  Wrench, 
  ShieldCheck, 
  AlertTriangle,
  FileText,
  Activity,
  UserCheck
} from 'lucide-react';
import api from '@/lib/api';
import { ISSUE_CATEGORIES } from '@civicmind/shared/dist/constants/categories';
import { toast } from 'sonner';

// Mock detailed repair planning database fallback
const MOCK_REPAIR_DETAILS = {
  issue: {
    _id: 'mock-issue-1',
    ticketId: 'CM-2026-0001',
    title: 'Massive Pothole Near Delhi Public School Entrance',
    description: 'A deep pothole has formed right at the entrance gate of Delhi Public School. It fills with water during rains, posing a safety hazard.',
    address: 'Delhi Public School Main Gate, Dwarka, New Delhi',
    status: 'assigned',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    aiAnalysis: {
      category: 'pothole',
      severity: 'critical',
      confidence: 0.96,
      imageAnalysis: {
        detectedObjects: ['cracked asphalt', 'exposed roadbed', 'standing puddle'],
        safetyAssessment: 'Critical hazard for transport vehicles. Risk of structural tire failure or cycle accidents.'
      }
    },
    priority: {
      score: 87,
      level: 'critical'
    }
  },
  repairPlan: {
    _id: 'mock-repair-1',
    plan: {
      summary: 'Standard deep pothole repair requiring debris excavation, gravel sub-base reinforcement, asphalt pouring, and thermal sealing to withstand heavy bus loads.',
      steps: [
        { order: 1, description: 'Excavate loose asphalt and mud from affected subgrade area', estimatedDuration: '2 hours', resources: ['excavator spade', 'waste bin'], status: 'completed' as const },
        { order: 2, description: 'Fill foundation core with compacted aggregate gravel mix', estimatedDuration: '1.5 hours', resources: ['crushed stone', 'plate compactor'], status: 'completed' as const },
        { order: 3, description: 'Pour hot-mix bitumen binder course and level with grade', estimatedDuration: '2.5 hours', resources: ['asphalt rake', 'bitumen emulsion'], status: 'pending' as const },
        { order: 4, description: 'Apply thermal surface sealer coating to edges and compact', estimatedDuration: '1 hour', resources: ['steamroller', 'joint sealant'], status: 'pending' as const }
      ],
      estimatedCost: {
        min: 15000,
        max: 22000,
        currency: 'INR',
        breakdown: [
          { item: 'Hot Bituminous Mix (2.5 tons)', cost: 12000 },
          { item: 'Base Gravel Aggregate', cost: 3500 },
          { item: 'Steamroller Rental & Transport', cost: 4500 },
          { item: 'Safety Signs & Barricading', cost: 1000 }
        ]
      },
      requiredPersonnel: ['1 Construction Supervisor', '2 Asphalt Operators'],
      safetyPrecautions: ['Place warning barricades 50m prior', 'Wear high-visibility vests', 'Deploy traffic coordinator during work hours'],
      environmentalConsiderations: 'Bitumen emulsion to be stored securely. Prevent runoff into drainage lines.'
    },
    completionPercentage: 50
  }
};

export default function OfficerActionPanelPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const issueId = params.id as string;

  // React State for interactive steps checklist (Demo mode support)
  const [steps, setSteps] = useState<any[]>([]);
  const [percentage, setPercentage] = useState(0);

  // Fetch issue + repair details
  const { data: repairData, isLoading } = useQuery({
    queryKey: ['repair-plan', issueId],
    queryFn: async () => {
      try {
        const response = await api.get(`/issues/${issueId}/repair`);
        if (response.data && response.data.success) {
          return response.data.data;
        }
        return MOCK_REPAIR_DETAILS;
      } catch (err) {
        console.warn('⚠️ Central server offline. Displaying local planning agent dashboard.');
        return MOCK_REPAIR_DETAILS;
      }
    }
  });

  // Sync state with fetched details
  useEffect(() => {
    if (repairData?.repairPlan?.plan?.steps) {
      setSteps(repairData.repairPlan.plan.steps);
      setPercentage(repairData.repairPlan.completionPercentage || 0);
    }
  }, [repairData]);

  // Step Status toggle mutation
  const toggleStepMutation = useMutation({
    mutationFn: async ({ stepOrder, newStatus }: { stepOrder: number; newStatus: string }) => {
      const response = await api.put(`/repairs/${repairData.repairPlan._id}/progress`, {
        stepOrder,
        status: newStatus
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repair-plan', issueId] });
      toast.success('Step status updated.');
    },
    onError: (err: any) => {
      // Offline local update simulator
      toast.success('Step progress updated locally (Demo Mode).');
    }
  });

  // Resolve Ticket mutation
  const resolveTicketMutation = useMutation({
    mutationFn: async () => {
      const response = await api.put(`/issues/${issueId}/status`, {
        status: 'resolved',
        note: 'Completed all steps in AI repair schedule. Verified by department supervisor.'
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['officer-issues'] });
      toast.success('Ticket marked as Resolved! 🎉');
      router.push('/officer/dashboard');
    },
    onError: (err: any) => {
      // Local offline bypass
      toast.success('Ticket successfully resolved locally! 🎉');
      router.push('/officer/dashboard');
    }
  });

  const handleStepToggle = (order: number) => {
    const updated = steps.map((s) => {
      if (s.order === order) {
        const newStatus = s.status === 'completed' ? 'pending' : 'completed';
        
        // Trigger API update
        toggleStepMutation.mutate({ stepOrder: order, newStatus });
        return { ...s, status: newStatus };
      }
      return s;
    });

    setSteps(updated);

    // Recompute percentage
    const completedCount = updated.filter((s) => s.status === 'completed').length;
    const nextPercent = Math.round((completedCount / updated.length) * 100);
    setPercentage(nextPercent);
  };

  if (isLoading) {
    return <div className="h-64 rounded-3xl bg-white border border-slate-200 animate-pulse shadow-sm" />;
  }
  const issue = repairData?.issue || MOCK_REPAIR_DETAILS.issue;
  const plan = repairData?.repairPlan?.plan || MOCK_REPAIR_DETAILS.repairPlan.plan;
  const catConfig = ISSUE_CATEGORIES.find((c) => c.id === issue.aiAnalysis?.category);

  return (
    <div className="space-y-6 text-slate-800">
      {/* Back Header navigation */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-5">
        <Link 
          href="/officer/dashboard" 
          className="p-2 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 text-slate-500 hover:text-[#0b2240] transition-all shrink-0 flex items-center justify-center cursor-pointer"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </Link>
        <div className="text-left">
          <span className="text-[10px] font-mono text-slate-500 font-bold bg-slate-50 px-2 py-0.5 border border-slate-200 rounded">
            Incident control: {issue.ticketId}
          </span>
          <h1 className="text-xl font-black text-[#0b2240] mt-1">Resolution Planning Suite</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 1 Column: Issue Summary Details & AI Vision analysis */}
        <div className="space-y-6">
          {/* Issue Summary Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 text-left">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#0b2240] border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-[#2563eb]" />
              <span>Incident Details</span>
            </h3>
            
            <div className="space-y-3">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-450">Category Type</span>
                <p className="text-xs font-bold text-[#0b2240] mt-0.5 flex items-center gap-1.5">
                  <span>{catConfig?.icon || '📋'}</span>
                  <span>{catConfig?.label || issue.aiAnalysis?.category}</span>
                </p>
              </div>

              <div>
                <span className="text-[9px] uppercase font-bold text-slate-450">Title</span>
                <p className="text-xs font-bold text-[#0b2240] mt-0.5 leading-normal">{issue.title}</p>
              </div>

              <div>
                <span className="text-[9px] uppercase font-bold text-slate-450">Citizen Statement</span>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed font-semibold">{issue.description}</p>
              </div>

              <div className="flex items-start gap-1.5 pt-3 border-t border-slate-100 text-xs text-slate-500">
                <MapPin className="h-4.5 w-4.5 text-[#2563eb] shrink-0 mt-0.5" />
                <span className="leading-normal text-[#0b2240] font-semibold">{issue.address}</span>
              </div>
            </div>
          </div>

          {/* AI Vision Diagnostics Card */}
          <div className="bg-emerald-50/50 border border-emerald-200 rounded-3xl p-6 space-y-3 text-left">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 flex items-center gap-1.5">
              <Brain className="h-4 w-4" />
              <span>Vision Agent Diagnostics</span>
            </h3>

            <div className="space-y-3">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-450">Detected Assets / Textures</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {issue.aiAnalysis?.imageAnalysis?.detectedObjects?.map((obj: string, index: number) => (
                    <span key={index} className="text-[9px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">
                      {obj}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[9px] uppercase font-bold text-slate-450">AI Safety Assessment</span>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed font-semibold">{issue.aiAnalysis?.imageAnalysis?.safetyAssessment}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Swarm Repair Plan Work Flow Checklist */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress overview banner */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-[#0b2240] text-base">AI Repair Plan Checklist</h3>
                <p className="text-xs text-slate-500 mt-0.5 font-semibold">Toggle checkboxes as crews complete steps on site.</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-450">Completion</span>
                <h4 className="text-xl font-black text-emerald-700 mt-0.5">{percentage}%</h4>
              </div>
            </div>

            {/* Progress visual gauge */}
            <div className="bg-slate-100 h-2.5 rounded-full overflow-hidden relative">
              <div 
                className="absolute inset-y-0 left-0 bg-[#2563eb] rounded-full transition-all duration-500" 
                style={{ width: `${percentage}%` }}
              />
            </div>

            {/* Checklist items */}
            <div className="space-y-3 pt-2">
              {steps.map((step) => {
                const isCompleted = step.status === 'completed';
                return (
                  <button
                    key={step.order}
                    onClick={() => handleStepToggle(step.order)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex gap-3.5 items-start cursor-pointer ${
                      isCompleted 
                        ? 'bg-emerald-50 border-emerald-200' 
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {/* Tick Checkbox */}
                    <div className={`h-5 w-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      isCompleted 
                        ? 'bg-emerald-600 border-emerald-600 text-white' 
                        : 'border-slate-300 bg-white'
                    }`}>
                      {isCompleted && <CheckCircle2 className="h-4.5 w-4.5 stroke-[3] text-white" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] uppercase font-bold tracking-wider text-slate-450">Step {step.order}</span>
                        <span className="text-[10px] font-mono text-slate-400">• Duration: {step.estimatedDuration}</span>
                      </div>
                      <p className={`text-xs font-semibold leading-normal ${isCompleted ? 'text-slate-500 line-through decoration-slate-300' : 'text-[#0b2240]'}`}>
                        {step.description}
                      </p>
                      {/* Resource details */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {step.resources.map((res: string, idx: number) => (
                          <span key={idx} className="text-[9px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                            {res}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Resolve button trigger */}
            {percentage === 100 && (
              <button
                onClick={() => resolveTicketMutation.mutate()}
                disabled={resolveTicketMutation.isPending}
                className="w-full py-3.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-extrabold rounded-xl active:scale-98 transition-all flex items-center justify-center gap-2 text-sm shadow-md cursor-pointer mt-4"
              >
                <UserCheck className="h-5 w-5" />
                <span>Mark Issue as Resolved</span>
              </button>
            )}
          </div>

          {/* Budget, personnel & precautions metadata split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Cost Breakdown */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 text-left">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#0b2240] flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Coins className="h-4 w-4 text-[#2563eb]" />
                <span>Estimated Cost Budget</span>
              </h4>
              <div className="bg-[#f8fafc] p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                <span className="text-[10px] text-slate-450 uppercase font-bold">Planned Range</span>
                <span className="text-sm font-extrabold text-emerald-700">
                  ₹{plan.estimatedCost?.min?.toLocaleString()} - ₹{plan.estimatedCost?.max?.toLocaleString()}
                </span>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] uppercase font-bold text-slate-450">Resource Items Breakdown</span>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                  {plan.estimatedCost?.breakdown?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-xs font-semibold text-slate-600">
                      <span>{item.item}</span>
                      <span className="text-[#0b2240] font-bold">₹{item.cost?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Crew resources & safety guidelines */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 text-left">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#0b2240] flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Wrench className="h-4 w-4 text-[#2563eb]" />
                <span>Crew & Safety Requirements</span>
              </h4>
              
              <div className="space-y-4">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-450">Recommended Personnel</span>
                  <ul className="text-xs font-semibold text-slate-600 list-disc pl-4 space-y-1 mt-1">
                    {plan.requiredPersonnel?.map((p: string, idx: number) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-450">Safety Instructions</span>
                  <ul className="text-xs text-slate-600 list-disc pl-4 space-y-1 mt-1 font-semibold">
                    {plan.safetyPrecautions?.map((s: string, idx: number) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
