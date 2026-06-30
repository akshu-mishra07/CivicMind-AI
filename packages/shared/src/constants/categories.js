"use strict";
// ============================================
// ISSUE CATEGORIES
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.CATEGORY_MAP = exports.ISSUE_CATEGORIES = void 0;
exports.getCategoryConfig = getCategoryConfig;
exports.getCategoryLabel = getCategoryLabel;
exports.getCategoryDepartment = getCategoryDepartment;
exports.ISSUE_CATEGORIES = [
    {
        id: 'pothole',
        label: 'Pothole',
        icon: '🕳️',
        color: '#ef4444',
        department: 'ROADS',
        description: 'Road potholes, cracks, and surface damage',
    },
    {
        id: 'garbage',
        label: 'Garbage / Waste',
        icon: '🗑️',
        color: '#f97316',
        department: 'SANITATION',
        description: 'Garbage accumulation, overflowing bins, illegal dumping',
    },
    {
        id: 'water_leak',
        label: 'Water Leak',
        icon: '💧',
        color: '#3b82f6',
        department: 'WATER',
        description: 'Water pipe leaks, broken taps, water wastage',
    },
    {
        id: 'sewage',
        label: 'Sewage',
        icon: '🚰',
        color: '#78716c',
        department: 'WATER',
        description: 'Sewage overflow, blocked drains, sewage contamination',
    },
    {
        id: 'streetlight',
        label: 'Streetlight',
        icon: '💡',
        color: '#eab308',
        department: 'ELECTRICAL',
        description: 'Non-functional streetlights, flickering lights',
    },
    {
        id: 'road_damage',
        label: 'Road Damage',
        icon: '🛣️',
        color: '#dc2626',
        department: 'ROADS',
        description: 'Road cracks, broken dividers, damaged barriers',
    },
    {
        id: 'fallen_tree',
        label: 'Fallen Tree',
        icon: '🌳',
        color: '#22c55e',
        department: 'PARKS',
        description: 'Fallen trees, dangerous branches, tree obstruction',
    },
    {
        id: 'illegal_construction',
        label: 'Illegal Construction',
        icon: '🏗️',
        color: '#a855f7',
        department: 'PLANNING',
        description: 'Unauthorized construction, building violations',
    },
    {
        id: 'traffic_signal',
        label: 'Traffic Signal',
        icon: '🚦',
        color: '#f59e0b',
        department: 'TRAFFIC',
        description: 'Malfunctioning traffic signals, missing signs',
    },
    {
        id: 'drainage',
        label: 'Drainage',
        icon: '🌊',
        color: '#06b6d4',
        department: 'WATER',
        description: 'Blocked drains, waterlogging, flooding',
    },
    {
        id: 'public_property_damage',
        label: 'Public Property',
        icon: '🏛️',
        color: '#8b5cf6',
        department: 'GENERAL',
        description: 'Damage to public property, benches, fences, bus stops',
    },
    {
        id: 'noise_pollution',
        label: 'Noise Pollution',
        icon: '🔊',
        color: '#ec4899',
        department: 'ENVIRONMENT',
        description: 'Excessive noise, illegal loudspeakers, construction noise',
    },
    {
        id: 'air_pollution',
        label: 'Air Pollution',
        icon: '🌫️',
        color: '#6b7280',
        department: 'ENVIRONMENT',
        description: 'Smoke, industrial emissions, burning waste',
    },
    {
        id: 'encroachment',
        label: 'Encroachment',
        icon: '🚧',
        color: '#d97706',
        department: 'PLANNING',
        description: 'Illegal encroachment on public land, footpath blockage',
    },
    {
        id: 'other',
        label: 'Other',
        icon: '📋',
        color: '#64748b',
        department: 'GENERAL',
        description: 'Other civic issues not listed above',
    },
];
exports.CATEGORY_MAP = new Map(exports.ISSUE_CATEGORIES.map((c) => [c.id, c]));
function getCategoryConfig(id) {
    return exports.CATEGORY_MAP.get(id);
}
function getCategoryLabel(id) {
    return exports.CATEGORY_MAP.get(id)?.label ?? id;
}
function getCategoryDepartment(id) {
    return exports.CATEGORY_MAP.get(id)?.department ?? 'GENERAL';
}
//# sourceMappingURL=categories.js.map