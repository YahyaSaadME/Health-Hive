
const otpGenerator = require('otp-generator');
const transporter = require('./emailSender')


// Function to send OTP
const sendOTP = async (email, otp) => {
    const mailOptions = {
        from: process.env.GEMAIL,
        to: email,
        subject: 'Your OTP for 2-factor Authentication',
        text: `Your OTP is ${otp}. It is valid for 10 minutes.`
    };

    await transporter.sendMail(mailOptions);
};


module.exports = sendOTP