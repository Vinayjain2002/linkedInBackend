const nodemailer= require('nodemailer');
const dotenv= require('dotenv');
dotenv.config();

const transporter= nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

transporter.verify((error, success)=>{
    if(error){
        console.error('Mailer Error:', error);
    }else{
        console.log('Mailer Connected Successfully');
    }
});

module.exports= transporter;