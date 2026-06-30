'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import {
  Trophy,
  Award,
  Star,
  Shield,
  Medal,
  TrendingUp,
  CheckCircle,
  Target,
  Crown,
} from 'lucide-react';

// ─── Mock Data ───────────────────────────────────────────────────────

const leaderboardData = [
  { rank: 1, name: 'Commissioner Meera Sen', points: 900, issues: 45, level: 'Platinum' as const },
  { rank: 2, name: 'Inspector Vikram Rathore', points: 450, issues: 28, level: 'Gold' as const },
  { rank: 3, name: 'Priya Reddy', points: 320, issues: 18, level: 'Gold' as const },
  { rank: 4, name: 'Rahul Verma', points: 280, issues: 15, level: 'Silver' as const },
  { rank: 5, name: 'Aarav Sharma (You)', points: 180, issues: 8, level: 'Silver' as const },
  { rank: 6, name: 'Neha Gupta', points: 150, issues: 7, level: 'Silver' as const },
  { rank: 7, name: 'Amit Patil', points: 120, issues: 6, level: 'Bronze' as const },
  { rank: 8, name: 'Kavita Joshi', points: 95, issues: 5, level: 'Bronze' as const },
  { rank: 9, name: 'Sanjay Kumar', points: 60, issues: 3, level: 'Bronze' as const },
  { rank: 10, name: 'Deepa Nair', points: 30, issues: 2, level: 'Bronze' as const },
];

const badges = [
  { emoji: '🏅', title: 'First Report', desc: 'Filed your first community issue', earned: true },
  { emoji: '✅', title: 'Community Verifier', desc: 'Verified 3 reports from other citizens', earned: true },
  { emoji: '🔥', title: 'Trending Reporter', desc: 'One of your issues got 25+ upvotes', earned: true },
  { emoji: '🏆', title: 'Problem Solver', desc: '5 of your reports led to resolution', earned: false },
  { emoji: '⭐', title: 'Top Contributor', desc: 'Reached Gold tier (300+ points)', earned: false },
  { emoji: '💎', title: 'Civic Champion', desc: 'Reached Platinum tier (1000+ points)', earned: false },
];

const levelTiers = [
  { name: 'Bronze', range: '0 – 99 pts', color: 'bg-orange-400' },
  { name: 'Silver', range: '100 – 299 pts', color: 'bg-blue-400' },
  { name: 'Gold', range: '300 – 999 pts', color: 'bg-amber-400' },
  { name: 'Platinum', range: '1 000+ pts', color: 'bg-purple-500' },
];

// ─── Helpers ─────────────────────────────────────────────────────────

const levelBadgeStyles: Record<string, string> = {
  Platinum: 'bg-purple-100 text-purple-700',
  Gold: 'bg-amber-100 text-amber-700',
  Silver: 'bg-blue-100 text-blue-700',
  Bronze: 'bg-orange-100 text-orange-700',
};

