const express = require('express');
const router= express.Router();
const userController= require('../services/userService.js');
const authenticateToken= require('../middleware/auth.js');
const upload= require('../middleware/upload.js');

router.get('/profile', authenticateToken, userController.getUserById);
router.put('/profile', authenticateToken, userController.updateExistingProfile);
router.post('/profile/picture', authenticateToken, upload.single('picture'),userController.uploadUserProfilePicture);
router.delete('/account', authenticateToken, userController.deleteUserAccount);
router.get('/search', authenticateToken, userController.searchUsers);
router.get('/:id', authenticateToken, userController.getUserById); 

module.exports= router;