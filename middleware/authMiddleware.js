const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes and verify token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_change_me');

      // Check User model first
      let user = await User.findById(decoded.id).select('-password');
      
      // If not found in User, check Tenant model
      if (!user) {
        const Tenant = require('../models/Tenant');
        user = await Tenant.findById(decoded.id).select('-password');
        if (user) {
            // Ensure tenant has a fixed role for middleware checks if needed
            user = user.toObject();
            user.role = 'tenant';
        }
      }

      req.user = user;
      
      if (!req.user) {
         return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Middleware to check if user is superadmin
const superAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'superadmin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as superadmin' });
  }
};

// Middleware to check if user is superadmin or manager
const superAdminOrManager = (req, res, next) => {
  if (req.user && (req.user.role === 'superadmin' || req.user.role === 'manager')) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized, requires superadmin or manager role' });
  }
};

module.exports = { protect, superAdmin, superAdminOrManager };
