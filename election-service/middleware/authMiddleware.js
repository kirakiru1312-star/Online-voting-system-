/**
 * Auth middleware for election-service.
 * Verifies JWT locally (same secret) – no network call needed for token validation.
 */
const jwt = require('jsonwebtoken');
const axios = require('axios');

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ message: 'Not authorized, no token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Fetch full user from auth-service
    const response = await axios.get(
      `${process.env.AUTH_SERVICE_URL}/api/auth/internal/users/${decoded.id}`
    );
    req.user = response.data.user;
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: `Role '${req.user.role}' is not authorized` });
  }
  next();
};

exports.softProtect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const response = await axios.get(
        `${process.env.AUTH_SERVICE_URL}/api/auth/internal/users/${decoded.id}`
      );
      req.user = response.data.user;
    } catch (error) { /* ignore */ }
  }
  next();
};
