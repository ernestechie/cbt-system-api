import express from 'express';
import morgan from 'morgan';
import AppError from './modules/AppError';
import userRouter from './routes/userRoutes';

const app = express();

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use((req: any, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Routes
app.use('/api/v1/users', userRouter);

// Catch all "Undefined" routes.
app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Cannot find URL -> ${req.originalUrl}`,
  });
  next(new AppError(`Cannot find URL -> ${req.originalUrl}`, 404));
});

export default app;
