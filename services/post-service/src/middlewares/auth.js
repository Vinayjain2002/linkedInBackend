const authenticateToken = (req, res, next) => {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }
    req.user = { id: parseInt(userId) };
    next();
  };
  
  module.exports = authenticateToken;
  