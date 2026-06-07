import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload, Role } from './types';

// Extend express Request definition locally in this file just to be safe
interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided.' });
  }

  const secret = process.env.JWT_SECRET || 'super_secret_local_development_jwt_key_must_be_at_least_32_bytes_long';

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid or expired token.' });
  }
};

export const requireRole = (...roles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: User not authenticated.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient privileges.' });
    }

    next();
  };
};
