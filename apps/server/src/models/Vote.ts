import mongoose, { Schema, Document } from 'mongoose';

export interface IVoteDocument extends Document {
  issue: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
}

const VoteSchema = new Schema<IVoteDocument>(
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

// Enforce unique votes per user per issue
VoteSchema.index({ issue: 1, user: 1 }, { unique: true });

export const Vote = mongoose.model<IVoteDocument>('Vote', VoteSchema);
export default Vote;
