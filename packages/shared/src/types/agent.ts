// ============================================
// AI AGENT TYPES
// ============================================

import type { IssueCategory, IssueSeverity } from './issue';

// ---- Vision Agent ----
export interface IVisionAgentInput {
  images: string[]; // Base64 or GCS URLs
  userDescription?: string;
}

export interface IVisionAgentOutput {
  category: IssueCategory;
  subCategory?: string;
  severity: IssueSeverity;
  confidence: number;
  description: string;
  detectedObjects: string[];
  safetyAssessment: string;
  estimatedSize?: string;
  suggestions: string[];
  tags: string[];
}

// ---- Duplicate Detection Agent ----
export interface IDuplicateAgentInput {
  newIssue: {
    images: string[];
    description: string;
    location: { lat: number; lng: number };
    category: IssueCategory;
  };
  existingIssues: Array<{
    _id: string;
    images: string[];
    description: string;
    location: { lat: number; lng: number };
    category: IssueCategory;
    createdAt: string;
  }>;
}

export interface IDuplicateAgentOutput {
  isDuplicate: boolean;
  parentIssueId?: string;
  similarityScore: number;
  reasoning: string;
  visualSimilarity: number;
  descriptionSimilarity: number;
  locationProximityMeters: number;
}

// ---- Priority Agent ----
export interface IPriorityAgentInput {
  category: IssueCategory;
  severity: IssueSeverity;
  description: string;
  location: { lat: number; lng: number };
  upvotes: number;
  createdAt: string;
  nearbyPOIs: {
    hospitals: number;
    schools: number;
  };
  previousComplaintsInArea: number;
  trafficDensity?: number;
  populationDensity?: number;
}

export interface IPriorityAgentOutput {
  score: number;
  level: IssueSeverity;
  factors: {
    severity: number;
    nearHospital: boolean;
    nearSchool: boolean;
    trafficDensity: number;
    populationDensity: number;
    previousComplaints: number;
    weatherImpact: number;
    ageOfIssue: number;
    communityVotes: number;
  };
  reasoning: string;
  recommendedResponseTime: string;
}

// ---- Planning Agent ----
export interface IPlanningAgentInput {
  category: IssueCategory;
  severity: IssueSeverity;
  description: string;
  address: string;
  imageAnalysis: {
    detectedObjects: string[];
    estimatedSize?: string;
  };
  priorityScore: number;
}

export interface IRepairStep {
  order: number;
  description: string;
  estimatedDuration: string;
  resources: string[];
  status: 'pending' | 'in_progress' | 'completed';
}

export interface ICostBreakdown {
  item: string;
  cost: number;
}

export interface IPlanningAgentOutput {
  summary: string;
  steps: IRepairStep[];
  estimatedCost: {
    min: number;
    max: number;
    currency: string;
    breakdown: ICostBreakdown[];
  };
  estimatedCompletionDays: number;
  requiredResources: string[];
  requiredPersonnel: string[];
  responsibleDepartment: string;
  safetyPrecautions: string[];
  environmentalConsiderations?: string;
}

// ---- Citizen Assistant Agent ----
export interface IChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ICitizenAssistantInput {
  message: string;
  conversationHistory: IChatMessage[];
  userIssues: Array<{
    _id: string;
    ticketId: string;
    title: string;
    status: string;
    category: string;
    createdAt: string;
    repairPlan?: {
      estimatedCompletionDays: number;
      completionPercentage: number;
    };
  }>;
}

export interface ICitizenAssistantOutput {
  response: string;
  suggestedActions?: string[];
  relatedIssueIds?: string[];
}

// ---- Prediction Agent ----
export interface IPredictionInput {
  historicalIssues: Array<{
    category: IssueCategory;
    location: { lat: number; lng: number };
    severity: IssueSeverity;
    createdAt: string;
    resolvedAt?: string;
  }>;
  timeframe: 'week' | 'month' | 'quarter';
}

export interface IPredictionHotspot {
  lat: number;
  lng: number;
  probability: number;
  reasoning: string;
  suggestedPreventiveMeasures: string[];
}

export interface IPredictionOutput {
  predictions: Array<{
    type: IssueCategory;
    locations: IPredictionHotspot[];
    timeframe: string;
    confidence: number;
    preventiveMeasures: string[];
  }>;
  summary: string;
}

// ---- Agent Orchestrator ----
export type AgentName =
  | 'vision'
  | 'duplicate'
  | 'priority'
  | 'planning'
  | 'assistant'
  | 'prediction';

export interface IAgentExecutionLog {
  agent: AgentName;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  success: boolean;
  error?: string;
  model: string;
  tokensUsed?: number;
}

export interface IOrchestratorResult {
  issueId: string;
  logs: IAgentExecutionLog[];
  visionResult?: IVisionAgentOutput;
  duplicateResult?: IDuplicateAgentOutput;
  priorityResult?: IPriorityAgentOutput;
  planningResult?: IPlanningAgentOutput;
  totalDurationMs: number;
}
