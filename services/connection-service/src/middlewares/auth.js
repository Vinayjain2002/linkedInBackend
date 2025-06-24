const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Malformed token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if(user.rows.length === 0 || !user.rows[0].is_active){
        return res.status(403).json({"error": 'Invalid or inactive User'});
    }

    req.user= user.rows[0];
    next();
  } catch (err) {
     if(err.name== 'TokenExpiredError'){
            return res.status(403).json({"error": "Token Expired"});
        }
        if(err.name== 'JsonWebTokenError'){
            return res.status(403).json({"error": "Invalid Token"});
        }
        return res.status(500).json({"error": "Internal Server Error"});
    }
};

