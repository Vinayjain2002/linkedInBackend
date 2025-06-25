const express= require('express');
const router= express.Router();
const auth= require('../middlewares/auth.js');
const postController= require('../controllers/postController.js');

router.get('/health', (_,res)=> res.json({status: 'ok'}));
router.post('/create', auth, postController.createPost);
router.get('/sget/:id', auth, postController.getPostById);
router.put('/toggle/:id', auth, postController.toggleLikePost);
router.put('/comment/:id', auth, postController.commentOnPost);
router.get('/comments/:id', auth, postController.getPostComments);
router.post('/share/:id', auth, postController.sharePost);
router.get('/', auth, postController.getPosts);

module.exports= router;