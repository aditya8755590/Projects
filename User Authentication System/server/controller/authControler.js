import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';

export const register = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name | !email | !password) {
        return res.json({ success: false, message: 'Missing detail' })
    }
    try {
        const existingUser = await userModel.findOne({ email })
        if (existingUser) {
            return res.json({ success: false, message: "user alrady register" })
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new userModel({ name, email, password: hashedPassword });
        await user.save();
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            // check for the deployment
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // Email Sending Logic with Logs
        try {
            console.log(`Attempting to send email to ${email}`);
            const mailOptions = {
                from: process.env.SENDER_EMAIL,
                to: email,
                subject: 'Email Verification',
                text: `Welcome! Your account has been created with email: ${email}`
            };
            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', info.messageId);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // We don't return here, so the user is still registered, but we know email failed
        }

        return res.json({ success: true })
    }
    catch (error) {
        console.error('Registration error:', error);
        res.json({ success: false, message: error.message })
    }
}
export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ success: false, message: 'email and password required' })

    }
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "invalid email" })
        }
        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {

            return res.json({ success: false, message: "password is invalid" })

        }
        // user verify 
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            // check for the deployment
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        return res.json({ sucess: true });
    }
    catch (error) {
        res.json({ success: false, message: error.message })
    }
}
export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            // check for the deployment
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
        })
        return res.status(200).json({
            success: true,
            message: "Logged Out"
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Logout failed"
        });
    }
}
export const sendVerifyOtp = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await userModel.findById(userId);
        if (user.isAccountVerified) {
            return res.json({ success: false, message: "user already verified" })
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.varifyOtp = otp;
        user.varifyOtpExpireAt = Date.now() + 10 * 60 * 1000;
        await user.save();

        await transporter.sendMail({
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Email Verification OTP',
            text: `Your OTP for email verification is: ${otp}. It will expire in 10 minutes.`
        });

        res.json({ success: true, message: "OTP sent to email" })

    }
    catch (error) {
        res.json({ success: false, message: error.message })
    }
}
export const verifyEmail = async (req, res) => {
    const { userId, otp } = req.body;
    if (!userId || !otp) {
        return res.json({ success: false, message: "missing userId or otp" })
    }
    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "user not found" })
        }
        if (user.varifyOtp !== otp) {
            return res.json({ success: false, message: "invalid otp" })
        }
        if (user.varifyOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: "otp expired" })
        }
        user.isAccountVerified = true;
        user.varifyOtp = undefined;
        user.varifyOtpExpireAt = undefined;
        await user.save();
        res.json({ success: true, message: "email verified successfully" })
    }
    catch (error) {
        res.json({ success: false, message: error.message })
    }
}
export const isAuthenticated = (req, res) => {

    try {
        return res.json({ success: true, message: "Authorized" })
    }
    catch (error) {
        return res.json({ success: false, message: "Unauthorized" })
    }
}

// send Password reset otp
export const sendResetOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.json({ success: false, message: "email required" })
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "user not found" })
        }
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.resetOtp = otp;
        user.resetOtpExprireAt = Date.now() + 10 * 60 * 1000;
        await user.save();
        await transporter.sendMail({
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password Reset OTP',
            text: `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`
        });
        res.json({ success: true, message: "OTP sent to email" })
    }
    catch (error) {
        res.json({ success: false, message: error.message })
    }
}