import { Request, Response, NextFunction } from 'express';
import { visionAgent } from '../agents/vision.agent';
import { assistantAgent } from '../agents/assistant.agent';
import { predictionAgent } from '../agents/prediction.agent';
import { Issue } from '../models/Issue';

export async function analyzeImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { images, description } = req.body;
    if (!images || images.length === 0) {
      res.status(400).json({ success: false, error: 'At least one image is required.' });
      return;
    }

    const { output } = await visionAgent.run({
      images,
      userDescription: description,
    });

    res.json({
      success: true,
      data: output,
    });
  } catch (error) {
    next(error);
  }
}

export async function chat(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { message, history, location } = req.body;

    // Fetch active issues nearby to enrich the chat context
    let nearbyIssues: any[] = [];
    if (location && location.lat !== undefined && location.lng !== undefined) {
      const activeIssues = await Issue.find({
        status: { $in: ['submitted', 'verified', 'assigned', 'in_progress'] },
        location: {
          $nearSphere: {
            $geometry: {
              type: 'Point',
              coordinates: [location.lng, location.lat],
            },
            $maxDistance: 5000, // 5km
          },
        },
      }).limit(5);

      nearbyIssues = activeIssues.map((i) => ({
        ticketId: i.ticketId,
        title: i.title,
        status: i.status,
        category: i.aiAnalysis?.category || 'other',
        createdAt: i.createdAt.toISOString(),
      }));
    }

    const { output } = await assistantAgent.run({
      message,
      conversationHistory: (history || []).map((h: any) => ({
        role: h.role,
        content: h.content,
        timestamp: h.timestamp || new Date().toISOString(),
      })),
      userIssues: nearbyIssues.map((ni: any) => ({
        _id: '',
        ticketId: ni.ticketId,
        title: ni.title,
        status: ni.status,
        category: ni.category,
        createdAt: ni.createdAt,
      })),
    });

    res.json({
      success: true,
      data: output,
    });
  } catch (error) {
    next(error);
  }
}

export async function getPredictions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const timeframe = (req.query.timeframe as 'week' | 'month' | 'quarter') || 'month';

    // Fetch historical issues (resolved or active) from database to run forecasting
    const historicalIssues = await Issue.find({}, {
      location: 1,
      status: 1,
      createdAt: 1,
      resolvedAt: 1,
      'aiAnalysis.category': 1,
      'aiAnalysis.severity': 1,
    }).limit(200);

    const issuesContext = historicalIssues.map((i) => ({
      category: i.aiAnalysis?.category || 'other',
      location: {
        lat: i.location.coordinates[1],
        lng: i.location.coordinates[0],
      },
      severity: i.aiAnalysis?.severity || 'medium',
      createdAt: i.createdAt.toISOString(),
      resolvedAt: i.resolvedAt ? i.resolvedAt.toISOString() : undefined,
    }));

    const { output } = await predictionAgent.run({
      historicalIssues: issuesContext,
      timeframe,
    });

    res.json({
      success: true,
      data: output,
    });
  } catch (error) {
    next(error);
  }
}
