'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Shield, Briefcase, User, Search, Award } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

// Mock users list fallback database
const MOCK_USERS = [
  { _id: '1', displayName: 'Aarav Sharma', email: 'citizen@civicmind.ai', role: 'citizen', reputationScore: 180, active: true },
  { _id: '2', displayName: 'Inspector Vikram Rathore', email: 'officer@civicmind.ai', role: 'officer', reputationScore: 450, active: true },
  { _id: '3', displayName: 'Commissioner Meera Sen', email: 'admin@civicmind.ai', role: 'admin', reputationScore: 900, active: true },
  { _id: '4', displayName: 'Neha Gupta', email: 'neha@gmail.com', role: 'citizen', reputationScore: 30, active: true },
  { _id: '5', displayName: 'Officer Amit Patil', email: 'amit@civicmind.ai', role: 'officer', reputationScore: 120, active: true }
];

export default function UserManagementPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [usersList, setUsersList] = useState(MOCK_USERS);

  // Fetch users query
  const { data: users = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      try {
        const response = await api.get('/admin/users');
        if (response.data && response.data.success) {
          return response.data.data;
        }
        return usersList;
      } catch (err) {
        return usersList;
      }
    }
  });

  // Modify user role mutation
  const changeRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: 'citizen' | 'officer' | 'admin' }) => {
      const response = await api.put(`/admin/users/${userId}/role`, { role: newRole });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User role updated successfully.');
    },
    onError: (err: any) => {
      // Local simulated response fallback
      toast.success('User role updated locally (Demo Mode).');
    }
  });

  const handleRoleChange = (userId: string, newRole: 'citizen' | 'officer' | 'admin') => {
    // Local simulation update
    const updated = usersList.map((u) => {
      if (u._id === userId) {
        return { ...u, role: newRole };
      }
      return u;
    });
    setUsersList(updated);
    
    // Trigger mutation
    changeRoleMutation.mutate({ userId, newRole });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4 text-purple-700 shrink-0" />;
      case 'officer': return <Briefcase className="h-4 w-4 text-[#2563eb] shrink-0" />;
      default: return <User className="h-4 w-4 text-emerald-700 shrink-0" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'officer': return 'bg-blue-50 text-[#2563eb] border-blue-200';
      default: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  const filteredUsers = users.filter((u: any) => 
    u.displayName.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-slate-800">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 text-left">
        <h1 className="text-2xl font-black tracking-tight text-[#0b2240]">User Roles Registry</h1>
        <p className="text-slate-550 text-xs mt-1 font-semibold">Audit municipal user accounts, adjust system permissions, and verify citizen reputations.</p>
      </div>

      {/* Control Bar */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search users by name or email address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-800 focus:outline-none focus:border-[#2563eb]"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-x-auto text-left">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-100">
              <th className="py-3 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-450">Identity</th>
              <th className="py-3 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-450">Role Status</th>
              <th className="py-3 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-450">Contribution Index</th>
              <th className="py-3 px-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-450">Access Controls</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map((u: any) => (
              <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[#0b2240] text-sm">
                      {u.displayName[0]}
                    </div>
                    <div>
                      <p className="font-extrabold text-[#0b2240]">{u.displayName}</p>
                      <p className="text-[10px] text-slate-500 font-semibold">{u.email}</p>
                    </div>
                  </div>
                </td>

                <td className="py-4 px-3">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 border rounded-full text-[9px] font-extrabold uppercase tracking-wide ${getRoleBadge(u.role)}`}>
                    {getRoleIcon(u.role)}
                    <span>{u.role}</span>
                  </span>
                </td>

                <td className="py-4 px-3">
                  <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                    <Award className="h-3.5 w-3.5" />
                    <span>{u.reputationScore} Points</span>
                  </div>
                </td>

                <td className="py-4 px-3 text-right">
                  <div className="flex justify-end gap-1.5">
                    {u.role !== 'citizen' && (
                      <button
                        onClick={() => handleRoleChange(u._id, 'citizen')}
                        className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[10px] font-bold text-emerald-700 rounded-lg transition-all cursor-pointer"
                      >
                        Make Citizen
                      </button>
                    )}
                    {u.role !== 'officer' && (
                      <button
                        onClick={() => handleRoleChange(u._id, 'officer')}
                        className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[10px] font-bold text-[#2563eb] rounded-lg transition-all cursor-pointer"
                      >
                        Make Officer
                      </button>
                    )}
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => handleRoleChange(u._id, 'admin')}
                        className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-[10px] font-bold text-purple-700 rounded-lg transition-all cursor-pointer"
                      >
                        Make Admin
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
