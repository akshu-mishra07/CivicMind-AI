// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface IAnalyticsOverview {
  totalIssues: number;
  totalResolved: number;
  totalPending: number;
  totalInProgress: number;
  avgResponseTimeHours: number;
  resolutionRate: number;
  todayIssues: number;
  weekIssues: number;
  monthIssues: number;
  criticalIssues: number;
  topCategories: Array<{ category: string; count: number }>;
  departmentPerformance: Array<{
    departmentId: string;
    departmentName: string;
    totalIssues: number;
    resolvedIssues: number;
    avgResponseTimeHours: number;
    resolutionRate: number;
  }>;
  trendData: Array<{
    date: string;
    submitted: number;
    resolved: number;
  }>;
}

export interface IHeatmapPoint {
  lat: number;
  lng: number;
  weight: number;
  category?: string;
}

// ---- Comment ----
export interface IComment {
  _id: string;
  issue: string;
  author: string;
  authorName: string;
  authorAvatar?: string;
  authorRole: string;
  content: string;
  images?: string[];
  isOfficial: boolean;
  parentComment?: string;
  isAIGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---- Vote ----
export interface IVote {
  _id: string;
  issue: string;
  user: string;
  createdAt: string;
}

// ---- Notification ----
export type NotificationType =
  | 'status_update'
  | 'assignment'
  | 'comment'
  | 'vote'
  | 'ai_update'
  | 'resolution'
  | 'system';

export interface INotification {
  _id: string;
  recipient: string;
  type: NotificationType;
  title: string;
  message: string;
  issue?: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
}

// ---- Department ----
export interface IDepartment {
  _id: string;
  name: string;
  code: string;
  description: string;
  categories: string[];
  headOfficer?: string;
  officerCount: number;
  contactEmail: string;
  contactPhone: string;
  avgResponseTime: number;
  activeIssues: number;
  resolvedIssues: number;
  performanceScore: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---- Repair ----
export interface IRepair {
  _id: string;
  issue: string;
  plan: {
    summary: string;
    steps: Array<{
      order: number;
      description: string;
      estimatedDuration: string;
      resources: string[];
      status: 'pending' | 'in_progress' | 'completed';
    }>;
    estimatedCost: {
      min: number;
      max: number;
      currency: string;
      breakdown: Array<{ item: string; cost: number }>;
    };
    estimatedCompletion: string;
    requiredResources: string[];
    requiredPersonnel: string[];
    responsibleDepartment: string;
    safetyPrecautions?: string[];
    environmentalConsiderations?: string;
  };
  actualCost?: number;
  actualCompletion?: string;
  completionPercentage: number;
  beforeImages: string[];
  afterImages: string[];
  notes: string[];
  generatedBy: 'ai' | 'manual';
  generatedAt: string;
  updatedAt: string;
}
