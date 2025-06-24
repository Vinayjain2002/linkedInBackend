const express= require('express');
const router= express.Router();
const auth= require('../middlewares/auth.js');
const postController= require('../controllers/postController.js');

router.get('/health', (_,res)=> res.json({status: 'ok'}));
router.post('/', auth, postController.createPost);
router.get('/', auth, postController.getPosts);
router.post('/:id/like', auth, postController.likePost);

module.exports= router;