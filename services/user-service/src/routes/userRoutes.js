const express = require('express');
const router= express.Router();
const userController= require('../controllers/userController.js');
const authenticateToken= require('../middleware/auth.js');
const upload= require('../middleware/upload.js');

router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, userController.updateProfile);
router.post('/profile/picture', authenticateToken, upload.single('picture'),userController.uploadProfilePicture);
router.delete('/account', authenticateToken, userController.deleteAccount);
router.get('/search', authenticateToken, userController.searchUsers);
router.get('/:id', authenticateToken, userController.getUserById); 

module.exports= router;