import express from 'express'
import  {getUserProfile} from '../controller/userControler.js';

import userAuth from '../middleware/userAuth.js';

const userRouter = express.Router();

userRouter.get('/profile', userAuth, getUserProfile);
//userRouter.put('/profile', userAuth, updateUserProfile);

export default userRouter;