const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransporter({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    async sendNotificationEmail(notification, userEmail) {
        try {
            const mailOptions = {
                from: process.env.SMTP_FROM || 'noreply@linkedin.com',
                to: userEmail,
                subject: notification.title,
                html: this.generateEmailTemplate(notification)
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', result.messageId);
            return result;
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }

    generateEmailTemplate(notification) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>LinkedIn Notification</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #0077b5; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background-color: #f9f9f9; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>LinkedIn</h1>
                    </div>
                    <div class="content">
                        <h2>${notification.title}</h2>
                        <p>${notification.message}</p>
                        <p>Click <a href="${process.env.FRONTEND_URL}/notifications">here</a> to view your notifications.</p>
                    </div>
                    <div class="footer">
                        <p>This is an automated message from LinkedIn. Please do not reply to this email.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }
}

module.exports = EmailService;