import { Request, Response, NextFunction } from 'express';
import * as analyticsService from '../services/analytics.service';

export async function getOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const overview = await analyticsService.getAnalyticsOverview();
    res.json({
      success: true,
      data: overview,
    });
  } catch (error) {
    next(error);
  }
}

export async function getHeatmap(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const category = req.query.category as string;
    const heatmapPoints = await analyticsService.getHeatmapData(category);
    res.json({
      success: true,
      data: heatmapPoints,
    });
  } catch (error) {
    next(error);
  }
}
