import mongoose, { Schema, Document } from 'mongoose';
import { IIssue, IssueStatus, IssueCategory, IssueSeverity } from '@civicmind/shared';

export interface IIssueDocument extends Omit<IIssue, '_id' | 'reportedBy' | 'assignedTo' | 'department' | 'duplicateInfo' | 'statusHistory' | 'priority' | 'resolvedAt' | 'createdAt' | 'updatedAt'>, Document {
  _id: mongoose.Types.ObjectId;
  reportedBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  department?: mongoose.Types.ObjectId;
  duplicateInfo?: {
    isDuplicate: boolean;
    parentIssue?: mongoose.Types.ObjectId;
    duplicateOf?: mongoose.Types.ObjectId[];
    similarityScore?: number;
    checkedAt: Date;
  };
  statusHistory: Array<{
    status: IssueStatus;
    changedBy: mongoose.Types.ObjectId;
    changedAt: Date;
    note?: string;
  }>;
  priority?: {
    score: number;
    level: 'critical' | 'high' | 'medium' | 'low';
    factors: any;
    reasoning?: string;
    recommendedResponseTime?: string;
    computedAt: Date;
  };
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ImageAnalysisSchema = new Schema({
  detectedObjects: [{ type: String }],
  safetyAssessment: { type: String, required: true },
  estimatedSize: { type: String },
});

const AIAnalysisSchema = new Schema({
  category: {
    type: String,
    required: true,
  },
  subCategory: { type: String },
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    required: true,
  },
  confidence: { type: Number, required: true },
  description: { type: String, required: true },
  suggestions: [{ type: String }],
  tags: [{ type: String }],
  imageAnalysis: { type: ImageAnalysisSchema, required: true },
});

const DuplicateInfoSchema = new Schema({
  isDuplicate: { type: Boolean, required: true, default: false },
  parentIssue: { type: Schema.Types.ObjectId, ref: 'Issue' },
  duplicateOf: [{ type: Schema.Types.ObjectId, ref: 'Issue' }],
  similarityScore: { type: Number },
  checkedAt: { type: Date, required: true, default: Date.now },
});

const PriorityFactorsSchema = new Schema({
  severity: { type: Number, required: true },
  nearHospital: { type: Boolean, required: true },
  nearSchool: { type: Boolean, required: true },
  trafficDensity: { type: Number, required: true },
  populationDensity: { type: Number, required: true },
  previousComplaints: { type: Number, required: true },
  weatherImpact: { type: Number, required: true },
  ageOfIssue: { type: Number, required: true },
  communityVotes: { type: Number, required: true },
});

const PrioritySchema = new Schema({
  score: { type: Number, required: true, min: 0, max: 100 },
  level: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    required: true,
  },
  factors: { type: PriorityFactorsSchema, required: true },
  reasoning: { type: String },
  recommendedResponseTime: { type: String },
  computedAt: { type: Date, required: true, default: Date.now },
});

const StatusHistorySchema = new Schema({
  status: {
    type: String,
    required: true,
  },
  changedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  changedAt: { type: Date, required: true, default: Date.now },
  note: { type: String },
});

const GeoPointSchema = new Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true,
    default: 'Point',
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true,
  },
});

const IssueSchema = new Schema<IIssueDocument>(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    images: [{ type: String }],
    videos: [{ type: String }],
    voiceNote: { type: String },
    location: {
      type: GeoPointSchema,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    ward: { type: String },
    pincode: { type: String },
    aiAnalysis: { type: AIAnalysisSchema },
    duplicateInfo: { type: DuplicateInfoSchema },
    priority: { type: PrioritySchema },
    status: {
      type: String,
      enum: ['submitted', 'verified', 'assigned', 'in_progress', 'resolved', 'rejected', 'closed'],
      required: true,
      default: 'submitted',
    },
    statusHistory: [StatusHistorySchema],
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
    },
    upvotes: {
      type: Number,
      required: true,
      default: 0,
    },
    verifications: {
      type: Number,
      required: true,
      default: 0,
    },
    commentCount: {
      type: Number,
      required: true,
      default: 0,
    },
    reporterName: { type: String },
    reporterAvatar: { type: String },
    resolvedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Indexes
IssueSchema.index({ location: '2dsphere' });
IssueSchema.index({ reportedBy: 1 });
IssueSchema.index({ status: 1 });
IssueSchema.index({ department: 1 });
IssueSchema.index({ assignedTo: 1 });
IssueSchema.index({ 'aiAnalysis.category': 1 });
IssueSchema.index({ 'priority.score': -1 });
IssueSchema.index({ createdAt: -1 });

// Text Index for full text search
IssueSchema.index(
  {
    title: 'text',
    description: 'text',
    address: 'text',
  },
  {
    weights: {
      title: 5,
      description: 2,
      address: 1,
    },
    name: 'issue_text_search',
  }
);

export const Issue = mongoose.model<IIssueDocument>('Issue', IssueSchema);
export default Issue;
