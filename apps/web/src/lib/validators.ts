// ============================================
// ZOD VALIDATION SCHEMAS
// ============================================

import { z } from 'zod';

// ---- Auth Schemas ----

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    displayName: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be under 50 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number')
      .optional()
      .or(z.literal('')),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type SignupFormData = z.infer<typeof signupSchema>;

// ---- Issue Schemas ----

export const issueReportSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be under 200 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description must be under 5000 characters'),
  address: z.string().min(5, 'Please provide a valid address'),
  ward: z.string().optional(),
  pincode: z
    .string()
    .regex(/^\d{6}$/, 'Please enter a valid 6-digit pincode')
    .optional()
    .or(z.literal('')),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
});

export type IssueReportFormData = z.infer<typeof issueReportSchema>;

// ---- Comment Schema ----

export const commentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment must be under 2000 characters'),
});

export type CommentFormData = z.infer<typeof commentSchema>;

// ---- Profile Schema ----

export const profileSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be under 50 characters'),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  address: z.string().optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
