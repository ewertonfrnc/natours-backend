const morgan = require('morgan');
const express = require('express');

const AppError = require('./utils/app-error.utils');
const globalErrorHandler = require('./controllers/error.controller');

const tourRouter = require('./routes/tour.routes');
const userRouter = require('./routes/user.routes');

const app = express();

// MIDDLEWARE
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use(express.json());
app.use((request, response, next) => {
  request.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (request, response, next) => {
  next(new AppError(`Can't find ${request.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
