const express= require('express');
const router= express.Router();
const auth= require('../middlewares/auth.js');
const postController= require('../controllers/postController.js');

router.post('/create/', auth, postController.createPost);
router.get('/get/', auth, postController.getPosts);
router.get('/get/:id', auth, postController.getPostById);
router.put('/update/like/:id', auth, postController.toggleLikePost);
router.post('/comment/:id', auth, postController.commentOnPost);
router.get('/comments/:id', auth, postController.getPostComments);
router.post('/share/:id', auth, postController.sharePost);

module.exports= router;