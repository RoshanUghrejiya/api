import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' }); // Load environment variables from .env

export const verifyToken = (req, res, next) => {
  const token = req.cookies?.access_token;

  if (!token) {
    return next(errorHandler(401, 'Access denied. No token provided.'));
  }

  const SECRET_KEY = Roshan;
  if (!SECRET_KEY) {
    return next(errorHandler(500, 'JWT secret key not configured'));
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return next(errorHandler(403, 'Invalid or expired token'));
    }
    req.user = decoded;
    next();
  });
};
