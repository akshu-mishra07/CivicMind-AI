import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getFirebaseAuth, isFirebaseInitialized } from '../config/firebase';
import { User } from '../models/User';
import { env } from '../config/env';
import { logger } from '../utils/logger';

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        firebaseUid: string;
        email: string;
        displayName: string;
        role: 'citizen' | 'officer' | 'admin';
      };
      firebaseUid?: string;
    }
  }
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // Development backdoor if Firebase is not initialized or specifically requested
    if (env.NODE_ENV === 'development' && req.headers['x-dev-user-id']) {
      const devUserId = req.headers['x-dev-user-id'] as string;
      const user = await User.findById(devUserId);
      if (user) {
        req.user = {
          _id: user._id.toString(),
          firebaseUid: user.firebaseUid,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
        };
        req.firebaseUid = user.firebaseUid;
        return next();
      }
    }

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Authentication failed. Token is missing.',
      });
      return;
    }

    let decodedUid: string;
    let email: string = '';
    let displayName: string = '';

    if (isFirebaseInitialized()) {
      try {
        const decodedToken = await getFirebaseAuth().verifyIdToken(token);
        decodedUid = decodedToken.uid;
        email = decodedToken.email || '';
        displayName = decodedToken.name || email.split('@')[0] || 'Citizen';
      } catch (firebaseErr) {
        const msg = firebaseErr instanceof Error ? firebaseErr.message : String(firebaseErr);
        logger.warn(`Firebase token verification failed, checking fallback JWT: ${msg}`);
        
        // Fallback to local JWT in case client uses JWT for custom flows
        try {
          const decoded = jwt.verify(token, env.JWT_SECRET) as any;
          decodedUid = decoded.uid || decoded.firebaseUid;
          email = decoded.email || '';
          displayName = decoded.displayName || 'User';
        } catch (jwtErr) {
          res.status(401).json({
            success: false,
            error: 'Authentication failed. Invalid token.',
          });
          return;
        }
      }
    } else {
      // In local dev without Firebase, accept JWT or treat token as UID/Email for testing
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as any;
        decodedUid = decoded.uid || decoded.firebaseUid || decoded.sub;
        email = decoded.email || 'dev@civicmind.ai';
        displayName = decoded.displayName || 'Dev User';
      } catch (jwtErr) {
        // If not a valid JWT, check if it's a simple mock string like "mock-uid-123"
        if (env.NODE_ENV === 'development') {
          decodedUid = token;
          email = `${token}@mock.civicmind.ai`;
          displayName = `Mock ${token}`;
        } else {
          res.status(401).json({
            success: false,
            error: 'Authentication failed. Invalid signature.',
          });
          return;
        }
      }
    }

    req.firebaseUid = decodedUid;

    // Retrieve user from MongoDB database
    let user = await User.findOne({ firebaseUid: decodedUid });

    if (!user) {
      // If user doesn't exist, auto-register them
      user = await User.create({
        firebaseUid: decodedUid,
        email: email || `${decodedUid}@civicmind.ai`,
        displayName: displayName || 'Citizen',
        role: 'citizen',
        reputationScore: 10, // Starting bonus points
      });
      logger.info(`Auto-registered new user on first login: ${user.email}`);
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        error: 'User account is deactivated.',
      });
      return;
    }

    req.user = {
      _id: user._id.toString(),
      firebaseUid: user.firebaseUid,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    };

    next();
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error(`Authentication middleware error: ${msg}`);
    res.status(500).json({
      success: false,
      error: 'Internal authentication server error.',
    });
  }
}
