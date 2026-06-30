import mongoose from 'mongoose';
import { IOrchestratorResult, IAgentExecutionLog } from '@civicmind/shared';
import { Issue } from '../models/Issue';
import { User } from '../models/User';
import { Department } from '../models/Department';
import { Repair } from '../models/Repair';
import { Notification } from '../models/Notification';
import { Vote } from '../models/Vote';
import { AuditLog } from '../models/AuditLog';
import { visionAgent } from './vision.agent';
import { duplicateAgent } from './duplicate.agent';
import { priorityAgent } from './priority.agent';
import { planningAgent } from './planning.agent';
import { logger } from '../utils/logger';
import { generateTicketId } from '../utils/helpers';

export async function processNewIssue(
  issueId: string,
  modelOverride?: string
): Promise<IOrchestratorResult> {
  const startTime = Date.now();
  const logs: IAgentExecutionLog[] = [];
  let visionResult: any;
  let duplicateResult: any;
  let priorityResult: any;
  let planningResult: any;

  try {
    logger.info(`Orchestrator: Processing issue ${issueId}`);

    // 1. Fetch Issue
    const issue = await Issue.findById(issueId);
    if (!issue) {
      throw new Error(`Issue not found: ${issueId}`);
    }

    const reporter = await User.findById(issue.reportedBy);
    if (!reporter) {
      throw new Error(`Reporter not found: ${issue.reportedBy}`);
    }

    // Initialize/assign ticket ID if missing
    if (!issue.ticketId) {
      issue.ticketId = generateTicketId();
    }

    // ----------------------------------------------------
    // STEP 1: Vision Agent (Image analysis & initial classification)
    // ----------------------------------------------------
    if (issue.images && issue.images.length > 0) {
      try {
        const { output, log } = await visionAgent.run(
          {
            images: issue.images,
            userDescription: issue.description,
          },
          modelOverride
        );
        logs.push(log);
        visionResult = output;

        // Save AI classification & severity
        issue.aiAnalysis = {
          category: output.category,
          subCategory: output.subCategory,
          severity: output.severity,
          confidence: output.confidence,
          description: output.description,
          suggestions: output.suggestions,
          tags: output.tags,
          imageAnalysis: {
            detectedObjects: output.detectedObjects,
            safetyAssessment: output.safetyAssessment,
            estimatedSize: output.estimatedSize,
          },
        };
      } catch (err) {
        logger.error(`Orchestrator - Vision Agent error: ${err}`);
      }
    }

    // Fallback if Vision Agent fails or no images
    if (!issue.aiAnalysis) {
      issue.aiAnalysis = {
        category: 'other',
        severity: 'medium',
        confidence: 0.5,
        description: 'Automatic classification fallback. Requires manual review.',
        suggestions: ['Review issue details', 'Verify location'],
        tags: ['unverified'],
        imageAnalysis: {
          detectedObjects: [],
          safetyAssessment: 'No image provided for auto safety verification.',
        },
      };
    }

    // ----------------------------------------------------
    // STEP 2: Duplicate Agent (Check if duplicate of nearby active issues)
    // ----------------------------------------------------
    // Find active issues of same category within 1000 meters
    const nearbyIssues = await Issue.find({
      _id: { $ne: issue._id },
      status: { $in: ['submitted', 'verified', 'assigned', 'in_progress'] },
      'aiAnalysis.category': issue.aiAnalysis.category,
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: issue.location.coordinates,
          },
          $maxDistance: 1000, // 1km radius
        },
      },
    }).limit(5);

    try {
      const { output, log } = await duplicateAgent.run(
        {
          newIssue: {
            images: issue.images,
            description: issue.description,
            location: {
              lat: issue.location.coordinates[1],
              lng: issue.location.coordinates[0],
            },
            category: issue.aiAnalysis?.category || 'other',
          },
          existingIssues: nearbyIssues.map((ni) => ({
            _id: ni._id.toString(),
            images: ni.images,
            description: ni.description,
            location: {
              lat: ni.location.coordinates[1],
              lng: ni.location.coordinates[0],
            },
            category: ni.aiAnalysis?.category || 'other',
            createdAt: ni.createdAt.toISOString(),
          })),
        },
        modelOverride
      );
      logs.push(log);
      duplicateResult = output;

      issue.duplicateInfo = {
        isDuplicate: output.isDuplicate,
        similarityScore: output.similarityScore,
        checkedAt: new Date(),
        duplicateOf: [],
      };

      if (output.isDuplicate && output.parentIssueId) {
        const parentId = new mongoose.Types.ObjectId(output.parentIssueId);
        issue.duplicateInfo.parentIssue = parentId;
        issue.status = 'rejected';
        issue.statusHistory.push({
          status: 'rejected',
          changedBy: new mongoose.Types.ObjectId(issue.reportedBy), // reported user
          changedAt: new Date(),
          note: `Duplicate check: linked to parent issue ticket ${output.parentIssueId}. Reasoning: ${output.reasoning}`,
        });

        await issue.save();

        // Increment upvote count on parent issue
        const parentIssue = await Issue.findById(parentId);
        if (parentIssue) {
          parentIssue.upvotes += 1;
          if (parentIssue.duplicateInfo) {
            parentIssue.duplicateInfo.duplicateOf = parentIssue.duplicateInfo.duplicateOf || [];
            parentIssue.duplicateInfo.duplicateOf.push(issue._id);
          }
          await parentIssue.save();

          // Create vote entry
          try {
            await Vote.create({
              issue: parentId,
              user: issue.reportedBy,
            });
          } catch (voteErr) {
            // Already voted
          }
        }

        // Notify citizen
        await Notification.create({
          recipient: issue.reportedBy,
          type: 'status_update',
          title: 'Report Linked as Duplicate',
          message: `Your report ${issue.ticketId} is linked as a duplicate of an existing report. We merged your upvote to expedite resolution.`,
          issue: issue._id,
        });

        // Audit Log
        await AuditLog.create({
          action: 'issue.duplicate_rejected',
          entityType: 'issue',
          entityId: issue._id,
          performedBy: issue.reportedBy,
          details: `Linked to parent issue: ${output.parentIssueId}`,
        });

        return {
          issueId: issue._id.toString(),
          logs,
          visionResult,
          duplicateResult,
          totalDurationMs: Date.now() - startTime,
        };
      }
    } catch (err) {
      logger.error(`Orchestrator - Duplicate Agent error: ${err}`);
    }

    // ----------------------------------------------------
    // STEP 3: Priority Agent (Calculate dynamic urgency score)
    // ----------------------------------------------------
    // Context calculation (mocked/estimated based on geo check)
    // A deterministic mock based on lat/lng so it is consistent
    const latHash = Math.abs(Math.sin(issue.location.coordinates[1]) * 1000);
    const lngHash = Math.abs(Math.cos(issue.location.coordinates[0]) * 1000);
    const nearHospital = Math.round(latHash) % 5 === 0; // 20% probability
    const nearSchool = Math.round(lngHash) % 4 === 0; // 25% probability
    const trafficDensity = Math.floor(latHash % 10);
    const populationDensity = Math.floor(lngHash % 10);
    const previousComplaints = Math.floor((latHash + lngHash) % 15);
    const weatherImpact = Math.floor((latHash * lngHash) % 8);

    try {
      const { output, log } = await priorityAgent.run(
        {
          category: issue.aiAnalysis.category,
          severity: issue.aiAnalysis.severity,
          description: issue.description,
          location: {
            lat: issue.location.coordinates[1],
            lng: issue.location.coordinates[0],
          },
          upvotes: issue.upvotes,
          createdAt: issue.createdAt.toISOString(),
          nearbyPOIs: {
            hospitals: nearHospital ? 1 : 0,
            schools: nearSchool ? 1 : 0,
          },
          previousComplaintsInArea: previousComplaints,
          trafficDensity,
          populationDensity,
        },
        modelOverride
      );
      logs.push(log);
      priorityResult = output;

      issue.priority = {
        score: output.score,
        level: output.level,
        factors: output.factors,
        reasoning: output.reasoning,
        recommendedResponseTime: output.recommendedResponseTime,
        computedAt: new Date(),
      };
    } catch (err) {
      logger.error(`Orchestrator - Priority Agent error: ${err}`);
      // Fallback priority
      issue.priority = {
        score: issue.aiAnalysis.severity === 'critical' ? 90 : issue.aiAnalysis.severity === 'high' ? 70 : 40,
        level: issue.aiAnalysis.severity,
        factors: {
          severity: issue.aiAnalysis.severity === 'critical' ? 4 : issue.aiAnalysis.severity === 'high' ? 3 : 2,
          nearHospital,
          nearSchool,
          trafficDensity,
          populationDensity,
          previousComplaints,
          weatherImpact,
          ageOfIssue: 0,
          communityVotes: issue.upvotes,
        },
        reasoning: 'Fallback prioritization due to agent failure.',
        recommendedResponseTime: '48 hours',
        computedAt: new Date(),
      };
    }

    // ----------------------------------------------------
    // STEP 4: Planning Agent (Build repair stages & assign department)
    // ----------------------------------------------------
    let responsibleDept = 'GENERAL';
    try {
      const { output, log } = await planningAgent.run(
        {
          category: issue.aiAnalysis?.category || 'other',
          severity: issue.aiAnalysis?.severity || 'medium',
          description: issue.description,
          address: issue.address,
          imageAnalysis: {
            detectedObjects: issue.aiAnalysis?.imageAnalysis.detectedObjects || [],
            estimatedSize: issue.aiAnalysis?.imageAnalysis.estimatedSize,
          },
          priorityScore: issue.priority?.score || 50,
        },
        modelOverride
      );
      logs.push(log);
      planningResult = output;
      responsibleDept = output.responsibleDepartment;

      // Find or create responsible department
      let department = await Department.findOne({ code: responsibleDept });
      if (!department) {
        department = await Department.create({
          name: `${responsibleDept.charAt(0) + responsibleDept.slice(1).toLowerCase()} Department`,
          code: responsibleDept,
          description: `Department handling ${responsibleDept.toLowerCase()} issues`,
          categories: [issue.aiAnalysis?.category || 'other'],
          contactEmail: `help.${responsibleDept.toLowerCase()}@city.gov`,
          contactPhone: '555-0199',
        });
      }

      issue.department = department._id;
      issue.status = 'verified';

      // Increment active issues count in department
      department.activeIssues += 1;
      await department.save();

      // Create Repair Plan Document
      const repairPlan = await Repair.create({
        issue: issue._id,
        plan: {
          summary: output.summary,
          steps: output.steps.map((s) => ({
            order: s.order,
            description: s.description,
            estimatedDuration: s.estimatedDuration,
            resources: s.resources,
            status: 'pending',
          })),
          estimatedCost: output.estimatedCost,
          estimatedCompletion: new Date(Date.now() + output.estimatedCompletionDays * 24 * 60 * 60 * 1000),
          requiredResources: output.requiredResources,
          requiredPersonnel: output.requiredPersonnel,
          responsibleDepartment: department._id,
          safetyPrecautions: output.safetyPrecautions,
          environmentalConsiderations: output.environmentalConsiderations,
        },
        completionPercentage: 0,
        generatedBy: 'ai',
        generatedAt: new Date(),
      });

      // Auto-assign to an active officer of this department if available
      const officer = await User.findOne({
        role: 'officer',
        department: department._id,
        isActive: true,
      });

      if (officer) {
        issue.assignedTo = officer._id;
        issue.status = 'assigned';
        issue.statusHistory.push({
          status: 'assigned',
          changedBy: officer._id,
          changedAt: new Date(),
          note: 'AI Auto-assignment based on category and department queue availability.',
        });

        await Notification.create({
          recipient: officer._id,
          type: 'assignment',
          title: 'New Issue Assigned',
          message: `Issue ${issue.ticketId} ("${issue.title}") has been assigned to you. Priority: ${(issue.priority?.level || issue.aiAnalysis?.severity || 'medium').toUpperCase()}`,
          issue: issue._id,
        });

        officer.reputationScore += 5; // Duty points
        await officer.save();
      } else {
        issue.statusHistory.push({
          status: 'verified',
          changedBy: new mongoose.Types.ObjectId(issue.reportedBy),
          changedAt: new Date(),
          note: `AI Verified category: ${issue.aiAnalysis.category}. Awaiting department review.`,
        });
      }
    } catch (err) {
      logger.error(`Orchestrator - Planning Agent error: ${err}`);
      // Fallback general department assignment
      let department = await Department.findOne({ code: 'GENERAL' });
      if (!department) {
        department = await Department.create({
          name: 'General Administration',
          code: 'GENERAL',
          description: 'Handles miscellaneous and generic complaints',
          categories: ['other'],
          contactEmail: 'admin@city.gov',
          contactPhone: '555-0100',
        });
      }
      issue.department = department._id;
      issue.status = 'verified';
      issue.statusHistory.push({
        status: 'verified',
        changedBy: new mongoose.Types.ObjectId(issue.reportedBy),
        changedAt: new Date(),
        note: 'Verified with fallback parameters.',
      });
    }

    // Save final issue updates
    await issue.save();

    await Notification.create({
      recipient: issue.reportedBy,
      type: 'ai_update',
      title: 'Issue AI-Verified',
      message: `Your issue ${issue.ticketId} is verified as "${issue.aiAnalysis?.category || 'other'}". Assigned priority is ${issue.priority?.level || 'medium'}.`,
      issue: issue._id,
    });

    // Award citizen reputation score for valid contribution
    reporter.reputationScore += 20; // 20 points for valid report
    reporter.issuesReported += 1;
    await reporter.save();

    // Audit Log
    await AuditLog.create({
      action: 'issue.ai_processed',
      entityType: 'issue',
      entityId: issue._id,
      performedBy: reporter._id,
      details: `Vision and Planning complete. Status: ${issue.status}`,
    });

    return {
      issueId: issue._id.toString(),
      logs,
      visionResult,
      duplicateResult,
      priorityResult,
      planningResult,
      totalDurationMs: Date.now() - startTime,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error(`Orchestrator failed for issue ${issueId}: ${msg}`);
    throw error;
  }
}
