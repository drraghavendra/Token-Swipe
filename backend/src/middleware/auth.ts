import { Request, Response, NextFunction } from 'express';
import { RedisService } from '../services/RedisService';

const redis = new RedisService();

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // In a real implementation, you'd verify JWT or session token
    // For demo, we'll use a simple base64 encoded user ID
    const decoded = Buffer.from(token, 'base64').toString('ascii');
    const [userId, timestamp] = decoded.split(':');
    
    if (!userId || !timestamp) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if token is expired (24 hours)
    const tokenAge = Date.now() - parseInt(timestamp);
    if (tokenAge > 24 * 60 * 60 * 1000) {
      return res.status(401).json({ error: 'Token expired' });
    }

    // Get user from cache/database
    const userData = await redis.get(`user:${userId}`);
    if (!userData) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = JSON.parse(userData);
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};