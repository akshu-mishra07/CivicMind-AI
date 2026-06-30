import mongoose, { Schema, Document } from 'mongoose';

export interface IVerificationDocument extends Document {
  issue: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
}

const VerificationSchema = new Schema<IVerificationDocument>(
  {
    issue: {
      type: Schema.Types.ObjectId,
      ref: 'Issue',
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only need creation time
  }
);

// Enforce unique verifications per user per issue
VerificationSchema.index({ issue: 1, user: 1 }, { unique: true });

export const Verification = mongoose.model<IVerificationDocument>('Verification', VerificationSchema);
export default Verification;
