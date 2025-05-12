import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' }); // Load environment variables from .env

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(errorHandler(401, 'Access denied. No token provided.'));
  }

  const token = authHeader.split(' ')[1];

  const JWT_SECRET = 'Roshan';
  if (!JWT_SECRET) {
    return next(errorHandler(500, 'JWT secret key not configured'));
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(errorHandler(403, 'Invalid or expired token'));
    }
    req.user = decoded;
    next();
  });
};
