import { Model, Document, FilterQuery } from 'mongoose';
import { PaginatedResponse } from '@civicmind/shared';

interface PaginateOptions {
  page?: number;
  limit?: number;
  sort?: string | Record<string, any>;
  populate?: string | string[] | any;
  select?: string | string[];
}

/**
 * Mongoose pagination helper utility
 */
export async function paginate<T extends Document>(
  model: Model<T>,
  query: FilterQuery<T> = {},
  options: PaginateOptions = {}
): Promise<PaginatedResponse<any>> {
  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(options.limit) || 20));
  const skip = (page - 1) * limit;

  // Build query
  let mongoQuery: any = model.find(query).skip(skip).limit(limit);

  // Apply sorting
  if (options.sort) {
    mongoQuery = mongoQuery.sort(options.sort);
  } else {
    mongoQuery = mongoQuery.sort({ createdAt: -1 }); // default sorting
  }

  // Apply select projection
  if (options.select) {
    mongoQuery = mongoQuery.select(options.select);
  }

  // Apply population
  if (options.populate) {
    if (Array.isArray(options.populate)) {
      options.populate.forEach((pop) => {
        mongoQuery = mongoQuery.populate(pop);
      });
    } else {
      mongoQuery = mongoQuery.populate(options.populate);
    }
  }

  // Execute queries in parallel
  const [data, total] = await Promise.all([
    mongoQuery.exec(),
    model.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrev,
    },
  };
}
