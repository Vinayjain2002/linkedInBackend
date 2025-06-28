import express from 'express';
const router= express.Router();
import {authenticateToken} from '../middlewares/auth.js';
import {createPost, getPostById, toggleLikePost, commentOnPost, getPostComments, sharePost, getPosts} from '../controllers/postController.js';

router.post('/create', authenticateToken, createPost);
router.get('/post/:id', authenticateToken,getPostById);
router.put('/toggle/:id', authenticateToken, toggleLikePost);
router.put('/comment/:id', authenticateToken, commentOnPost);
router.get('/comments/:id', authenticateToken, getPostComments);
router.post('/share/:id', authenticateToken, sharePost);
router.get('/', authenticateToken, getPosts);

export default router;