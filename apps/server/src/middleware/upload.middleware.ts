import multer from 'multer';
import { Request } from 'express';

// Store files in memory
const storage = multer.memoryStorage();

// File type validation filter
const fileFilter = (req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    // Images
    'image/jpeg',
    'image/png',
    'image/webp',
    // Video
    'video/mp4',
    'video/quicktime',
    'video/webm',
    // Audio (voice notes)
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/m4a',
    'audio/webm',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error(`Invalid file type: ${file.mimetype}. Allowed types include JPEG, PNG, WEBP, MP4, MOV, WEBM (video), and MP3, WAV, M4A, WEBM (audio).`));
  }
};

// Configure limit sizes (max 10MB per image/voice note, max 50MB for video)
const limits = {
  fileSize: 50 * 1024 * 1024, // 50MB global limit (handled per-file below or in routes)
};

const upload = multer({
  storage,
  fileFilter,
  limits,
});

// Export specific upload middleware handlers
export const uploadImages = upload.array('images', 5); // up to 5 image uploads

export const uploadSingle = upload.single('file'); // single generic file upload

export const uploadVoice = upload.single('voice'); // single voice note upload

export const uploadVideo = upload.single('video'); // single video upload

// Mixed upload for reporting workflow (images + optional video/voice note)
export const uploadMixed = upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'video', maxCount: 1 },
  { name: 'voice', maxCount: 1 },
]);