function LevelBadge({ level }: { level: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide ${levelBadgeStyles[level] ?? 'bg-slate-100 text-slate-600'}`}
    >
      {level}
    </span>
  );
}

function RankCell({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="h-5 w-5 text-amber-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-slate-400" />;
  if (rank === 3) return <Award className="h-5 w-5 text-orange-400" />;
  return <span className="text-sm font-semibold text-slate-500">#{rank}</span>;
}

// ─── Helpers ─────────────────────────────────────────────────────────

const getLevel = (score: number) => {
  if (score >= 1000) return 'Platinum';
  if (score >= 300) return 'Gold';
  if (score >= 100) return 'Silver';
  return 'Bronze';
};

const getNextLevelPoints = (score: number) => {
  if (score >= 1000) return 1000;
  if (score >= 300) return 1000;
  if (score >= 100) return 300;
  return 100;
};

const getLevelTitle = (score: number) => {
  if (score >= 1000) return 'Platinum Champion';
  if (score >= 300) return 'Gold Problem Solver';
  if (score >= 100) return 'Silver Contributor';
  return 'Bronze Citizen';
};

export default function LeaderboardPage() {
  const user = useAuthStore((s) => s.user);
  const userName = user?.displayName ?? 'Aarav Sharma';
  const currentPoints = user?.reputationScore ?? 180;
  const issuesReported = user?.issuesReported ?? 2;
  const issuesResolved = user?.issuesResolved ?? 1;

  // Real leaderboard API query
  const { data: serverLeaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      try {
        const response = await api.get('/auth/leaderboard');
        if (response.data && response.data.success) {
          return response.data.data;
        }
        return null;
      } catch (err) {
        console.warn('⚠️ Server offline. Displaying local mock leaderboard data.');
        return null;
      }
    }
  });

  // Calculate dynamic levels and progress
  const level = getLevel(currentPoints);
  const levelTitle = getLevelTitle(currentPoints);
  const nextLevel = getNextLevelPoints(currentPoints);
  const progressPercent = Math.min(100, Math.round((currentPoints / nextLevel) * 100));

  // Determine final list of users to display
  let displayedLeaderboard = leaderboardData;
  if (serverLeaderboard && Array.isArray(serverLeaderboard) && serverLeaderboard.length > 0) {
    displayedLeaderboard = serverLeaderboard.map((u: any, idx: number) => ({
      rank: idx + 1,
      name: u.displayName,
      points: u.reputationScore,
      issues: u.issuesReported || 0,
      level: getLevel(u.reputationScore) as any,
      isCurrentUser: u._id === user?._id
    }));
  } else {
    // Local enrichment with user's current points
    displayedLeaderboard = leaderboardData.map((row) => {
      if (row.rank === 5) {
        return {
          ...row,
          name: `${userName} (You)`,
          points: currentPoints,
          issues: issuesReported,
          level: level as any
        };
      }
      return row;
    }).sort((a, b) => b.points - a.points).map((row, idx) => ({
      ...row,
      rank: idx + 1
    }));
  }

  // Find user's dynamic rank
  const myRank = displayedLeaderboard.find(row => 
    row.name.includes('(You)') || row.name === userName || (row as any).isCurrentUser
  )?.rank ?? 5;

  // Badge dynamic earned states
  const dynamicBadges = [
    { emoji: '🏅', title: 'First Report', desc: 'Filed your first community issue', earned: issuesReported >= 1 },
    { emoji: '✅', title: 'Community Verifier', desc: 'Verified 3 reports from other citizens', earned: currentPoints >= 25 },
    { emoji: '🔥', title: 'Trending Reporter', desc: 'One of your issues got 25+ upvotes', earned: currentPoints >= 50 },
    { emoji: '🏆', title: 'Problem Solver', desc: '5 of your reports led to resolution', earned: issuesResolved >= 5 },
    { emoji: '⭐', title: 'Top Contributor', desc: 'Reached Gold tier (300+ points)', earned: currentPoints >= 300 },
    { emoji: '💎', title: 'Civic Champion', desc: 'Reached Platinum tier (1000+ points)', earned: currentPoints >= 1000 },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="mb-8 text-left">
          <div className="flex items-center gap-3 mb-1">
            <Trophy className="h-7 w-7 text-[#2563eb]" />
            <h1 className="text-2xl font-black tracking-tight text-[#0b2240]">
              Community Leaderboard
            </h1>
          </div>
          <p className="text-sm text-slate-500 ml-10">
            Recognizing top community contributors who make neighborhoods safer.
          </p>
        </div>

        {/* ── Current User Progress Card ──────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 mb-8 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2563eb] text-white text-lg font-bold">
                {userName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-[#0b2240]">{userName}</p>
                <div className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-blue-500" />
                  <span className="text-xs font-semibold text-blue-600">{levelTitle}</span>
                  <span className="text-[10px] text-slate-400 font-medium">·</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{currentPoints} pts</span>
                  <span className="text-[10px] text-slate-400 font-medium">·</span>
                  <span className="text-[10px] text-slate-400 font-semibold">Rank #{myRank}</span>
                </div>
              </div>
            </div>
            <LevelBadge level={level} />
          </div>

          {/* Progress bar */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500">
                Progress to {level === 'Bronze' ? 'Silver' : level === 'Silver' ? 'Gold' : 'Platinum'}
              </span>
              <span className="text-[11px] font-bold text-[#0b2240]">
                {currentPoints} / {nextLevel}
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#2563eb] to-blue-400 transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {currentPoints < 1000 && (
              <p className="text-[10px] text-slate-400 mt-1 font-medium">
                {nextLevel - currentPoints} points to reach next tier
              </p>
            )}
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 divide-x divide-slate-100">
            <div className="flex flex-col items-center py-2">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Target className="h-3.5 w-3.5 text-[#2563eb]" />
                <span className="text-lg font-black text-[#0b2240]">{issuesReported}</span>
              </div>
              <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500">
                Issues Reported
              </span>
            </div>
            <div className="flex flex-col items-center py-2">
              <div className="flex items-center gap-1.5 mb-0.5">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-lg font-black text-[#0b2240]">
                  {Math.max(0, Math.floor((currentPoints - (issuesReported * 10)) / 5))}
                </span>
              </div>
              <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500">
                Verifications
              </span>
            </div>
            <div className="flex flex-col items-center py-2">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Star className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-lg font-black text-[#0b2240]">{issuesResolved}</span>
              </div>
              <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500">
                Resolved
              </span>
            </div>
          </div>
        </div>

        {/* ── Badge Achievement Grid ─────────────────────────────── */}
        <div className="mb-8 text-left">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-[#0b2240] mb-4 flex items-center gap-2">
            <Award className="h-4 w-4 text-[#2563eb]" />
            Badge Achievements
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dynamicBadges.map((badge) => (
              <div
                key={badge.title}
                className={`rounded-3xl border p-5 shadow-sm transition-all text-left ${
                  badge.earned
                    ? 'bg-emerald-50/50 border-emerald-250'
                    : 'bg-slate-50 border-slate-200 opacity-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{badge.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#0b2240] truncate">{badge.title}</p>
                    <p className="text-[11px] text-slate-500 leading-snug mt-0.5 font-semibold">{badge.desc}</p>
                    <span
                      className={`mt-2 inline-block text-[9px] uppercase font-bold tracking-wider ${
                        badge.earned ? 'text-emerald-700 font-extrabold' : 'text-slate-400 font-semibold'
                      }`}
                    >
                      {badge.earned ? '✓ Earned' : '🔒 Locked'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Main Content: Table + Tier Card ────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Leaderboard Table */}
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 pt-6 pb-4 text-left">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-[#0b2240] flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#2563eb]" />
                Top Community Contributors
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-t border-b border-slate-100">
                    <th className="px-6 py-3 text-[9px] uppercase font-bold tracking-wider text-slate-500 w-16">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-[9px] uppercase font-bold tracking-wider text-slate-500">
                      Name
                    </th>
                    <th className="px-6 py-3 text-[9px] uppercase font-bold tracking-wider text-slate-500 text-right">
                      Points
                    </th>
                    <th className="px-6 py-3 text-[9px] uppercase font-bold tracking-wider text-slate-500 text-right">
                      Issues
                    </th>
                    <th className="px-6 py-3 text-[9px] uppercase font-bold tracking-wider text-slate-500 text-center">
                      Level
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayedLeaderboard.map((row) => {
                    const isCurrentUser = row.name.includes('(You)') || row.name === userName || (row as any).isCurrentUser;
                    return (
                      <tr
                        key={row.rank}
                        className={`border-b border-slate-100 last:border-b-0 transition-colors ${
                          isCurrentUser ? 'bg-blue-50/70' : 'hover:bg-slate-50/60'
                        }`}
                      >
                        <td className="px-6 py-3.5">
                          <div className="flex items-center justify-center w-8">
                            <RankCell rank={row.rank} />
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <span
                            className={`text-sm font-bold ${
                              isCurrentUser ? 'text-[#2563eb]' : 'text-[#0b2240]'
                            }`}
                          >
                            {row.name}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <span className="text-sm font-black text-[#0b2240]">
                            {row.points.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <span className="text-sm text-slate-600 font-semibold">{row.issues}</span>
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <LevelBadge level={row.level} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Level Tiers Info Card */}
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl shadow-sm p-6 h-fit text-left">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#0b2240] mb-5 flex items-center gap-2">
              <Crown className="h-4 w-4 text-[#2563eb]" />
              Level Tiers
            </h3>
            <div className="space-y-4">
              {levelTiers.map((tier) => (
                <div key={tier.name} className="flex items-center gap-3">
                  <span className={`h-3 w-3 rounded-full ${tier.color} flex-shrink-0`} />
                  <div>
                    <p className="text-sm font-bold text-[#0b2240]">{tier.name}</p>
                    <p className="text-[11px] text-slate-500 font-semibold">{tier.range}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100">
              <p className="text-[9px] uppercase font-bold tracking-wider text-slate-500 mb-2">
                How to Earn Points
              </p>
              <ul className="space-y-2 font-semibold">
                <li className="flex items-start gap-2">
                  <Target className="h-3.5 w-3.5 text-[#2563eb] mt-0.5 flex-shrink-0" />
                  <span className="text-[11px] text-slate-600 leading-snug">
                    <strong className="text-[#0b2240]">+10 pts</strong> — Report an issue
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-[11px] text-slate-600 leading-snug">
                    <strong className="text-[#0b2240]">+5 pts</strong> — Verify a report
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span className="text-[11px] text-slate-600 leading-snug">
                    <strong className="text-[#0b2240]">+25 pts</strong> — Issue resolved
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
