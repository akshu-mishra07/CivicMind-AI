import mongoose, { Schema, Document } from 'mongoose';
import { IDepartment } from '@civicmind/shared';

export interface IDepartmentDocument extends Omit<IDepartment, '_id' | 'headOfficer'>, Document {
  _id: mongoose.Types.ObjectId;
  headOfficer?: mongoose.Types.ObjectId;
  jurisdiction?: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

const geoPolygonSchema = new Schema({
  type: {
    type: String,
    enum: ['Polygon'],
    required: true,
    default: 'Polygon',
  },
  coordinates: {
    type: [[[Number]]], // Array of arrays of points [[ [lng, lat], [lng, lat] ]]
    required: true,
  },
});

const DepartmentSchema = new Schema<IDepartmentDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
    },
    categories: [{
      type: String,
    }],
    headOfficer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    officerCount: {
      type: Number,
      required: true,
      default: 0,
    },
    contactEmail: {
      type: String,
      trim: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    jurisdiction: {
      type: geoPolygonSchema,
    },
    avgResponseTime: {
      type: Number,
      required: true,
      default: 0,
    },
    activeIssues: {
      type: Number,
      required: true,
      default: 0,
    },
    resolvedIssues: {
      type: Number,
      required: true,
      default: 0,
    },
    performanceScore: {
      type: Number,
      required: true,
      default: 100,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
DepartmentSchema.index({ code: 1 });
DepartmentSchema.index({ name: 1 });
DepartmentSchema.index({ categories: 1 });
DepartmentSchema.index({ isActive: 1 });
DepartmentSchema.index({ jurisdiction: '2dsphere' });

export const Department = mongoose.model<IDepartmentDocument>('Department', DepartmentSchema);
export default Department;
