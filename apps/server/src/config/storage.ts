import { Storage, type Bucket, type GetSignedUrlConfig } from '@google-cloud/storage';
import { env } from './env';
import { logger } from '../utils/logger';

const storage = new Storage({
  projectId: env.GCS_PROJECT_ID,
});

export const bucket: Bucket = storage.bucket(env.GCS_BUCKET_NAME);

logger.info('☁️  Google Cloud Storage initialized', {
  projectId: env.GCS_PROJECT_ID,
  bucket: env.GCS_BUCKET_NAME,
});

/**
 * Generate a signed URL for temporary access to a file.
 * @param filename - The file path within the bucket
 * @param expirationMs - Expiration time in milliseconds (default: 1 hour)
 * @returns The signed URL string
 */
export async function generateSignedUrl(
  filename: string,
  expirationMs: number = 3600000
): Promise<string> {
  const options: GetSignedUrlConfig = {
    version: 'v4',
    action: 'read',
    expires: Date.now() + expirationMs,
  };

  try {
    const [url] = await bucket.file(filename).getSignedUrl(options);
    return url;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to generate signed URL for ${filename}: ${message}`);
    throw new Error(`Failed to generate signed URL: ${message}`);
  }
}

/**
 * Get the public URL for a file in the bucket.
 * Note: The file must have public read access for this URL to work.
 * @param filename - The file path within the bucket
 * @returns The public URL string
 */
export function getPublicUrl(filename: string): string {
  return `https://storage.googleapis.com/${env.GCS_BUCKET_NAME}/${filename}`;
}

/**
 * Generate a signed upload URL for direct client uploads.
 * @param filename - The destination file path within the bucket
 * @param contentType - The MIME type of the file being uploaded
 * @param expirationMs - Expiration time in milliseconds (default: 15 minutes)
 * @returns The signed upload URL string
 */
export async function generateUploadUrl(
  filename: string,
  contentType: string,
  expirationMs: number = 900000
): Promise<string> {
  const options: GetSignedUrlConfig = {
    version: 'v4',
    action: 'write',
    expires: Date.now() + expirationMs,
    contentType,
  };

  try {
    const [url] = await bucket.file(filename).getSignedUrl(options);
    return url;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to generate upload URL for ${filename}: ${message}`);
    throw new Error(`Failed to generate upload URL: ${message}`);
  }
}

export { storage };
