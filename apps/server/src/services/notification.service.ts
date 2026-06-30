import mongoose from 'mongoose';
import { Notification, INotificationDocument } from '../models/Notification';
import { NotificationType } from '@civicmind/shared';
import { logger } from '../utils/logger';

export async function getUserNotifications(userId: string): Promise<INotificationDocument[]> {
  return Notification.find({ recipient: userId }).sort({ createdAt: -1 });
}

export async function createNotification(payload: {
  recipient: string;
  type: NotificationType;
  title: string;
  message: string;
  issue?: string;
  actionUrl?: string;
}): Promise<INotificationDocument> {
  const notification = await Notification.create({
    recipient: new mongoose.Types.ObjectId(payload.recipient),
    type: payload.type,
    title: payload.title,
    message: payload.message,
    issue: payload.issue ? new mongoose.Types.ObjectId(payload.issue) : undefined,
    actionUrl: payload.actionUrl,
    isRead: false,
  });

  logger.info(`Notification created for user ${payload.recipient}: "${payload.title}"`);
  return notification;
}

export async function markAsRead(
  notificationId: string,
  userId: string
): Promise<INotificationDocument | null> {
  return Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { $set: { isRead: true } },
    { new: true }
  );
}

export async function markAllAsRead(userId: string): Promise<number> {
  const result = await Notification.updateMany(
    { recipient: userId, isRead: false },
    { $set: { isRead: true } }
  );
  return result.modifiedCount;
}

export async function getUnreadCount(userId: string): Promise<number> {
  return Notification.countDocuments({ recipient: userId, isRead: false });
}
