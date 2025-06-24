const express= require('express');
const router= express.Router();
const auth= require('../middlewares/auth.js');
const commentController= require('../controllers/commentController.js');

router.post('/', auth, commentController.createComment);
router.get('/:postId', auth, commentController.getComments);
router.delete('/:commentId', auth, commentController.deleteComment);

module.exports= router;