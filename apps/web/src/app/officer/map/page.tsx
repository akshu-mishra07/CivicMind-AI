'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { 
  Map as MapIcon, 
  MapPin, 
  Search, 
  Sliders, 
  AlertTriangle, 
  Wand2, 
  CheckCircle,
  Eye,
  Crosshair,
  Compass
} from 'lucide-react';
import api from '@/lib/api';
import { ISSUE_CATEGORIES } from '@civicmind/shared/dist/constants/categories';

const MOCK_MAP_POINTS = [
  { _id: '1', ticketId: 'CM-2026-0001', lat: 28.5910, lng: 77.0585, category: 'pothole', severity: 'critical', title: 'Massive Pothole DPS entrance', status: 'assigned' },
  { _id: '2', ticketId: 'CM-2026-0002', lat: 28.5702, lng: 77.0630, category: 'sewage', severity: 'high', title: 'Sewage drain rupture Block A', status: 'in_progress' },
  { _id: '3', ticketId: 'CM-2026-0003', lat: 28.5862, lng: 77.0545, category: 'streetlight', severity: 'high', title: 'Streetlights out Park Ave', status: 'verified' },
  { _id: '4', ticketId: 'CM-2026-0004', lat: 28.5630, lng: 77.0420, category: 'garbage', severity: 'medium', title: 'Illegal waste dump Sector 23', status: 'submitted' },
  { _id: '5', ticketId: 'CM-2026-0005', lat: 28.5801, lng: 77.0725, category: 'water_leak', severity: 'high', title: 'Burst Water pipeline ATM', status: 'resolved' }
];

