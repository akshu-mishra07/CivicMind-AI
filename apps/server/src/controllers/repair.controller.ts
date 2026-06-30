import { Request, Response, NextFunction } from 'express';
import { Repair } from '../models/Repair';
import { Issue } from '../models/Issue';

export async function getRepairPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const repair = await Repair.findOne({ issue: req.params.id }).populate('plan.responsibleDepartment', 'name code');
    if (!repair) {
      res.status(404).json({ success: false, error: 'Repair plan not found for this issue' });
      return;
    }
    res.json({
      success: true,
      data: repair,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { completionPercentage, steps, actualCost, notes, beforeImages, afterImages } = req.body;
    const repair = await Repair.findById(req.params.id);

    if (!repair) {
      res.status(404).json({ success: false, error: 'Repair plan not found' });
      return;
    }

    if (completionPercentage !== undefined) {
      repair.completionPercentage = completionPercentage;
      if (completionPercentage === 100) {
        repair.actualCompletion = new Date();
        // Also auto-resolve the linked issue
        await Issue.findByIdAndUpdate(repair.issue, {
          $set: { status: 'resolved', resolvedAt: new Date() }
        });
      }
    }

    if (steps) {
      repair.plan.steps = steps;
    }

    if (actualCost !== undefined) {
      repair.actualCost = actualCost;
    }

    if (notes) {
      repair.notes.push(...notes);
    }

    if (beforeImages) {
      repair.beforeImages.push(...beforeImages);
    }

    if (afterImages) {
      repair.afterImages.push(...afterImages);
    }

    await repair.save();

    res.json({
      success: true,
      data: repair,
      message: 'Repair progress updated successfully.',
    });
  } catch (error) {
    next(error);
  }
}
