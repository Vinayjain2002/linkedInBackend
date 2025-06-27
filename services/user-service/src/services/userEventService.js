const {publishToQueue}= require('../config/rabbitmq.js');

class UserEventService{
   /**
     * Publish user registration event to admin platform
     * @param {Object} userData - User registration data
     */

   static async publishUserRegistration(userData){
    try{
        const eventData = {
            eventType: 'USER_REGISTRATION',
            userId: userData.id,
            userEmail: userData.email,
            firstName: userData.first_name,
            lastName: userData.last_name,
            headline: userData.headline,
            location: userData.location,
            industry: userData.industry,
            phone: userData.phone,
            registrationDate: userData.created_at,
            metadata: {
                source: 'user-service',
                ipAddress: userData.ipAddress || null,
                userAgent: userData.userAgent || null
            }
        };
        await publishToQueue('user_registration', eventData);

        await publishToQueue('admin_logs', {
            eventType: 'USER_REGISTRATION',
            message: `New user registered: ${userData.email}`,
            severity: 'INFO',
            userId: userData.id,
            userEmail: userData.email
        });

        console.log(`User Registration Event Published for user: ${userData.email}`);
    }
    catch(err){
        console.error('Error publishing user registration event:', err);
        throw err;
    }
   }


    /**
     * Publish user login event to admin platform
     * @param {Object} userData - User login data
     */
    static async publishUserLogin(userData){
        try{
            const eventData = {
                eventType: 'USER_LOGIN',
                userId: userData.id,
                userEmail: userData.email,
                loginDate: new Date().toISOString(),
                metadata: {
                    source: 'user-service',
                    ipAddress: userData.ipAddress || null,
                    userAgent: userData.userAgent || null
                }
            };
            await publishToQueue('user_login', eventData);

            await publishToQueue('admin_logs', {
                eventType: 'USER_LOGIN',
                message: `User logged in: ${userData.email}`,
                severity: 'INFO',
                userId: userData.id,
                userEmail: userData.email
            });

            console.log(`User Login Event Published for user: ${userData.email}`);
        }
        catch(err){
            console.error('Error publishing user login event:', err);
            throw err;
        }
    }

    /**
     * Publish user profile update event to admin platform
     * @param {Object} userData - User profile update data
     */
    static async publishUserProfileUpdate(userData) {
        try {
            const eventData = {
                eventType: 'USER_PROFILE_UPDATE',
                userId: userData.id,
                userEmail: userData.email,
                updatedFields: userData.updatedFields,
                updateDate: new Date().toISOString(),
                metadata: {
                    source: 'user-service'
                }
            };

            await publishToQueue('user_profile_update', eventData);
            
            await publishToQueue('admin_logs', {
                eventType: 'USER_PROFILE_UPDATE',
                message: `User profile updated: ${userData.email}`,
                severity: 'INFO',
                userId: userData.id,
                userEmail: userData.email
            });

            console.log(`✅ User profile update event published for user: ${userData.email}`);
        } catch (error) {
            console.error('❌ Error publishing user profile update event:', error);
        }
    }

     /**
     * Publish admin alert for suspicious activity
     * @param {Object} alertData - Alert data
     */
     static async publishAdminAlert(alertData) {
        try {
            const eventData = {
                eventType: 'ADMIN_ALERT',
                alertType: alertData.type,
                message: alertData.message,
                severity: alertData.severity || 'WARNING',
                userId: alertData.userId,
                userEmail: alertData.userEmail,
                timestamp: new Date().toISOString(),
                metadata: {
                    source: 'user-service',
                    ipAddress: alertData.ipAddress || null,
                    userAgent: alertData.userAgent || null
                }
            };

            await publishToQueue('admin_logs', eventData);
            console.log(`✅ Admin alert published: ${alertData.message}`);
        } catch (error) {
            console.error('❌ Error publishing admin alert:', error);
        }
    }
}

module.exports= UserEventService;


