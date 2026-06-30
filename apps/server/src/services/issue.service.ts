import mongoose from 'mongoose';
import { Issue, IIssueDocument } from '../models/Issue';
import { Vote } from '../models/Vote';
import { Verification } from '../models/Verification';
import { User } from '../models/User';
import { Department } from '../models/Department';
import { paginate } from '../utils/pagination';
import { processNewIssue } from '../agents/orchestrator';
import { IIssueCreatePayload, IIssueFilters, PaginatedResponse, IssueStatus } from '@civicmind/shared';
import { logger } from '../utils/logger';
import { generateTicketId } from '../utils/helpers';
import { createGeoPoint } from '../utils/geo';

/**
 * Report a new community issue
 */
export async function createIssue(
  reporterId: string,
  payload: IIssueCreatePayload
): Promise<IIssueDocument> {
  const reporter = await User.findById(reporterId);
  if (!reporter) {
    throw new Error('Reporter user not found');
  }

  const ticketId = generateTicketId();

  // Create issue in submitted state
  const issue = await Issue.create({
    ticketId,
    reportedBy: reporterId,
    title: payload.title,
    description: payload.description,
    images: payload.images,
    videos: payload.videos,
    voiceNote: payload.voiceNote,
    location: createGeoPoint(payload.location.lat, payload.location.lng),
    address: payload.address,
    ward: payload.ward,
    pincode: payload.pincode,
    status: 'submitted',
    statusHistory: [
      {
        status: 'submitted',
        changedBy: new mongoose.Types.ObjectId(reporterId),
        changedAt: new Date(),
        note: 'Issue submitted by citizen.',
      },
    ],
    upvotes: 0,
    commentCount: 0,
    reporterName: reporter.displayName,
    reporterAvatar: reporter.avatarUrl,
  });

  logger.info(`Created new issue ${ticketId} [ID: ${issue._id}]. Triggering AI Agent Swarm...`);

  // Trigger AI Orchestration in the background (asynchronous)
  processNewIssue(issue._id.toString()).catch((err) => {
    logger.error(`❌ Background AI Orchestrator failed for issue ${issue._id}: ${err.message}`);
  });

  return issue;
}

/**
 * Get issue details by ID
 */
export async function getIssueById(issueId: string): Promise<IIssueDocument | null> {
  return Issue.findById(issueId)
    .populate('reportedBy', 'displayName avatarUrl role reputationScore')
    .populate('assignedTo', 'displayName badge phone')
    .populate('department', 'name code avgResponseTime');
}

/**
 * List issues with filters, search, and pagination
 */
export async function queryIssues(filters: IIssueFilters): Promise<PaginatedResponse<IIssueDocument>> {
  const query: any = {};

  // Filters
  if (filters.status && filters.status.length > 0) {
    query.status = { $in: filters.status };
  }
  if (filters.category && filters.category.length > 0) {
    query['aiAnalysis.category'] = { $in: filters.category };
  }
  if (filters.severity && filters.severity.length > 0) {
    query['aiAnalysis.severity'] = { $in: filters.severity };
  }
  if (filters.department) {
    query.department = filters.department;
  }
  if (filters.assignedTo) {
    query.assignedTo = filters.assignedTo;
  }
  if (filters.reportedBy) {
    query.reportedBy = filters.reportedBy;
  }

  // Geospatial query ($nearSphere)
  if (filters.lat !== undefined && filters.lng !== undefined) {
    const radiusMeters = filters.radius || 5000; // default 5km radius
    query.location = {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [filters.lng, filters.lat],
        },
        $maxDistance: radiusMeters,
      },
    };
  }

  // Date filters
  if (filters.dateFrom || filters.dateTo) {
    query.createdAt = {};
    if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
  }

  // Full-text search
  if (filters.search && filters.search.trim() !== '') {
    query.$text = { $search: filters.search };
  }

  // Sorting
  let sort: any = { createdAt: -1 };
  if (filters.sortBy) {
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;
    sort = { [filters.sortBy]: sortOrder };
  }

  const options = {
    page: filters.page,
    limit: filters.limit,
    sort,
    populate: [
      { path: 'department', select: 'name code' },
      { path: 'assignedTo', select: 'displayName badge' },
    ],
  };

  return paginate(Issue, query, options);
}

/**
 * Cast an upvote on an issue
 */
export async function upvoteIssue(issueId: string, userId: string): Promise<IIssueDocument | null> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const issueObjectId = new mongoose.Types.ObjectId(issueId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Try to create the vote record
    try {
      await Vote.create([{ issue: issueObjectId, user: userObjectId }], { session });
    } catch (err: any) {
      if (err.code === 11000) {
        // Vote already exists, rollback and return
        await session.abortTransaction();
        session.endSession();
        return Issue.findById(issueId);
      }
      throw err;
    }

    // Increment upvotes on the issue document
    const updatedIssue = await Issue.findByIdAndUpdate(
      issueId,
      { $inc: { upvotes: 1 } },
      { new: true, session }
    );

    // Update priority factor dynamic counts if priority analysis already ran
    if (updatedIssue && updatedIssue.priority) {
      updatedIssue.priority.factors.communityVotes = updatedIssue.upvotes;
      // Re-trigger priority score check asynchronously
      const baseScore = updatedIssue.priority.score;
      const votesWeight = Math.min(20, Math.floor(updatedIssue.upvotes / 10) * 2); // cap votes bonus
      updatedIssue.priority.score = Math.min(100, baseScore + votesWeight);
      await updatedIssue.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    logger.info(`User ${userId} upvoted issue ${issueId}`);
    return updatedIssue;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    const msg = error instanceof Error ? error.message : String(error);
    logger.error(`Upvote failed for issue ${issueId}: ${msg}`);
    throw error;
  }
}

