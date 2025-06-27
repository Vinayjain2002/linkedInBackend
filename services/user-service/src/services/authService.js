const bcrypt= require('bcryptjs');
const jwt= require('jsonwebtoken');
const UserModel= require('../models/userModel.js');
const redisClient= require('../config/redis.js');
const transporter= require('../config/mailer.js');
const aesEncryption= require('../utils/aesEncrytption.js');
const UserEventService = require('./userEventService.js');

const authService= {
    async registerUser(email, password, first_name, last_name, headline, location, industry, phone) {
        const existingUser= await UserModel.findUserByEmail(email);
        if(existingUser){
            throw new Error('User already exists');
        }
        const passwordHash= await aesEncryption.hashPassword(password);
        const user = await UserModel.createUser(email, passwordHash, first_name, last_name, headline, location, industry, phone);
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        await redisClient.setEx(`user:${user.id}`, 3600, JSON.stringify(user));
        await UserEventService.publishUserRegistration({
            ...user,
            ipAddress: req?.ip || req?.connection?.remoteAddress,
            userAgent: req?.headers['user-agent']
        });
        try{
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Welcome to the Vinay Jain LinkedIn Clone',
                html: `
                    <h1>Welcome ${first_name}!</h1>
                    <p>Thank you for joining our professional network.</p>
                    <p>Start building your professional profile and connect with others!</p>
                `
            });
        }
        catch(err){
            console.error('Error sending verification email:', err);
            throw new Error('Failed to send verification email');
        }
        return {user, token};
    },
    
    async logoutUser(userId){
        await redisClient.del(`user:${userId}`);
        return {message: 'Logged out successfully'};
    },

    async loginUser(email, password){
        const user= await UserModel.findUserByEmail(email);
        if(!user || !user.is_active){
            throw new Error('Invalid credentials or account is not active');
        }   
        const isPasswordValid= await aesEncryption.verifyPassword(password, user.password_hash);
        if(!isPasswordValid){
            await UserModel.recordFailedLogin(email);
            await UserEventService.publishAdminAlert({
                type: 'FAILED_LOGIN_ATTEMPT',
                message: `Failed login attempt for user: ${email}`,
                severity: 'WARNING',
                userId: user.id,
                userEmail: email,
                ipAddress: req?.ip || req?.connection?.remoteAddress,
                userAgent: req?.headers?.['user-agent']
            });
            
            throw new Error('Invalid password');
        }
        await UserModel.resetFailedLogin(email);
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '24h' }
        );
        await redisClient.setEx(`user:${user.id}`, 3600, JSON.stringify(user));
        await UserEventService.publishUserLogin({
            ...user,
            ipAddress: req?.ip || req?.connection?.remoteAddress,
            userAgent: req?.headers?.['user-agent']
        });
        return {user, token};
    },

    async requestPasswordReset(email){
        const user= await UserModel.findUserByEmail(email);
        if(!user ||!user.email_verified || !user.is_verified){
            throw new Error('User not found or not verified');
        }
        const resetToken= jwt.sign(
            { id: user.id, type: 'password-reset' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        const expiresAt= new Date(Date.now() + 3600000);
        await UserModel.storeVerificationToken(user.id, resetToken, 'password-reset', expiresAt);
        try{
            const resetLink= `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Password Reset Request',
                html: `
                    <h1>Password Reset Request</h1>
                    <p>Hello ${user.first_name},</p>
                    <p>You requested a password reset. Click the link below to reset your password:</p>
                    <a href="${resetLink}">Reset Password</a>
                    <p>This link will expire in 1 hour.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                `
            });
        }
        catch(err){
            console.error('Error sending password reset email:', err);
            throw new Error('Failed to send password reset email');
        }
        return {message: 'Password reset email sent'};
    },

    async resetUserPassword(token, newPassword){
        const decoded= jwt.verify(token, process.env.JWT_SECRET);
        if(decoded.type !== 'password-reset'){
            throw new Error('Invalid or expired token');
        }
        const tokenRecord= await UserModel.findVerificationToken(token, 'password_reset');
        if (!tokenRecord) {
            throw new Error('Invalid or expired token');
        }
        const userId= tokenRecord.user_id;
        const passwordHash= await aesEncryption.hashPassword(newPassword);
        await UserModel.updatePassword(userId, passwordHash);
        await UserModel.deleteVerificationToken(token); // Delete used token
        await redisClient.del(`user:${userId}`);
        
        const user= await UserModel.findUserById(userId);
        if(user){
            await UserEventService.publishAdminAlert({
                type: 'PASSWORD_RESET',
                message: `Password reset completed for user: ${user.email}`,
                severity: 'INFO',
                userId: user.id,
                userEmail: user.email
            });
        }
        return {message: 'Password reset successfully'};
    }
}

module.exports= authService;