import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  role?: string;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.sendStatus(401); // No token
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
    if (err) {
      return res.sendStatus(403); // Invalid token
    }
    if (!user) {
      return res.sendStatus(403); // User undefined
    }
    
    const decoded = user as { userId: string; role: string };
    req.userId = decoded.userId;
    req.role = decoded.role;
    
    // Token authenticated successfully
    next();
  });
};

export const authorizeRoles = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // Authorization check
    if (!req.role) {
      return res.status(403).json({ message: 'Access denied: No role found' });
    }

    // SUPER_ADMIN has access to all admin routes
    if (req.role === 'SUPER_ADMIN' && roles.includes('ADMIN')) {
      next();
      return;
    }

    if (!roles.includes(req.role)) {
      return res.status(403).json({ message: `Access denied: Role '${req.role}' is not authorized` });
    }

    next();
  };
};
