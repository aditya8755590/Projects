import express from 'express'
import { login, register, logout, isAuthenticated } from '../controller/authControler.js';
import { sendVerifyOtp, verifyEmail } from '../controller/authControler.js';
import userAuth from '../middleware/userAuth.js';
const authRouter = express.Router();
authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/send-verify-otp', userAuth, sendVerifyOtp);
authRouter.post('/verify-email', userAuth, verifyEmail);
authRouter.post('/isAuthenticated', userAuth, isAuthenticated);

export default authRouter;
