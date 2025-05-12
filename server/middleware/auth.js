// Simplified authentication middleware
const authenticate = (req, res, next) => {
  // For simplicity, we're allowing all authenticated requests
  // In a real app, you would validate the token
  if (req.headers.authorization) {
    return next();
  }
  return res.status(401).json({ message: 'Authentication required' });
};

module.exports = { authenticate };
