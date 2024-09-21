import jwt from 'jsonwebtoken';
import AppError from '../modules/AppError';
import { CBTJwtSignType } from '../types';

const jwtSecret = process.env.JWT_SECRET as string;

const signJwtToken = ({ userId, next }: CBTJwtSignType) => {
  if (!userId) return next(new AppError('Invalid user Id', 400));

  const token = jwt.sign({ id: userId }, jwtSecret, {
    expiresIn: process.env.JWT_EXPIRY,
  });

  return token;
};

export default signJwtToken;
