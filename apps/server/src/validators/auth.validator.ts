import { z } from 'zod';

export const registerSchema = z.object({
  firebaseUid: z.string().min(1, 'Firebase UID is required'),
  email: z.string().email('Invalid email address'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  phone: z.string().optional(),
  role: z.enum(['citizen', 'officer', 'admin']).optional().default('citizen'),
  address: z.string().optional(),
});

export const loginSchema = z.object({
  token: z.string().min(1, 'Firebase auth ID token is required'),
});

export const updateProfileSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters').optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url('Invalid URL format for avatar').or(z.literal('')).optional(),
  address: z.string().optional(),
});
