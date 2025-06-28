const jwt= require('jsonwebtoken');
const {pool}= require('../config/database.js');

const authenticateToken= async (req, res, next)=>{
    const authHeader= req.headers.authorization;
    console.log(authHeader);
    const token= authHeader && authHeader.split(' ')[1];
    console.log(token);
    if(!token){
        return res.status(401).json({"error": "Access Token not provided"});
    }

    try{
        const decoded= jwt.verify(token, process.env.JWT_SECRET);
       
        const user= await pool.query('SELECT id, email, first_name, last_name, headline, location, industry, phone, is_active FROM users WHERE id = $1', [decoded.id]);

        if(user.rows.length === 0 || !user.rows[0].is_active){
            return res.status(403).json({"error": 'Invalid or inactive User'});
        }

        req.user= user.rows[0]; 
        next();
    }
    catch(err){
        if(err.name== 'TokenExpiredError'){
            return res.status(403).json({"error": "Token Expired"});
        }
        if(err.name== 'JsonWebTokenError'){
            return res.status(403).json({"error": "Invalid Token"});
        }
        return res.status(500).json({"error": "Internal Server Error"});
    }
}

module.exports= authenticateToken;