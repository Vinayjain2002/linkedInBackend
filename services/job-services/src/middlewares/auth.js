const jwt= require('jsonwebtoken');

const authenticateToken= (req,res,next)=>{
    const headers = req.headers.authorization;
    if(!headers){
        return res.status(401).json({
            "error": "Unauthorized"
        });
    }
    const token= headers.split(' ')[1];
    if(!token){
        return res.status(401).json({"message": "Access Token not provided"});
    }
    try{
        const decoded= jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded || !decoded.id){
            return res.status(401).json({
                "error": "Unauthorized"
            });
        }
        req.user={id: decoded.id};
        next();
    }
    catch(err){
        if(err.name== "TokenExpiredError"){ 
            return res.status(401).json({
                "error": "Token Expired"
            });
        }
        return res.status(401).json({
            "error": "Unauthorized"
        });w
    }
}

module.exports= authenticateToken;