// ============================================
// SEVERITY CONFIGURATION
// ============================================

import type { IssueSeverity } from '../types/issue';

export interface SeverityConfig {
  id: IssueSeverity;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  responseTimeHours: number;
  description: string;
  priority: number; // Higher = more urgent
}

export const SEVERITY_LEVELS: SeverityConfig[] = [
  {
    id: 'critical',
    label: 'Critical',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    icon: '🔴',
    responseTimeHours: 4,
    description: 'Immediate danger to life or safety. Requires emergency response.',
    priority: 4,
  },
  {
    id: 'high',
    label: 'High',
    color: '#f97316',
    bgColor: 'rgba(249, 115, 22, 0.15)',
    borderColor: 'rgba(249, 115, 22, 0.3)',
    icon: '🟠',
    responseTimeHours: 24,
    description: 'Major inconvenience or risk of escalation. Requires prompt attention.',
    priority: 3,
  },
  {
    id: 'medium',
    label: 'Medium',
    color: '#eab308',
    bgColor: 'rgba(234, 179, 8, 0.15)',
    borderColor: 'rgba(234, 179, 8, 0.3)',
    icon: '🟡',
    responseTimeHours: 72,
    description: 'Moderate impact on daily life. Scheduled resolution.',
    priority: 2,
  },
  {
    id: 'low',
    label: 'Low',
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
    icon: '🟢',
    responseTimeHours: 168,
    description: 'Minor cosmetic or non-urgent issue. Resolved in regular maintenance.',
    priority: 1,
  },
];

export const SEVERITY_MAP = new Map(
  SEVERITY_LEVELS.map((s) => [s.id, s])
);

export function getSeverityConfig(id: IssueSeverity): SeverityConfig {
  return SEVERITY_MAP.get(id) ?? SEVERITY_LEVELS[2]; // Default to medium
}

export function getSeverityColor(id: IssueSeverity): string {
  return SEVERITY_MAP.get(id)?.color ?? '#eab308';
}
