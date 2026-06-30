'use client';

import React from 'react';
import { Clock, ShieldCheck, Award } from 'lucide-react';

export default function OfficerAnalyticsPage() {
  return (
    <div className="space-y-6 text-slate-800">
      {/* Header */}
      <div className="text-left border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-black text-[#0b2240] tracking-tight">Performance & Analytics</h1>
        <p className="text-slate-555 text-xs mt-1 font-semibold">Review resolution efficiency, SLA response times, and department contribution stats.</p>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex items-center gap-4 text-left">
          <div className="p-3 bg-blue-50 text-[#2563eb] rounded-2xl shrink-0">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-450">Average Response Time</span>
            <p className="text-lg font-black text-[#0b2240] mt-0.5">18.4 Hours</p>
            <span className="text-[9px] text-emerald-700 font-bold uppercase tracking-wide">12% faster than city average</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex items-center gap-4 text-left">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl shrink-0">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-450">SLA Compliance</span>
            <p className="text-lg font-black text-[#0b2240] mt-0.5">94.8% SLA</p>
            <span className="text-[9px] text-[#2563eb] font-bold uppercase tracking-wide">Goal met (Threshold 90%)</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex items-center gap-4 text-left">
          <div className="p-3 bg-purple-50 text-purple-700 rounded-2xl shrink-0">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-450">Quality rating</span>
            <p className="text-lg font-black text-[#0b2240] mt-0.5">4.9 / 5.0 Stars</p>
            <span className="text-[9px] text-indigo-700 font-bold uppercase tracking-wide">Based on 145 reviews</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly Resolution Velocity Chart */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 text-left">
          <div className="flex items-center justify-between border-b border-slate-50 pb-2">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#0b2240]">Weekly Resolution Velocity</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Last 5 Weeks</span>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-48 w-full flex items-end justify-between pt-6 px-4">
            {[
              { label: 'W1', count: 12, height: '40%', active: false },
              { label: 'W2', count: 18, height: '60%', active: false },
              { label: 'W3', count: 24, height: '80%', active: false },
              { label: 'W4', count: 16, height: '52%', active: false },
              { label: 'W5', count: 30, height: '100%', active: true }
            ].map((bar, idx) => (
              <div key={idx} className="flex flex-col items-center gap-3 w-12 group">
                <span className="opacity-0 group-hover:opacity-100 bg-[#0b2240] border border-[#0b2240] text-[9px] font-mono text-white py-0.5 px-1.5 rounded-md transition-all absolute mb-36">
                  {bar.count} cases
                </span>
                
                <div className="w-6 bg-slate-100 h-32 rounded-lg overflow-hidden relative flex items-end justify-center">
                  <div 
                    className={`w-full rounded-b-lg transition-all ${
                      bar.active 
                        ? 'bg-[#2563eb]' 
                        : 'bg-slate-400 group-hover:bg-slate-500'
                    }`}
                    style={{ height: bar.height }}
                  />
                </div>

                <span className="text-[10px] font-mono font-bold text-slate-500">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quality Score Ratings breakdown */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 text-left">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#0b2240] border-b border-slate-50 pb-2">Citizen Feedback Breakdown</h3>
          
          <div className="space-y-3.5 pt-2">
            {[
              { stars: '5 Stars', count: 124, percentage: '85%' },
              { stars: '4 Stars', count: 18, percentage: '12%' },
              { stars: '3 Stars', count: 3, percentage: '2%' },
              { stars: '2 Stars', count: 0, percentage: '0%' },
              { stars: '1 Star', count: 0, percentage: '0%' }
            ].map((rate, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs font-semibold">
                <span className="w-12 text-slate-500 shrink-0">{rate.stars}</span>
                <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: rate.percentage }} />
                </div>
                <span className="w-20 text-right text-slate-400 font-mono font-bold shrink-0">{rate.count} reviews</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
