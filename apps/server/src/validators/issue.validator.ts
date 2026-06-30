import { z } from 'zod';

export const createIssueSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters long')
    .max(100, 'Title cannot exceed 100 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters long')
    .max(1000, 'Description cannot exceed 1000 characters'),
  images: z.array(z.string()).min(1, 'At least one image is required to report an issue'),
  videos: z.array(z.string()).optional(),
  voiceNote: z.string().optional(),
  location: z.object({
    lat: z.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
    lng: z.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
  }),
  address: z.string().min(3, 'A valid reverse-geocoded address is required'),
  ward: z.string().optional(),
  pincode: z.string().optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum([
    'submitted',
    'verified',
    'assigned',
    'in_progress',
    'resolved',
    'rejected',
    'closed',
  ]),
  note: z.string().max(500, 'Note cannot exceed 500 characters').optional(),
});

export const assignIssueSchema = z.object({
  assignedTo: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid officer User ID'),
  department: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Department ID').optional(),
});

export const commentSchema = z.object({
  content: z.string().min(1, 'Comment text cannot be empty').max(500, 'Comment cannot exceed 500 characters'),
  images: z.array(z.string()).optional(),
  parentComment: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Parent Comment ID').optional(),
});
