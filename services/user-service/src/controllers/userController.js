const userService= require('../services/userService.js');
const {profileUpdateSchema}= require('../utils/validationSchema.js');

const userController= {
    async getProfile(req,res,next){
        try{
            const userId= req.user.id;
            const user= await userService.getUserProfile(userId);
            return res.status(200).json({
                message: 'User profile fetched successfully',
                user
            });
        }
        catch(err){
            if(err.message.includes('User not found')){
                return res.status(404).json({error: 'User not found'});
            }
            next(err);
        }
    },

    async updateProfile(req,res,next){
        try{
            const {error, value}= profileUpdateSchema.validate(req.body);
            if(error){
                return res.status(400).json({error: error.details[0].message});
            }
            const user = await userService.updateExistingProfile(req.user.id, value);
            return res.status(200).json({"message": "Profile Updated Successfully", user});
        }
        catch(err){
            if (error.message.includes('User not found')) {
                return res.status(404).json({ error: error.message });
            }
            if (error.message.includes('No valid fields to update')) {
                return res.status(400).json({ error: error.message });
            }
            next(err);
        }
    },

    async uploadProfilePicture(req, res, next) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }
            const pictureUrl = await userService.uploadUserProfilePicture(req.user.id);
            res.json({
                message: 'Profile picture updated successfully',
                profile_picture_url: pictureUrl
            });
        } catch (error) {
            next(error); // Multer errors are caught by the general error handler
        }
    },

    async deleteAccount(req, res, next) {
        try {
            await userService.deleteUserAccount(req.user.id);
            res.json({ message: 'Account deleted successfully' });
        } catch (error) {
            next(error);
        }
    },

    async searchUsers(req, res, next) {
        try {
            const { query, page = 1, limit = 10 } = req.query;
            const searchResult = await userService.searchUsers(query, page, limit);
            res.json(searchResult);
        } catch (error) {
            if (error.message.includes('Search query is required')) {
                return res.status(400).json({ error: error.message });
            }
            next(error);
        }
    },

    async getUserById(req, res, next) {
        try {
            const userId = req.params.id;
            const user = await userService.getUserById(userId);
            res.json(user);
        } catch (error) {
            if (error.message.includes('User not found') || error.message.includes('inactive')) {
                return res.status(404).json({ error: error.message });
            }
            next(error);
        }
    }
};

module.exports= userController;