import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@civicmind/shared';

/**
 * Authorize users based on their roles
 * @param roles - list of roles allowed to access the route
 */
export function authorize(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized. Authentication required.',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Forbidden. Role '${req.user.role}' is not authorized to access this resource.`,
      });
      return;
    }

    next();
  };
}