export default function IncidentMapPage() {
  const [selectedPoint, setSelectedPoint] = useState<any>(MOCK_MAP_POINTS[0]);
  const [filterCategory, setFilterCategory] = useState('');
  
  const { data: points = [] } = useQuery({
    queryKey: ['map-points'],
    queryFn: async () => {
      try {
        const response = await api.get('/issues');
        if (response.data && response.data.success) {
          return response.data.data.map((item: any) => ({
            _id: item._id,
            ticketId: item.ticketId,
            lat: item.location?.coordinates?.[1] || 28.5833,
            lng: item.location?.coordinates?.[0] || 77.0667,
            category: item.aiAnalysis?.category || 'other',
            severity: item.aiAnalysis?.severity || 'low',
            title: item.title,
            status: item.status
          }));
        }
        return MOCK_MAP_POINTS;
      } catch (err) {
        return MOCK_MAP_POINTS;
      }
    }
  });

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'critical': return 'text-red-755 bg-red-50 border-red-200';
      case 'high': return 'text-orange-755 bg-orange-50 border-orange-200';
      case 'medium': return 'text-amber-755 bg-amber-50 border-amber-200';
      default: return 'text-green-755 bg-green-50 border-green-200';
    }
  };

  const displayedPoints = filterCategory
    ? points.filter((p: any) => p.category === filterCategory)
    : points;

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col lg:flex-row gap-6 text-slate-800">
      
      {/* Sidebar List panel */}
      <div className="w-full lg:w-80 flex flex-col gap-4 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm overflow-hidden shrink-0">
        <div className="text-left border-b border-slate-100 pb-3">
          <h2 className="text-sm font-extrabold text-[#0b2240] uppercase tracking-wide">Grievance registry</h2>
          <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">Select coordinates to review below.</p>
        </div>

        {/* Filter select */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-500 focus:outline-none"
        >
          <option value="">All Categories</option>
          {ISSUE_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>

        {/* Incidents items list */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {displayedPoints.map((pt: any) => {
            const isSelected = selectedPoint?._id === pt._id;
            const catConfig = ISSUE_CATEGORIES.find((c) => c.id === pt.category);
            return (
              <button
                key={pt._id}
                onClick={() => setSelectedPoint(pt)}
                className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5 cursor-pointer ${
                  isSelected 
                    ? 'bg-blue-50 border-blue-200 text-blue-755' 
                    : 'bg-white border-slate-200 hover:border-slate-350 text-slate-550'
                }`}
              >
                <MapPin className={`h-4.5 w-4.5 shrink-0 mt-0.5 ${isSelected ? 'text-[#2563eb]' : 'text-slate-400'}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-[9px] text-slate-500 bg-slate-50 px-1 border border-slate-150 rounded">{pt.ticketId}</span>
                    <span className={`text-[8px] font-extrabold uppercase px-1.5 border rounded-full ${getSeverityColor(pt.severity)}`}>
                      {pt.severity}
                    </span>
                  </div>
                  <p className="font-bold truncate text-[#0b2240]">{pt.title}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Map Panel */}
      <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm relative">
        {/* Map Header */}
        <div className="p-4 border-b border-slate-200 bg-[#f8fafc] flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 rounded-lg">
              <MapIcon className="h-4 w-4 text-[#2563eb]" />
            </div>
            <span className="text-xs font-extrabold text-[#0b2240] uppercase tracking-wide">Incident Dispatch Command Grid</span>
          </div>
          <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">Zone: Dwarka Subcity, Delhi</span>
        </div>

        {/* Map Canvas body */}
        <div className="flex-1 relative flex items-center justify-center bg-slate-50 overflow-hidden select-none">
          {/* Simulated grid lines */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `
                radial-gradient(circle, var(--color-indigo-500) 1px, transparent 1px),
                linear-gradient(to right, rgba(99,102,241,0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(99,102,241,0.05) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px, 40px 40px, 40px 40px',
              backgroundPosition: 'center center'
            }}
          />

          {/* Render mapped coordinate pins */}
          {displayedPoints.map((pt: any) => {
            const isSelected = selectedPoint?._id === pt._id;
            const xOffset = ((pt.lng - 77.0400) / 0.04) * 80;
            const yOffset = ((pt.lat - 28.5600) / 0.04) * 80;

            const getPinColor = (sev: string) => {
              if (sev === 'critical') return 'from-red-500 to-red-700 shadow-red-500/10 text-white';
              if (sev === 'high') return 'from-orange-500 to-orange-700 shadow-orange-500/10 text-white';
              return 'from-amber-400 to-amber-600 shadow-amber-500/10 text-white';
            };

            return (
              <button
                key={pt._id}
                onClick={() => setSelectedPoint(pt)}
                className="absolute flex flex-col items-center group/pin focus:outline-none transition-all z-10 cursor-pointer"
                style={{ left: `${xOffset}%`, bottom: `${yOffset}%` }}
              >
                {/* Floating label */}
                <span className="hidden group-hover/pin:inline-block absolute bottom-8 bg-[#0b2240] border border-[#0b2240] text-[9px] font-bold text-white py-1 px-2 rounded-lg whitespace-nowrap shadow-lg">
                  {pt.ticketId}: {pt.title.slice(0, 20)}...
                </span>

                {/* Glowing ring if selected */}
                {isSelected && (
                  <div className="absolute h-9 w-9 border border-[#2563eb]/40 rounded-full animate-ping -top-1" />
                )}

                {/* Main pin marker */}
                <div className={`h-6.5 w-6.5 rounded-full bg-gradient-to-br flex items-center justify-center shadow-md border border-white ${getPinColor(pt.severity)} ${
                  isSelected ? 'scale-125' : 'hover:scale-110'
                } transition-all`}>
                  <MapPin className="h-3.5 w-3.5" />
                </div>
              </button>
            );
          })}

          {/* Compass grid asset */}
          <div className="absolute top-4 right-4 p-3 bg-white border border-slate-200 rounded-xl text-[9px] font-mono text-slate-500 flex items-center gap-1.5 shadow-xs">
            <Compass className="h-4 w-4 text-[#2563eb]" />
            <span>N 28° 35' 0" E 77° 4' 0"</span>
          </div>
        </div>

        {/* Selected Pin Details Overlay Card */}
        {selectedPoint && (
          <div className="absolute bottom-4 inset-x-4 bg-white border border-slate-200 rounded-2xl p-4 flex gap-4 items-center shadow-xl animate-in slide-in-from-bottom-2 duration-300">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#2563eb] border border-blue-100 flex items-center justify-center shrink-0">
              <Crosshair className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-mono font-bold text-[9px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                  {selectedPoint.ticketId}
                </span>
                <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 border rounded-full ${getSeverityColor(selectedPoint.severity)}`}>
                  {selectedPoint.severity}
                </span>
              </div>
              <h4 className="text-xs font-extrabold text-[#0b2240] truncate">{selectedPoint.title}</h4>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5 font-bold">Lat: {selectedPoint.lat.toFixed(5)}, Lng: {selectedPoint.lng.toFixed(5)}</p>
            </div>
            <Link
              href={`/officer/issues/${selectedPoint._id}`}
              className="px-4 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold rounded-xl text-[10px] active:scale-98 transition-all shrink-0 flex items-center gap-1 shadow-sm uppercase tracking-wide"
            >
              <span>Dispatch Panel</span>
              <Eye className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
