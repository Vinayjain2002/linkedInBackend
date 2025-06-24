const express= require('express');
const router= express.Router();
const authController= require('../controllers/authController.js');
const authenticateToken= require('../middleware/auth.js');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authenticateToken, authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports= router;