import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Validate incoming request data against a Zod schema
 * @param schema - Zod validation schema
 * @param source - source location inside the Request object ('body', 'query', 'params')
 */
export function validate(
  schema: ZodSchema,
  source: 'body' | 'query' | 'params' = 'body'
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsedData = await schema.parseAsync(req[source]);
      // Assign parsed/validated data back to req to ensure type-coerced values (e.g. numbers, dates) are used
      req[source] = parsedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          success: false,
          error: 'Validation failed.',
          details: errorMessages,
        });
        return;
      }

      next(error);
    }
  };
}
