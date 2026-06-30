import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLogDocument extends Document {
  action: string;
  entityType: 'issue' | 'user' | 'department' | 'repair' | 'comment';
  entityId: mongoose.Types.ObjectId;
  performedBy: mongoose.Types.ObjectId;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  details?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLogDocument>(
  {
    action: {
      type: String,
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      enum: ['issue', 'user', 'department', 'repair', 'comment'],
      required: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    changes: {
      type: Schema.Types.Map,
      of: Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    details: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only need creation time
  }
);

// Compound index for entity audit trail queries
AuditLogSchema.index({ entityType: 1, entityId: 1 });

// TTL index to automatically delete audit logs after 90 days (7776000 seconds)
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

export const AuditLog = mongoose.model<IAuditLogDocument>('AuditLog', AuditLogSchema);
export default AuditLog;
