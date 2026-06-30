import mongoose, { Schema, Document } from 'mongoose';
import { INotification, NotificationType } from '@civicmind/shared';

export interface INotificationDocument extends Omit<INotification, '_id' | 'recipient' | 'issue'>, Document {
  _id: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  issue?: mongoose.Types.ObjectId;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['status_update', 'assignment', 'comment', 'vote', 'ai_update', 'resolution', 'system'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    issue: {
      type: Schema.Types.ObjectId,
      ref: 'Issue',
    },
    actionUrl: {
      type: String,
    },
    isRead: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only need creation time
  }
);

// Indexes
NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

// TTL index to automatically delete notifications after 30 days (2592000 seconds)
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

export const Notification = mongoose.model<INotificationDocument>('Notification', NotificationSchema);
export default Notification;
