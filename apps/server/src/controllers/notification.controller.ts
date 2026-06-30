import { Request, Response, NextFunction } from 'express';
import * as notificationService from '../services/notification.service';

export async function getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    const notifications = await notificationService.getUserNotifications(req.user._id);
    res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
}

export async function markRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    const notification = await notificationService.markAsRead(req.params.id as string, req.user._id);
    if (!notification) {
      res.status(404).json({ success: false, error: 'Notification not found' });
      return;
    }
    res.json({
      success: true,
      data: notification,
      message: 'Notification marked as read.',
    });
  } catch (error) {
    next(error);
  }
}

export async function markAllRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    const count = await notificationService.markAllAsRead(req.user._id);
    res.json({
      success: true,
      data: { modifiedCount: count },
      message: 'All notifications marked as read.',
    });
  } catch (error) {
    next(error);
  }
}

export async function getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    const count = await notificationService.getUnreadCount(req.user._id);
    res.json({
      success: true,
      data: { unreadCount: count },
    });
  } catch (error) {
    next(error);
  }
}
