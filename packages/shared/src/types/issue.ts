// ============================================
// ISSUE TYPES
// ============================================

import type { GeoPoint } from './user';

export type IssueCategory =
  | 'pothole'
  | 'garbage'
  | 'water_leak'
  | 'sewage'
  | 'streetlight'
  | 'road_damage'
  | 'fallen_tree'
  | 'illegal_construction'
  | 'traffic_signal'
  | 'drainage'
  | 'public_property_damage'
  | 'noise_pollution'
  | 'air_pollution'
  | 'encroachment'
  | 'other';

export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low';

export type IssueStatus =
  | 'submitted'
  | 'verified'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'rejected'
  | 'closed';

export interface IImageAnalysis {
  detectedObjects: string[];
  safetyAssessment: string;
  estimatedSize?: string;
}

export interface IAIAnalysis {
  category: IssueCategory;
  subCategory?: string;
  severity: IssueSeverity;
  confidence: number;
  description: string;
  suggestions: string[];
  tags: string[];
  imageAnalysis: IImageAnalysis;
}

export interface IDuplicateInfo {
  isDuplicate: boolean;
  parentIssue?: string;
  duplicateOf?: string[];
  similarityScore?: number;
  checkedAt: string;
}

export interface IPriorityFactors {
  severity: number;
  nearHospital: boolean;
  nearSchool: boolean;
  trafficDensity: number;
  populationDensity: number;
  previousComplaints: number;
  weatherImpact: number;
  ageOfIssue: number;
  communityVotes: number;
}

export interface IPriority {
  score: number;
  level: IssueSeverity;
  factors: IPriorityFactors;
  reasoning?: string;
  recommendedResponseTime?: string;
  computedAt: string;
}

export interface IStatusHistoryEntry {
  status: IssueStatus;
  changedBy: string;
  changedAt: string;
  note?: string;
}

export interface IIssue {
  _id: string;
  ticketId: string;
  reportedBy: string;

  // Content
  title: string;
  description: string;
  images: string[];
  videos?: string[];
  voiceNote?: string;

  // Location
  location: GeoPoint;
  address: string;
  ward?: string;
  pincode?: string;

  // AI Analysis
  aiAnalysis?: IAIAnalysis;
  duplicateInfo?: IDuplicateInfo;
  priority?: IPriority;

  // Status
  status: IssueStatus;
  statusHistory: IStatusHistoryEntry[];

  // Assignment
  assignedTo?: string;
  department?: string;

  // Community
  upvotes: number;
  verifications: number;
  commentCount: number;
  hasVoted?: boolean; // Client-side enrichment
  hasVerified?: boolean; // Client-side enrichment

  // Reporter info (denormalized)
  reporterName?: string;
  reporterAvatar?: string;

  // Timestamps
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IIssueCreatePayload {
  title: string;
  description: string;
  images: string[];
  videos?: string[];
  voiceNote?: string;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  ward?: string;
  pincode?: string;
}

export interface IIssueFilters {
  status?: IssueStatus[];
  category?: IssueCategory[];
  severity?: IssueSeverity[];
  department?: string;
  assignedTo?: string;
  reportedBy?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
