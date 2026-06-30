import fs from 'fs';
import path from 'path';
import { bucket, getPublicUrl } from '../config/storage';
import { logger } from '../utils/logger';
import { env } from '../config/env';

// Local upload fallback directory
const LOCAL_UPLOAD_DIR = path.join(__dirname, '../../uploads');

if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
  fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
}

/**
 * Upload file to Google Cloud Storage or local fallback in dev mode
 * @param file - Multer File object
 * @param folder - destination folder ('images', 'videos', 'voice')
 * @returns The file url string
 */
export async function uploadFile(
  file: Express.Multer.File,
  folder: 'images' | 'videos' | 'voice'
): Promise<string> {
  const fileExtension = path.extname(file.originalname);
  const uniqueFilename = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExtension}`;

  try {
    // If we're in production or GCS bucket is active, upload to cloud
    if (env.NODE_ENV === 'production' || process.env.USE_GCS === 'true') {
      const blob = bucket.file(uniqueFilename);
      const blobStream = blob.createWriteStream({
        resumable: false,
        metadata: {
          contentType: file.mimetype,
        },
      });

      return new Promise((resolve, reject) => {
        blobStream.on('error', (err: any) => {
          logger.error(`GCS upload error for ${uniqueFilename}: ${err.message}`);
          reject(err);
        });

        blobStream.on('finish', () => {
          const publicUrl = getPublicUrl(uniqueFilename);
          logger.info(`Uploaded file successfully to GCS: ${publicUrl}`);
          resolve(publicUrl);
        });

        blobStream.end(file.buffer);
      });
    } else {
      // Local dev fallback
      const localFolderPath = path.join(LOCAL_UPLOAD_DIR, folder);
      if (!fs.existsSync(localFolderPath)) {
        fs.mkdirSync(localFolderPath, { recursive: true });
      }

      const localFilePath = path.join(LOCAL_UPLOAD_DIR, uniqueFilename);
      await fs.promises.writeFile(localFilePath, file.buffer);

      // Return a relative route endpoint path for local serving
      const relativeUrl = `/uploads/${uniqueFilename}`;
      logger.info(`Saved file to local storage (Dev fallback): ${relativeUrl}`);
      return relativeUrl;
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error(`File upload service failed: ${msg}`);
    throw new Error(`Upload failed: ${msg}`);
  }
}

/**
 * Delete file from Google Cloud Storage or local fallback
 * @param fileUrl - The url of the file to delete
 */
export async function deleteFile(fileUrl: string): Promise<void> {
  try {
    if (fileUrl.startsWith('/uploads/')) {
      // Local file
      const relativePath = fileUrl.replace('/uploads/', '');
      const filePath = path.join(LOCAL_UPLOAD_DIR, relativePath);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        logger.info(`Deleted local file: ${filePath}`);
      }
    } else if (fileUrl.includes('storage.googleapis.com')) {
      // GCS file
      const parts = fileUrl.split(`${env.GCS_BUCKET_NAME}/`);
      if (parts.length > 1) {
        const filename = parts[1];
        await bucket.file(filename).delete();
        logger.info(`Deleted GCS file: ${filename}`);
      }
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.warn(`Failed to delete file ${fileUrl}: ${msg}`);
  }
}
