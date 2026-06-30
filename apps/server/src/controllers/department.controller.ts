import { Request, Response, NextFunction } from 'express';
import { Department } from '../models/Department';

export async function listDepartments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const departments = await Department.find({ isActive: true }).populate('headOfficer', 'displayName');
    res.json({
      success: true,
      data: departments,
    });
  } catch (error) {
    next(error);
  }
}

export async function createDepartment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, code, description, categories, contactEmail, contactPhone, jurisdiction } = req.body;
    const department = await Department.create({
      name,
      code: code.toUpperCase(),
      description,
      categories,
      contactEmail,
      contactPhone,
      jurisdiction,
    });

    res.status(201).json({
      success: true,
      data: department,
      message: 'Department created successfully.',
    });
  } catch (error) {
    next(error);
  }
}

export async function getDepartmentStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      res.status(404).json({ success: false, error: 'Department not found' });
      return;
    }

    res.json({
      success: true,
      data: {
        activeIssues: department.activeIssues,
        resolvedIssues: department.resolvedIssues,
        avgResponseTime: department.avgResponseTime,
        performanceScore: department.performanceScore,
      },
    });
  } catch (error) {
    next(error);
  }
}
