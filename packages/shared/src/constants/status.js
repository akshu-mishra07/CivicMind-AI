"use strict";
// ============================================
// STATUS CONFIGURATION
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.STATUS_FLOW = exports.STATUS_MAP = exports.ISSUE_STATUSES = void 0;
exports.getStatusConfig = getStatusConfig;
exports.getStatusColor = getStatusColor;
exports.getNextStatuses = getNextStatuses;
exports.ISSUE_STATUSES = [
    {
        id: 'submitted',
        label: 'Submitted',
        color: '#94a3b8',
        bgColor: 'rgba(148, 163, 184, 0.15)',
        borderColor: 'rgba(148, 163, 184, 0.3)',
        icon: '📩',
        description: 'Issue has been submitted and is awaiting AI verification.',
        order: 1,
    },
    {
        id: 'verified',
        label: 'Verified',
        color: '#3b82f6',
        bgColor: 'rgba(59, 130, 246, 0.15)',
        borderColor: 'rgba(59, 130, 246, 0.3)',
        icon: '✅',
        description: 'AI has verified and classified the issue.',
        order: 2,
    },
    {
        id: 'assigned',
        label: 'Assigned',
        color: '#8b5cf6',
        bgColor: 'rgba(139, 92, 246, 0.15)',
        borderColor: 'rgba(139, 92, 246, 0.3)',
        icon: '👤',
        description: 'Issue has been assigned to a municipal officer.',
        order: 3,
    },
    {
        id: 'in_progress',
        label: 'In Progress',
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.15)',
        borderColor: 'rgba(245, 158, 11, 0.3)',
        icon: '🔧',
        description: 'Repair work is actively in progress.',
        order: 4,
    },
    {
        id: 'resolved',
        label: 'Resolved',
        color: '#22c55e',
        bgColor: 'rgba(34, 197, 94, 0.15)',
        borderColor: 'rgba(34, 197, 94, 0.3)',
        icon: '🎉',
        description: 'The issue has been successfully resolved.',
        order: 5,
    },
    {
        id: 'rejected',
        label: 'Rejected',
        color: '#ef4444',
        bgColor: 'rgba(239, 68, 68, 0.15)',
        borderColor: 'rgba(239, 68, 68, 0.3)',
        icon: '❌',
        description: 'The issue has been rejected (duplicate, invalid, etc).',
        order: 6,
    },
    {
        id: 'closed',
        label: 'Closed',
        color: '#64748b',
        bgColor: 'rgba(100, 116, 139, 0.15)',
        borderColor: 'rgba(100, 116, 139, 0.3)',
        icon: '📁',
        description: 'The issue has been closed after resolution.',
        order: 7,
    },
];
exports.STATUS_MAP = new Map(exports.ISSUE_STATUSES.map((s) => [s.id, s]));
function getStatusConfig(id) {
    return exports.STATUS_MAP.get(id) ?? exports.ISSUE_STATUSES[0];
}
function getStatusColor(id) {
    return exports.STATUS_MAP.get(id)?.color ?? '#94a3b8';
}
exports.STATUS_FLOW = {
    submitted: ['verified', 'rejected'],
    verified: ['assigned', 'rejected'],
    assigned: ['in_progress', 'rejected'],
    in_progress: ['resolved'],
    resolved: ['closed'],
    rejected: ['submitted'], // Allow re-opening
    closed: [],
};
function getNextStatuses(current) {
    return exports.STATUS_FLOW[current] ?? [];
}
//# sourceMappingURL=status.js.map