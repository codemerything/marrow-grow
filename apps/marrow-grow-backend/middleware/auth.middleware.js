import jwt from 'jsonwebtoken';
import Player from '../models/user.model.js';
import { JWT_SECRET } from '../config/env.js';

export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token required.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await Player.findById(decoded.id).select('-password -refreshToken');

    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    console.error('Auth Middleware Error:', error);
    return res.status(500).json({ message: 'Server error during authentication.' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user) {
      return res.status(401).json({ message: "Authentication required." });
  }
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: "Admin access required." });
  }
  next();
};
