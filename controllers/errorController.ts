import { NextFunction, Request, Response } from 'express';
import AppError from '../modules/AppError';

const sendErrDevelopment = (err: any, res: Response) => {
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
  });
};

const sendErrProduction = (err: AppError, res: Response) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong.',
    });
  }
};

const handleJwtError = () => {
  return new AppError(`Invalid token. Please login again.`, 400);
};

const handleJwtExpiredError = () => {
  return new AppError(`Token expired. Please login again.`, 400);
};

const handleValidateErrorDB = (err: any) => {
  const errors = Object.values(err.errors).map((el: any) => el.message);

  const message = `Invalid input data. ${errors.join(', ')}`;

  return new AppError(message, 400);
};

export const globalErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Global Error -> ', err.name);

  err.status = err.status || 'error';
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === 'development') sendErrDevelopment(err, res);
  else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    if (error.name === 'ValidationError') error = handleValidateErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJwtError();
    if (error.name === 'TokenExpiredError') error = handleJwtExpiredError();

    sendErrProduction(error, res);
  }

  next();
};

export const catchErrorAsync = (func: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    func(req, res, next).catch(next);
  };
};
