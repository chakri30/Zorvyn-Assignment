// Check if user has required role
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied',
        required: allowedRoles,
        yourRole: req.user.role
      });
    }

    next();
  };
};

// Specific role middlewares
const requireAdmin = requireRole('ADMIN');
const requireAnalyst = requireRole('ANALYST', 'ADMIN');
const requireViewer = requireRole('VIEWER', 'ANALYST', 'ADMIN');

module.exports = {
  requireRole,
  requireAdmin,
  requireAnalyst,
  requireViewer
};