const authService= require('../services/authService.js');
const { userRegistrationSchema, userLoginSchema } = require('../utils/validationSchema.js');

const authController= {
    async register(req,res,next){
        try{
            const {error, value}= userRegistrationSchema.validate(req.body);
            if(error){
                return res.status(400).json({error: error.details[0].message});
            }
            const { email, password, first_name, last_name, headline, location, industry, phone } = value;
            const { user, token } = await authService.registerUser(email, password, first_name, last_name, headline, location, industry, phone);
            
            res.status(201).json({
                message: 'User registered successfully',
                user: {
                    id: user.id,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name
                },
                token
            });
        }
        catch(err){
            if(err.message.includes('User already exists')){
                return res.status(400).json({error: 'User already exists'});
            }
            next(err);
        }
    },

    async login(req,res,next){
        try{
            const {error, value}= userLoginSchema.validate(req.body);
            if(error){
                return res.status(400).json({error: error.details[0].message});
            }
            const { email, password } = value;
            const isBlocked= await userModel.isUserBlocked(email);
            if(isBlocked){
                return res.status(403).json({error: 'Account is blocked. Please try again later.'});
            }
            const lastFailedLogin= await userModel.getLastFailedLogin(email);
            if(lastFailedLogin){
                const timeDiff= new Date() - new Date(lastFailedLogin);
                const minutes= Math.floor(timeDiff / (1000 * 60));
                if(minutes < 30){
                    return res.status(403).json({error: 'Account is blocked. Please try again later.'});
                }
                await userModel.resetFailedLogin(email);
            }
            const { user, token } = await authService.loginUser(email, password);
            return res.status(200).json({
                message: 'Login successful',
                user: {
                    id: user.id,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name
                },
                token
            });
        }
        catch(err){
            if(err.message.includes('Invalid credentials')){
                return res.status(401).json({error: 'Invalid credentials'});
            }
            next(err);
        }
    },

    async logout(req,res,next){
        try{
            await authService.logoutUser(req.user.id);
            res.status(200).json({message: 'Logged out successfully'});
        }
        catch(err){
            next(err);
        }
    },

    async forgotPassword(req,res,next){
        try{
            const {email}= req.body;
            if(!email){
                return res.status(400).json({error: 'Email is required'});
            }
            await authService.requestPasswordReset(email);
            res.status(200).json({message: 'Password reset email sent'});
        }
        catch(err){
            if(err.message.includes('User not found')){
                return res.status(404).json({error: 'User not found'});
            }
            next(err);
        }
    },

    async resetPassword(req,res,next){
        try{
            const {token, new_Password}= req.body;
            if(!token || !new_Password){
                return res.status(400).json({error: 'Token and new password are required'});
            }
            await authService.resetUserPassword(token, new_Password);
            res.status(200).json({message: 'Password reset successfully'});
        }
        catch(err){
            if(err.message.includes('Invalid or expired token')){
                return res.status(400).json({error: 'Invalid or expired token'});
            }
            next(err);
        }
    }
};

module.exports= authController;