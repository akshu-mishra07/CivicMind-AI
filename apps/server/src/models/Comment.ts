import mongoose, { Schema, Document } from 'mongoose';
import { IComment } from '@civicmind/shared';

export interface ICommentDocument extends Omit<IComment, '_id' | 'issue' | 'author' | 'parentComment'>, Document {
  _id: mongoose.Types.ObjectId;
  issue: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  parentComment?: mongoose.Types.ObjectId;
}

const CommentSchema = new Schema<ICommentDocument>(
  {
    issue: {
      type: Schema.Types.ObjectId,
      ref: 'Issue',
      required: true,
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    authorAvatar: {
      type: String,
    },
    authorRole: {
      type: String,
      enum: ['citizen', 'officer', 'admin'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    images: [{ type: String }],
    isOfficial: {
      type: Boolean,
      required: true,
      default: false,
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
    },
    isAIGenerated: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for sorted comments list under an issue
CommentSchema.index({ issue: 1, createdAt: 1 });

export const Comment = mongoose.model<ICommentDocument>('Comment', CommentSchema);
export default Comment;
