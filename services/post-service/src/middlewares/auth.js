const authenticateToken = (req, res, next) => {
  const authHeader= req.headers.authorization;
  const token= authHeader && authHeader.split(' ')[1];
  if(!token){
    return res.status(401).json({"error": "Access Token not Provided"});
  }
  try{
      const decoded= jwt.verify(token, process.env.JWT_SECRET);
      if(!decoded || !decoded.id){
        return res.status(403).json({"error": "Invalid Token"});
      }

    req.user= {id: decoded.id};
  }
  
  catch(err){
    if(err.name === 'TokenExpiredError'){
      return res.status(403).json({"error": "Token Expired"});
    }
    if(err.name === 'JsonWebTokenError'){
      return res.status(403).json({"error": "Invalid Token"});
    }
     res.status(500).json({"error": "Internal Server Error"});
  }
  next();
  };
  
  module.exports = authenticateToken;
  