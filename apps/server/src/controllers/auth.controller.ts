import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { logger } from '../utils/logger';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await authService.registerUser(req.body);
    res.status(201).json({
      success: true,
      data: user,
      message: 'User registered database profile successfully.',
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    const profile = await authService.getUserProfile(req.user._id);
    if (!profile) {
      res.status(404).json({ success: false, error: 'Profile not found' });
      return;
    }
    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
}

export async function getLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const leaderboard = await authService.getLeaderboardData();
    res.json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    const updatedUser = await authService.updateUserProfile(req.user._id, req.body);
    res.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully.',
    });
  } catch (error) {
    next(error);
  }
}
