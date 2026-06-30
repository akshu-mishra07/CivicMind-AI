import { z } from 'zod';

export const mongoIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const nearbyIssuesQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
  lng: z.coerce.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
  radius: z.coerce.number().int().positive().max(50000).optional().default(5000), // Max 50km
});
