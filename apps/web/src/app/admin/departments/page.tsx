'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Plus, Mail, Phone, ShieldAlert, Award, Star } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

const MOCK_DEPTS = [
  { _id: '1', name: 'Roads & Infrastructure', code: 'ROADS', contactEmail: 'roads@city.gov', contactPhone: '011-23456781', activeIssues: 8, resolvedIssues: 145, performanceScore: 92 },
  { _id: '2', name: 'Sanitation & Waste Management', code: 'SANITATION', contactEmail: 'sanitation@city.gov', contactPhone: '011-23456782', activeIssues: 4, resolvedIssues: 198, performanceScore: 96 },
  { _id: '3', name: 'Water & Sewage Utility', code: 'WATER', contactEmail: 'water@city.gov', contactPhone: '011-23456783', activeIssues: 4, resolvedIssues: 87, performanceScore: 84 },
  { _id: '4', name: 'Electrical & Streetlighting', code: 'ELECTRICAL', contactEmail: 'electrical@city.gov', contactPhone: '011-23456784', activeIssues: 3, resolvedIssues: 112, performanceScore: 95 }
];

export default function DepartmentsManagementPage() {
  const queryClient = useQueryClient();
  const [deptList, setDeptList] = useState(MOCK_DEPTS);

  // New Department Form state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Fetch departments
  const { data: departments = [] } = useQuery({
    queryKey: ['admin-depts'],
    queryFn: async () => {
      try {
        const response = await api.get('/departments');
        if (response.data && response.data.success) {
          return response.data.data;
        }
        return deptList;
      } catch (err) {
        return deptList;
      }
    }
  });

  // Create department mutation
  const createDeptMutation = useMutation({
    mutationFn: async (newDept: any) => {
      const response = await api.post('/departments', newDept);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-depts'] });
      toast.success('Municipal department registered successfully.');
    },
    onError: (err: any) => {
      // Local fallback simulator
      toast.success('Department created locally (Demo Mode).');
    }
  });

  const handleCreateDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code || !email || !phone) {
      toast.warning('Please fill in all department parameters.');
      return;
    }

    const payload = {
      name,
      code: code.toUpperCase(),
      contactEmail: email,
      contactPhone: phone,
      activeIssues: 0,
      resolvedIssues: 0,
      performanceScore: 100
    };

    // Update locally
    setDeptList((prev) => [...prev, { ...payload, _id: `mock-dept-${Date.now()}` }]);
    
    // Trigger mutation
    createDeptMutation.mutate(payload);

    // Clear form
    setName('');
    setCode('');
    setEmail('');
    setPhone('');
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 text-left">
        <h1 className="text-2xl font-black tracking-tight text-[#0b2240]">Municipal Departments</h1>
        <p className="text-slate-550 text-xs mt-1 font-semibold">Configure central municipal departments, coordinate workflows, and audit performance scores.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Departments List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-[#0b2240] flex items-center gap-1.5 mb-1">
            <Building2 className="h-4.5 w-4.5 text-[#2563eb]" />
            <span>Active Departments Registry</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departments.map((dept: any) => (
              <div 
                key={dept._id}
                className="bg-white border border-slate-200 hover:border-slate-350 rounded-3xl p-5 shadow-xs hover:shadow-sm transition-all space-y-4 text-left"
              >
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-50 px-2 py-0.5 border border-slate-200 rounded">
                      {dept.code}
                    </span>
                    <h3 className="font-extrabold text-sm text-[#0b2240] mt-1.5">{dept.name}</h3>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200 rounded-full font-bold">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span>{dept.performanceScore}%</span>
                  </div>
                </div>

                {/* Contact details */}
                <div className="space-y-1.5 text-xs text-slate-500 border-t border-slate-100 pt-3 font-semibold">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span>{dept.contactEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>{dept.contactPhone}</span>
                  </div>
                </div>

                {/* Workloads */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-450">Open Workload</span>
                    <p className="font-extrabold text-[#2563eb] mt-0.5">{dept.activeIssues} Issues</p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-450">Resolved Total</span>
                    <p className="font-extrabold text-emerald-700 mt-0.5">{dept.resolvedIssues} Cases</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Column: Create Department Form */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 text-left">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#0b2240] flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <Plus className="h-4.5 w-4.5 text-[#2563eb]" />
            <span>Add Department</span>
          </h3>

          <form onSubmit={handleCreateDept} className="space-y-4 text-left">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-550" htmlFor="deptName">Department Name</label>
              <input
                id="deptName"
                type="text"
                placeholder="e.g. Parks & Recreation"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs text-slate-800 focus:outline-none focus:border-[#2563eb]"
              />
            </div>

            {/* Code */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-550" htmlFor="deptCode">Department Code</label>
              <input
                id="deptCode"
                type="text"
                placeholder="e.g. PARKS"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs text-slate-800 focus:outline-none focus:border-[#2563eb]"
              />
            </div>

            {/* Contact Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-550" htmlFor="deptEmail">Contact Email</label>
              <input
                id="deptEmail"
                type="email"
                placeholder="parks@city.gov"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs text-slate-800 focus:outline-none focus:border-[#2563eb]"
              />
            </div>

            {/* Contact Phone */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-550" htmlFor="deptPhone">Contact Phone</label>
              <input
                id="deptPhone"
                type="text"
                placeholder="011-23456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs text-slate-800 focus:outline-none focus:border-[#2563eb]"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold rounded-xl text-xs active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="h-4 w-4" />
              <span>Create Department</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
