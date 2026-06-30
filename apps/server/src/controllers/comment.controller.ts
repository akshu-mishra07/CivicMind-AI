import { Request, Response, NextFunction } from 'express';
import { Comment } from '../models/Comment';
import { Issue } from '../models/Issue';
import { Notification } from '../models/Notification';
import mongoose from 'mongoose';

export async function addComment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const issueId = req.params.id as string;
    const { content, images, parentComment } = req.body;

    const issue = await Issue.findById(issueId);
    if (!issue) {
      res.status(404).json({ success: false, error: 'Issue not found' });
      return;
    }

    const comment = await Comment.create({
      issue: new mongoose.Types.ObjectId(issueId),
      author: new mongoose.Types.ObjectId(req.user._id),
      authorName: req.user.displayName,
      authorAvatar: '', // Option to add user avatar
      authorRole: req.user.role,
      content,
      images: images || [],
      isOfficial: req.user.role === 'officer' || req.user.role === 'admin',
      parentComment: parentComment ? new mongoose.Types.ObjectId(parentComment as string) : undefined,
      isAIGenerated: false,
    });

    // Increment comment count on issue
    issue.commentCount += 1;
    await issue.save();

    // Notify issue reporter (if someone else commented)
    if (issue.reportedBy.toString() !== req.user._id) {
      await Notification.create({
        recipient: issue.reportedBy,
        type: 'comment',
        title: 'New Comment on Report',
        message: `${req.user.displayName} commented on your report "${issue.title}"`,
        issue: issue._id,
      });
    }

    res.status(201).json({
      success: true,
      data: comment,
      message: 'Comment added successfully.',
    });
  } catch (error) {
    next(error);
  }
}

export async function getComments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const comments = await Comment.find({ issue: req.params.id as string })
      .sort({ createdAt: 1 })
      .populate('author', 'displayName avatarUrl role');

    res.json({
      success: true,
      data: comments,
    });
  } catch (error) {
    next(error);
  }
}
