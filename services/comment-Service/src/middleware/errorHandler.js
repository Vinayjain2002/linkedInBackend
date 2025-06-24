const errorHandler= (err, req, res, next)=>{
    console.log(err.stack);

    if(err instanceof Joi.ValidationError){
        return res.status(400).json({
            error: err.message
        });
    }

    if(err instanceof jwt.JsonWebTokenError){
        return res.status(403).json({
            error: 'Invalid Token'
        });
    }

    return res.status(500).json({
        error: 'Internal Server Error'
    });
}

module.exports= errorHandler;