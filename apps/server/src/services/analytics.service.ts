import { Issue } from '../models/Issue';
import { Department } from '../models/Department';
import { IAnalyticsOverview, IHeatmapPoint } from '@civicmind/shared';
import { logger } from '../utils/logger';

export async function getAnalyticsOverview(): Promise<IAnalyticsOverview> {
  try {
    const totalIssues = await Issue.countDocuments({});
    const totalResolved = await Issue.countDocuments({ status: { $in: ['resolved', 'closed'] } });
    const totalInProgress = await Issue.countDocuments({ status: 'in_progress' });
    const totalPending = await Issue.countDocuments({
      status: { $in: ['submitted', 'verified', 'assigned'] },
    });

    const criticalIssues = await Issue.countDocuments({ 'priority.level': 'critical' });

    // Time ranges
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    const todayIssues = await Issue.countDocuments({ createdAt: { $gte: startOfToday } });
    const weekIssues = await Issue.countDocuments({ createdAt: { $gte: startOfWeek } });
    const monthIssues = await Issue.countDocuments({ createdAt: { $gte: startOfMonth } });

    // Resolution rate (percentage)
    const resolutionRate = totalIssues > 0 ? Math.round((totalResolved / totalIssues) * 100) : 100;

    // Average response time (mock/calculated based on resolved issues difference)
    const responseTimes = await Issue.aggregate([
      {
        $match: {
          status: { $in: ['resolved', 'closed'] },
          resolvedAt: { $exists: true },
        },
      },
      {
        $project: {
          durationHours: {
            $divide: [{ $subtract: ['$resolvedAt', '$createdAt'] }, 3600000],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: '$durationHours' },
        },
      },
    ]);

    const avgResponseTimeHours = responseTimes.length > 0 ? Math.round(responseTimes[0].avgDuration) : 24;

    // Top Categories aggregation
    const topCategories = await Issue.aggregate([
      {
        $group: {
          _id: '$aiAnalysis.category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
          category: '$_id',
          count: 1,
        },
      },
    ]);

    // Department Performance aggregation
    const deptPerformanceRaw = await Issue.aggregate([
      {
        $group: {
          _id: '$department',
          totalIssues: { $sum: 1 },
          resolvedIssues: {
            $sum: {
              $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0],
            },
          },
        },
      },
    ]);

    // Hydrate department performance with department names
    const departments = await Department.find({});
    const deptMap = new Map<string, any>(departments.map((d: any) => [d._id.toString(), d]));

    const departmentPerformance = deptPerformanceRaw
      .map((dp: any) => {
        const deptId = dp._id ? dp._id.toString() : 'unknown';
        const dept = deptMap.get(deptId);
        const name = dept ? dept.name : 'Unassigned / General';
        const rate = dp.totalIssues > 0 ? Math.round((dp.resolvedIssues / dp.totalIssues) * 100) : 100;
        return {
          departmentId: deptId,
          departmentName: name,
          totalIssues: dp.totalIssues,
          resolvedIssues: dp.resolvedIssues,
          avgResponseTimeHours: dept ? dept.avgResponseTime || 12 : 24,
          resolutionRate: rate,
        };
      })
      .sort((a: any, b: any) => b.totalIssues - a.totalIssues);

    // Trend Data aggregation (last 7 days)
    const trendRaw = await Issue.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfWeek },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          submitted: { $sum: 1 },
          resolved: {
            $sum: {
              $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const trendData = trendRaw.map((tr: any) => ({
      date: tr._id,
      submitted: tr.submitted,
      resolved: tr.resolved,
    }));

    return {
      totalIssues,
      totalResolved,
      totalPending,
      totalInProgress,
      avgResponseTimeHours,
      resolutionRate,
      todayIssues,
      weekIssues,
      monthIssues,
      criticalIssues,
      topCategories: topCategories.map((c: any) => ({
        category: c.category || 'other',
        count: c.count,
      })),
      departmentPerformance,
      trendData,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error(`Analytics aggregation failed: ${msg}`);
    throw error;
  }
}

export async function getHeatmapData(category?: string): Promise<IHeatmapPoint[]> {
  const query: any = {};
  if (category) {
    query['aiAnalysis.category'] = category;
  }

  const issues = await Issue.find(query, { location: 1, upvotes: 1, 'aiAnalysis.category': 1 });

  return issues.map((issue: any) => ({
    lat: issue.location.coordinates[1],
    lng: issue.location.coordinates[0],
    weight: Math.max(1, Math.min(10, 1 + Math.floor(issue.upvotes / 5))), // Scale weight by upvotes
    category: issue.aiAnalysis?.category,
  }));
}