/**
 * Remove an upvote on an issue
 */
export async function removeUpvote(issueId: string, userId: string): Promise<IIssueDocument | null> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const vote = await Vote.findOneAndDelete({ issue: issueId, user: userId }, { session });
    if (!vote) {
      await session.abortTransaction();
      session.endSession();
      return Issue.findById(issueId);
    }

    const updatedIssue = await Issue.findByIdAndUpdate(
      issueId,
      { $inc: { upvotes: -1 } },
      { new: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    logger.info(`User ${userId} removed upvote on issue ${issueId}`);
    return updatedIssue;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

/**
 * Peer verify an issue
 */
export async function verifyIssue(issueId: string, userId: string): Promise<IIssueDocument | null> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const issueObjectId = new mongoose.Types.ObjectId(issueId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Try to create the verification record
    try {
      await Verification.create([{ issue: issueObjectId, user: userObjectId }], { session });
    } catch (err: any) {
      if (err.code === 11000) {
        // Verification already exists, rollback and return
        await session.abortTransaction();
        session.endSession();
        return Issue.findById(issueId);
      }
      throw err;
    }

    // Increment verifications count on the issue
    const updatedIssue = await Issue.findByIdAndUpdate(
      issueId,
      { $inc: { verifications: 1 } },
      { new: true, session }
    );

    // Award +5 reputation score to verifying user
    await User.findByIdAndUpdate(userId, { $inc: { reputationScore: 5 } }, { session });

    // Boost priority score slightly
    if (updatedIssue && updatedIssue.priority) {
      const baseScore = updatedIssue.priority.score;
      const verifyBonus = 3; // add +3 priority score for each peer verification
      updatedIssue.priority.score = Math.min(100, baseScore + verifyBonus);
      await updatedIssue.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    logger.info(`User ${userId} verified issue ${issueId}`);
    return updatedIssue;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    const msg = error instanceof Error ? error.message : String(error);
    logger.error(`Verification failed for issue ${issueId}: ${msg}`);
    throw error;
  }
}

/**
 * Remove peer verification on an issue
 */
export async function removeVerification(issueId: string, userId: string): Promise<IIssueDocument | null> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const verification = await Verification.findOneAndDelete({ issue: issueId, user: userId }, { session });
    if (!verification) {
      await session.abortTransaction();
      session.endSession();
      return Issue.findById(issueId);
    }

    const updatedIssue = await Issue.findByIdAndUpdate(
      issueId,
      { $inc: { verifications: -1 } },
      { new: true, session }
    );

    // Deduct reputation score from verifying user
    await User.findByIdAndUpdate(userId, { $inc: { reputationScore: -5 } }, { session });

    await session.commitTransaction();
    session.endSession();

    logger.info(`User ${userId} removed verification on issue ${issueId}`);
    return updatedIssue;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

/**
 * Update the status of an issue (Officer/Admin action)
 */
export async function updateIssueStatus(
  issueId: string,
  updaterId: string,
  status: IssueStatus,
  note?: string
): Promise<IIssueDocument | null> {
  const issue = await Issue.findById(issueId);
  if (!issue) return null;

  const oldStatus = issue.status;
  issue.status = status;
  issue.statusHistory.push({
    status,
    changedBy: new mongoose.Types.ObjectId(updaterId),
    changedAt: new Date(),
    note,
  });

  if (status === 'resolved') {
    issue.resolvedAt = new Date();
    
    // Decrement department active issues and increment resolved
    if (issue.department) {
      await Department.findByIdAndUpdate(issue.department, {
        $inc: { activeIssues: -1, resolvedIssues: 1 },
      });
    }

    // Award reputation points to officer
    if (issue.assignedTo) {
      await User.findByIdAndUpdate(issue.assignedTo, {
        $inc: { reputationScore: 50, issuesResolved: 1 },
      });
    }

    // Award bonus points to reporting citizen
    await User.findByIdAndUpdate(issue.reportedBy, {
      $inc: { reputationScore: 100 },
    });
  } else if ((oldStatus as string) === 'resolved') {
    // If reopened from resolved
    issue.resolvedAt = undefined;
    if (issue.department) {
      await Department.findByIdAndUpdate(issue.department, {
        $inc: { activeIssues: 1, resolvedIssues: -1 },
      });
    }
  }

  await issue.save();

  logger.info(`Issue ${issueId} status updated: ${oldStatus} -> ${status} by ${updaterId}`);
  return issue;
}
