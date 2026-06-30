import mongoose, { Schema, Document } from 'mongoose';
import { IRepair } from '@civicmind/shared';

export interface IRepairDocument extends Omit<IRepair, '_id' | 'issue' | 'plan' | 'actualCompletion' | 'generatedAt' | 'createdAt' | 'updatedAt'>, Document {
  _id: mongoose.Types.ObjectId;
  issue: mongoose.Types.ObjectId;
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
    estimatedCompletion: Date;
    requiredResources: string[];
    requiredPersonnel: string[];
    responsibleDepartment: mongoose.Types.ObjectId;
    safetyPrecautions?: string[];
    environmentalConsiderations?: string;
  };
  actualCompletion?: Date;
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RepairStepSchema = new Schema({
  order: { type: Number, required: true },
  description: { type: String, required: true },
  estimatedDuration: { type: String, required: true },
  resources: [{ type: String }],
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    required: true,
    default: 'pending',
  },
});

const CostBreakdownSchema = new Schema({
  item: { type: String, required: true },
  cost: { type: Number, required: true },
});

const EstimatedCostSchema = new Schema({
  min: { type: Number, required: true },
  max: { type: Number, required: true },
  currency: { type: String, required: true, default: 'USD' },
  breakdown: [CostBreakdownSchema],
});

const RepairPlanSchema = new Schema({
  summary: { type: String, required: true },
  steps: [RepairStepSchema],
  estimatedCost: { type: EstimatedCostSchema, required: true },
  estimatedCompletion: { type: Date, required: true },
  requiredResources: [{ type: String }],
  requiredPersonnel: [{ type: String }],
  responsibleDepartment: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
  },
  safetyPrecautions: [{ type: String }],
  environmentalConsiderations: { type: String },
});

const RepairSchema = new Schema<IRepairDocument>(
  {
    issue: {
      type: Schema.Types.ObjectId,
      ref: 'Issue',
      required: true,
      unique: true,
      index: true,
    },
    plan: {
      type: RepairPlanSchema,
      required: true,
    },
    actualCost: { type: Number },
    actualCompletion: { type: Date },
    completionPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    beforeImages: [{ type: String }],
    afterImages: [{ type: String }],
    notes: [{ type: String }],
    generatedBy: {
      type: String,
      enum: ['ai', 'manual'],
      required: true,
      default: 'ai',
    },
    generatedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
RepairSchema.index({ 'plan.responsibleDepartment': 1 });
RepairSchema.index({ completionPercentage: 1 });

export const Repair = mongoose.model<IRepairDocument>('Repair', RepairSchema);
export default Repair;
