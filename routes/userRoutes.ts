import express from 'express';
import {
  forgotPassword,
  login,
  resetPassword,
  signup,
} from '../controllers/authController';

const userRouter = express.Router();

userRouter.post('/login', login);
userRouter.post('/signup', signup);
userRouter.post('/forgot-password', forgotPassword);
userRouter.patch('/reset-password/:token', resetPassword);

export default userRouter;
