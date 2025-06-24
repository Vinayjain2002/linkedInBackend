const multer= require('multer');

const storage= multer.memoryStorage();
const upload= multer({
    storage,
    limits: {
        fileSize: 1024 * 1024 * 5, // 5MB
    },
    fileFilter: (req, file, cb)=>{
        if(file.mimetype.startsWith('image/')){
            cb(null, true);
        }else{
            cb(new Error('Only images are allowed'), false);
        }
    }
});

module.exports= upload;