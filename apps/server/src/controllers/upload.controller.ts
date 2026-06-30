import { Request, Response, NextFunction } from 'express';
import * as uploadService from '../services/upload.service';
import { logger } from '../utils/logger';

export async function uploadImages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[];
    let filesArray: Express.Multer.File[] = [];

    if (Array.isArray(files)) {
      filesArray = files;
    } else if (files && typeof files === 'object') {
      filesArray = files['images'] || [];
    }

    if (filesArray.length === 0) {
      res.status(400).json({ success: false, error: 'No images provided.' });
      return;
    }

    const uploadPromises = filesArray.map((file) => uploadService.uploadFile(file, 'images'));
    const urls = await Promise.all(uploadPromises);

    res.json({
      success: true,
      data: { urls },
      message: 'Images uploaded successfully.',
    });
  } catch (error) {
    next(error);
  }
}

export async function uploadVideo(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: 'No video file provided.' });
      return;
    }

    const url = await uploadService.uploadFile(req.file, 'videos');
    res.json({
      success: true,
      data: { url },
      message: 'Video uploaded successfully.',
    });
  } catch (error) {
    next(error);
  }
}

export async function uploadVoice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: 'No voice file provided.' });
      return;
    }

    const url = await uploadService.uploadFile(req.file, 'voice');
    res.json({
      success: true,
      data: { url },
      message: 'Voice note uploaded successfully.',
    });
  } catch (error) {
    next(error);
  }
}
