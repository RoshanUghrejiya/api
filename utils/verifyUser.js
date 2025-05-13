import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';


export const verifyToken = (req, res, next) => {
  const token = req.cookies?.access_token;

  if (!token) {
    return next(errorHandler(401, 'Access denied. No token provided.'));
  }

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
