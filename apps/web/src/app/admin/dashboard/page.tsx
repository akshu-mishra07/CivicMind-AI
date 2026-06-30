'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Users, 
  ShieldAlert, 
  Activity, 
  TrendingUp, 
  ArrowUpRight, 
  CheckCircle, 
  Sparkles,
  AlertOctagon,
  Zap
} from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6 text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="text-left">
          <h1 className="text-2xl font-black tracking-tight text-[#0b2240]">Municipal Command Center</h1>
          <p className="text-slate-550 text-xs mt-1 font-semibold">Central administrative view of departments, active users, and system performance logs.</p>
        </div>

        <div className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-700 shrink-0 self-start sm:self-auto uppercase tracking-wide">
          <Sparkles className="h-3.5 w-3.5" />
          <span>City Status: Stable</span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs text-left">
          <span className="text-[9px] uppercase font-bold text-slate-450">Registered Citizens</span>
          <h3 className="text-xl font-black mt-1 text-[#0b2240]">1,240 Users</h3>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-bold uppercase mt-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+48 this week</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs text-left">
          <span className="text-[9px] uppercase font-bold text-slate-450">Active Swarm Agents</span>
          <h3 className="text-xl font-black mt-1 text-[#0b2240]">6 Agents</h3>
          <div className="flex items-center gap-1.5 text-[10px] text-[#2563eb] font-bold uppercase mt-1">
            <Zap className="h-3.5 w-3.5" />
            <span>All nodes online</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs text-left">
          <span className="text-[9px] uppercase font-bold text-slate-450">Total Incidents</span>
          <h3 className="text-xl font-black mt-1 text-[#0b2240]">542 Filed</h3>
          <div className="flex items-center gap-1.5 text-[10px] text-red-700 font-bold uppercase mt-1">
            <AlertOctagon className="h-3.5 w-3.5" />
            <span>12 critical open</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs text-left">
          <span className="text-[9px] uppercase font-bold text-slate-450">SLA Resolution Rate</span>
          <h3 className="text-xl font-black mt-1 text-[#0b2240]">94.8%</h3>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-bold uppercase mt-1">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>Dwarka Zone leading</span>
          </div>
        </div>
      </div>

      {/* Middle row: Departments and AI Swarm */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Departments table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 text-left">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#0b2240] flex items-center gap-1.5">
              <Building2 className="h-4.5 w-4.5 text-[#2563eb]" />
              <span>Department Workloads</span>
            </h3>
            <Link href="/admin/departments" className="text-xs font-bold text-[#2563eb] hover:underline uppercase tracking-wide">
              Manage Departments
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-100">
                  <th className="py-3 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-450">Department</th>
                  <th className="py-3 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-450">Staff</th>
                  <th className="py-3 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-450">Active Issues</th>
                  <th className="py-3 px-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-450">Avg SLA Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { name: 'Roads & Infrastructure', code: 'ROADS', staff: 14, active: 8, time: '14.2 hrs', barColor: 'bg-red-500', barWidth: '80%' },
                  { name: 'Sanitation & Waste', code: 'SANITATION', staff: 9, active: 4, time: '8.5 hrs', barColor: 'bg-orange-500', barWidth: '40%' },
                  { name: 'Water & Sewage', code: 'WATER', staff: 11, active: 4, time: '19.8 hrs', barColor: 'bg-blue-500', barWidth: '40%' },
                  { name: 'Electrical Grid', code: 'ELECTRICAL', staff: 6, active: 3, time: '6.0 hrs', barColor: 'bg-amber-500', barWidth: '30%' }
                ].map((dept, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-3">
                      <p className="font-extrabold text-[#0b2240]">{dept.name}</p>
                      <div className="mt-1.5 bg-slate-100 h-1.5 rounded-full overflow-hidden w-24">
                        <div className={`h-full rounded-full ${dept.barColor}`} style={{ width: dept.barWidth }} />
                      </div>
                    </td>
                    <td className="py-4 px-3 text-slate-600 font-semibold">{dept.staff} officers</td>
                    <td className="py-4 px-3">
                      <span className="text-[#2563eb] font-bold">{dept.active} open</span>
                    </td>
                    <td className="py-4 px-3 text-right">
                      <span className="text-emerald-700 font-bold">{dept.time}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: AI Activity Swarm Panel */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 text-left">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#0b2240] flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <Activity className="h-4.5 w-4.5 text-[#2563eb]" />
            <span>AI Swarm Diagnostics</span>
          </h3>

          <div className="space-y-3">
            {[
              { agent: 'Vision Agent', status: 'Online', action: 'Classifying pothole image...', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
              { agent: 'Duplicate Agent', status: 'Online', action: 'Radius check Dwarka Sector 12...', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
              { agent: 'Priority Agent', status: 'Online', action: 'POI scoring active...', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
              { agent: 'Planning Agent', status: 'Online', action: 'Cost schedule generated...', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
              { agent: 'Chat Agent', status: 'Online', action: 'Awaiting citizen queries...', color: 'bg-blue-50 text-blue-700 border-blue-200' },
              { agent: 'Predict Agent', status: 'Online', action: 'Forecasting hotspot zones...', color: 'bg-purple-50 text-purple-700 border-purple-200' }
            ].map((diag, index) => (
              <div key={index} className="p-3.5 bg-[#f8fafc] border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-extrabold text-[#0b2240]">{diag.agent}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">{diag.action}</p>
                </div>
                <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wide ${diag.color}`}>
                  {diag.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
