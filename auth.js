const express = require('express');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const router = express.Router();

let otpCache = {}; // Temporary storage for OTPs (you can replace this with a database in production)

// Configure Nodemailer transport
const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
                user: 'aithavarunkumar01@gmail.com',
                pass: 'elrl ptcr qxdo vsed',
        },
});

// Function to generate OTP
function generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString(); 
}

// Route to send OTP to the user's email
router.post('/send-otp', (req, res) => {
        const { email } = req.body;

        if (!email) {
                return res.status(400).json({ message: 'Email is required' });
        }

        const otp = generateOTP();
        otpCache[email] = { otp, timestamp: Date.now() }; // Store OTP temporarily with a timestamp

        console.log('OTP sent:', otp); // Log the OTP
        console.log('OTP Cache:', otpCache); // Log the OTP cache

        const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Your OTP for HokMakeup',
                text: `Your OTP is: ${otp}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                        console.error('Error sending OTP:', error);
                        return res.status(500).json({ message: 'Error sending OTP', error: error.message });
                }
                console.log('Email sent:', info.response);
                res.status(200).json({ message: 'OTP sent successfully' });
        });
});

router.post('/verify-otp', (req, res) => {
        const { email, otp } = req.body;

        if (!email || !otp) {
                return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const storedOtpData = otpCache[email];
        if (!storedOtpData) {
                return res.status(400).json({ message: 'OTP not found or expired' });
        }

        // Log the stored OTP and entered OTP
        console.log('Stored OTP:', storedOtpData.otp);
        console.log('Entered OTP:', otp);
        console.log('Time Difference:', Date.now() - storedOtpData.timestamp);

        const otpExpirationTime = 5 * 60 * 1000; // 5 minutes expiration
        if (storedOtpData.otp === otp && Date.now() - storedOtpData.timestamp < otpExpirationTime) {
                const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
                delete otpCache[email]; // Clear OTP after use
                res.status(200).json({ message: 'OTP verified', token });
        } else {
                res.status(400).json({ message: 'Invalid OTP or OTP expired' });
        }
});

module.exports = router;
