import { Request, Response, NextFunction } from 'express';
import * as issueService from '../services/issue.service';

export async function reportIssue(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    const issue = await issueService.createIssue(req.user._id, req.body);
    res.status(201).json({
      success: true,
      data: issue,
      message: 'Issue reported successfully and queued for AI analysis.',
    });
  } catch (error) {
    next(error);
  }
}

export async function getIssue(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const issue = await issueService.getIssueById(req.params.id as string);
    if (!issue) {
      res.status(404).json({ success: false, error: 'Issue not found' });
      return;
    }
    res.json({
      success: true,
      data: issue,
    });
  } catch (error) {
    next(error);
  }
}

export async function listIssues(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const paginatedResult = await issueService.queryIssues(req.query as any);
    res.json(paginatedResult);
  } catch (error) {
    next(error);
  }
}

export async function upvote(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    const issue = await issueService.upvoteIssue(req.params.id as string, req.user._id);
    res.json({
      success: true,
      data: issue,
      message: 'Issue upvoted successfully.',
    });
  } catch (error) {
    next(error);
  }
}

export async function removeVote(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    const issue = await issueService.removeUpvote(req.params.id as string, req.user._id);
    res.json({
      success: true,
      data: issue,
      message: 'Upvote removed successfully.',
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyIssue(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    const issue = await issueService.verifyIssue(req.params.id as string, req.user._id);
    res.json({
      success: true,
      data: issue,
      message: 'Issue verified successfully.',
    });
  } catch (error) {
    next(error);
  }
}

export async function removeVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    const issue = await issueService.removeVerification(req.params.id as string, req.user._id);
    res.json({
      success: true,
      data: issue,
      message: 'Verification removed successfully.',
    });
  } catch (error) {
    next(error);
  }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    const { status, note } = req.body;
    const issue = await issueService.updateIssueStatus(req.params.id as string, req.user._id, status, note);
    if (!issue) {
      res.status(404).json({ success: false, error: 'Issue not found' });
      return;
    }
    res.json({
      success: true,
      data: issue,
      message: `Issue status updated to ${status}.`,
    });
  } catch (error) {
    next(error);
  }
}
