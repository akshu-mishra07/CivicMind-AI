// ============================================
// APP CONSTANTS
// ============================================

export const APP_NAME = 'CivicMind AI';
export const APP_TAGLINE = 'AI-Powered Hyperlocal Community Problem Solver';
export const APP_DESCRIPTION =
  'Report community issues and let autonomous AI agents classify, prioritize, verify, plan, and track resolution.';

// Default map center (New Delhi, India)
export const DEFAULT_MAP_CENTER = {
  lat: 28.6139,
  lng: 77.209,
};

export const DEFAULT_MAP_ZOOM = 12;

// File upload limits
export const MAX_IMAGES = 5;
export const MAX_IMAGE_SIZE_MB = 10;
export const MAX_VIDEO_SIZE_MB = 50;
export const MAX_VOICE_SIZE_MB = 5;
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
export const ACCEPTED_AUDIO_TYPES = ['audio/webm', 'audio/mp4', 'audio/wav'];

// Pagination
export const DEFAULT_PAGE_SIZE = 20;

// Geospatial
export const NEARBY_RADIUS_METERS = 5000; // 5km default radius
export const DUPLICATE_CHECK_RADIUS_METERS = 500; // 500m for duplicate detection

// Dashboard
export const STATS_REFRESH_INTERVAL_MS = 60000; // 1 minute

// Animation durations
export const ANIMATION_DURATION = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  xslow: 0.8,
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  // Citizen
  REPORT: '/report',
  MY_REPORTS: '/my-reports',
  ISSUE_DETAIL: (id: string) => `/report/${id}`,
  COMMUNITY: '/community',
  ASSISTANT: '/assistant',
  // Officer
  OFFICER_DASHBOARD: '/officer/dashboard',
  OFFICER_ISSUES: '/officer/issues',
  OFFICER_ISSUE_DETAIL: (id: string) => `/officer/issues/${id}`,
  OFFICER_MAP: '/officer/map',
  OFFICER_ANALYTICS: '/officer/analytics',
  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_DEPARTMENTS: '/admin/departments',
  ADMIN_HEATMAPS: '/admin/heatmaps',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_REPORTS: '/admin/reports',
} as const;
