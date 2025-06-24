const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const commentController = require('../controllers/commentController');

router.post('/', auth, commentController.createComment);
router.get('/:postId', commentController.getComments);
router.delete('/:commentId', auth, commentController.deleteComment);

module.exports = router;
