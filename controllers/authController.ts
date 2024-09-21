import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import UserModel from '../models/userModel';
import AppError from '../modules/AppError';
import { CBTRequestType } from '../types';
import {
  CBTResetPasswordBodyType,
  CBTResetPasswordParamsType,
} from '../types/request';
import signJwtToken from '../utils/cbAssignJwt';
import cbtSendEmail from '../utils/cbtSendEmail';
import { catchErrorAsync } from './errorController';

const jwtSecret = process.env.JWT_SECRET as string;

// Signup / Register
export const signup = catchErrorAsync(
  async (req: CBTRequestType, res: Response, next: NextFunction) => {
    const { requestTime } = req;

    const user = await UserModel.create(req.body);
    const token = signJwtToken({ userId: String(user._id), next });

    if (user._id) {
      res.status(201).json({
        status: 'success',
        data: { user, token, requestTime },
        message: 'Signup successful',
      });
    }
  }
);

// Login
export const login = catchErrorAsync(
  async (req: CBTRequestType, res: Response, next: NextFunction) => {
    const { requestTime } = req;
    const { email, password } = req.body;

    if (!email || !password)
      return next(new AppError('Please provide email and password', 400));

    const user = await UserModel.findOne({
      email,
    }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Invalid Email or Password', 401));
    }

    const token = signJwtToken({ userId: String(user._id), next });

    res.status(200).json({
      status: 'success',
      data: { user, token, requestTime },
      message: 'Successfully logged in',
    });
  }
);

// Fogotten Password
export const forgotPassword = catchErrorAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { body } = req;

    // 1. Get user by email
    const user = await UserModel.findOne({ email: body.email });

    if (!user) {
      return next(new AppError('User with this email does not exist.', 404));
    }

    // 2. Generate and store a random reset token
    const userToken = await user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3. Send token to user email
    const resetURL = `${req.protocol}:${req.get(
      'host'
    )}/api/v1/users/reset-password/${userToken}`;

    await cbtSendEmail({
      recipients: [user.email],
      subject: 'Reset Password (Expires in 30 Mins)',
      text: `
      Hello, ${user.name},\n
      A request to change your password has been made, below is a link to reset your password.\n
      Link: ${resetURL}\n\n
      Kindly ignore if you did not request this.
    `,
    })
      .then((res) => console.log('cbtSendEmail -> ', res))
      .catch(async (err) => {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save({ validateBeforeSave: false });
        return next(
          new AppError('Error! Something went wrong when sending email.', 500)
        );
      });

    res.status(200).json({
      status: 'success',
      message: 'Password reset token sent to email.',
    });
  }
);

// Reset Password
export const resetPassword = catchErrorAsync(
  async (
    req: Request<CBTResetPasswordParamsType, {}, CBTResetPasswordBodyType, {}>,
    res: Response,
    next: NextFunction
  ) => {
    const { newPassword, passwordConfirm } = req.body;
    const { token } = req.params;

    // Get user based on token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Check if token has expired or if user exists
    const user = await UserModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return next(new AppError('Invalid or expired token.', 400));
    }

    // Update the password and  properties for the current user
    user.password = newPassword;
    user.passwordConfirm = passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    // Log user in by sending JWT
    const newToken = signJwtToken({ userId: String(user._id), next });

    res.status(200).json({
      status: 'success',
      data: {
        token: newToken,
      },
      message: 'Password reset successful.',
    });
  }
);

// Protected Route Middleware
export const protectRoute = catchErrorAsync(
  async (req: CBTRequestType, res: Response, next: NextFunction) => {
    const { headers } = req;

    const token = headers.authorization || '';
    const userToken = token.replace('Bearer ', '').trim() || '';

    // Get the user token.
    if (!token || !userToken) {
      return next(new AppError('Please login to gain access.', 401));
    }

    // Validate user token.
    // const decoded = await promisify(jwt.verify)(userToken, jwtSecret);
    const decoded = jwt.verify(userToken, jwtSecret);

    console.log(decoded);

    // Check if user exists.
    // const foundUser = await UserModel.findById(decoded.id);
    // if (!foundUser) {
    //   return next(new AppError('Invalid user. Please create an account.', 401));
    // }

    // // Check if password changed after token was created.
    // if (await foundUser.changedPasswordAfter(decoded.iat)) {
    //   return next(new AppError('Password changed since last login.', 401));
    // }

    // // Grant access to protected route
    // req.user = foundUser;
    next();
  }
);

// User Roles and Permissions
export const restrictTo =
  (roles: string[]) =>
  (req: CBTRequestType, res: Response, next: NextFunction) => {
    const userRole = req.user?.role || 'USER';

    const hasPermission = roles.includes(userRole);

    if (!hasPermission)
      return next(
        new AppError('You are not authorized to perform this action.', 403)
      );

    next();
  };
