const nodemailer = require('nodemailer');

// Create mail transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',  // or use your email service
    auth: {
        user: process.env.GEMAIL,  // your email
        pass: process.env.GPASS    // your email password
    }
});

module.exports = transporter