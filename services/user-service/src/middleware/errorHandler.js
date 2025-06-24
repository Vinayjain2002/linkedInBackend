const multer= require('multer');

const errorHandler= (err, req, res, next)=>{
    console.log(err.stack);

    if(err instanceof multer.MulterError){
        if(err.code== 'LIMIT_FILE_SIZE'){
            return res.status(400).json({
                error: 'File size exceeds the limit'
            });
        }
        return res.status(400).json({
            error: 'File upload error'
        });
    }

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