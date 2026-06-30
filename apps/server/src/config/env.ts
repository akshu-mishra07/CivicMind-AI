import { z } from 'zod';
import path from 'path';
import fs from 'fs';

// Try to load environment variables from .env files
try {
  const rootEnv = path.resolve(__dirname, '../../../../.env');
  if (fs.existsSync(rootEnv)) {
    if (typeof process.loadEnvFile === 'function') {
      process.loadEnvFile(rootEnv);
    }
  } else {
    const localEnv = path.resolve(__dirname, '../../.env');
    if (fs.existsSync(localEnv)) {
      if (typeof process.loadEnvFile === 'function') {
        process.loadEnvFile(localEnv);
      }
    }
  }
} catch (error) {
  // Silent catch - env vars might be provided via container/system in production
}

const envSchema = z.object({
  // Database
  MONGODB_URI: z
    .string({ required_error: 'MONGODB_URI is required' })
    .url('MONGODB_URI must be a valid URL'),

  // Firebase
  FIREBASE_SERVICE_ACCOUNT_KEY: z
    .string()
    .optional()
    .default(''),

  // Google Cloud Storage
  GCS_BUCKET_NAME: z
    .string({ required_error: 'GCS_BUCKET_NAME is required' })
    .min(1, 'GCS_BUCKET_NAME cannot be empty'),

  GCS_PROJECT_ID: z
    .string({ required_error: 'GCS_PROJECT_ID is required' })
    .min(1, 'GCS_PROJECT_ID cannot be empty'),

  // Gemini AI
  GEMINI_API_KEY: z
    .string({ required_error: 'GEMINI_API_KEY is required' })
    .min(1, 'GEMINI_API_KEY cannot be empty'),

  // Server
  PORT: z.coerce
    .number()
    .int()
    .positive()
    .default(5000),

  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // CORS
  CORS_ORIGIN: z
    .string()
    .default('http://localhost:3000'),

  // JWT
  JWT_SECRET: z
    .string({ required_error: 'JWT_SECRET is required' })
    .min(16, 'JWT_SECRET must be at least 16 characters'),

  JWT_EXPIRES_IN: z
    .string()
    .default('7d'),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.format();
    const errorMessages: string[] = [];

    for (const [key, value] of Object.entries(formatted)) {
      if (key === '_errors') continue;
      const fieldErrors = value as { _errors?: string[] };
      if (fieldErrors._errors && fieldErrors._errors.length > 0) {
        errorMessages.push(`  ${key}: ${fieldErrors._errors.join(', ')}`);
      }
    }

    console.error('❌ Environment validation failed:');
    console.error(errorMessages.join('\n'));
    process.exit(1);
  }

  return result.data;
}

export const env: Env = validateEnv();
