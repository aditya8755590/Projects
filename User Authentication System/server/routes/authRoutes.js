import express from 'express'
import { login, register, logout, isAuthenticated,sendResetOtp,resetPassword } from '../controller/authControler.js';
import { sendVerifyOtp, verifyEmail } from '../controller/authControler.js';
import userAuth from '../middleware/userAuth.js';
const authRouter = express.Router();
authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/send-verify-otp', userAuth, sendVerifyOtp);
authRouter.post('/verify-email', userAuth, verifyEmail);
// how this is work?
// This route is protected by userAuth middleware, which checks if the user is authenticated.
// If the user is authenticated, the verifyEmail function is called to handle the email verification logic.

authRouter.post('/isAuthenticated', userAuth, isAuthenticated);
authRouter.post('/send-reset-otp', sendResetOtp);
authRouter.post('/reset-password', resetPassword);

export default authRouter;
