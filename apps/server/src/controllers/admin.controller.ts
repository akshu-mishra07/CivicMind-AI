import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import * as authService from '../services/auth.service';

export async function getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query: any = {};
    if (req.query.role) {
      query.role = req.query.role;
    }
    const users = await authService.listAllUsers(query);
    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
}

export async function changeUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { role } = req.body;
    const user = await authService.updateUserRole(req.params.id as string, role);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    res.json({
      success: true,
      data: user,
      message: 'User role updated successfully.',
    });
  } catch (error) {
    next(error);
  }
}

export async function toggleUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await User.findById(req.params.id as string);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      data: user,
      message: `User status changed to ${user.isActive ? 'Active' : 'Inactive'}.`,
    });
  } catch (error) {
    next(error);
  }
}
