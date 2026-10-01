const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.cookies?.token;
  // TEMP-AUTH-DEBUG: remove once cookie auth is confirmed working in production
  console.log(
    `[TEMP-AUTH-DEBUG] ${req.method} ${req.originalUrl} cookie token:`,
    token ? `present (${token.slice(0, 15)}...)` : 'MISSING'
  );
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { _id: decoded.id, role: decoded.role };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

module.exports = { authMiddleware, requireAdmin };
