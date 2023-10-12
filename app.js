const morgan = require('morgan');
const express = require('express');

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
  response.status(404).json({
    status: 'fail',
    message: `Can't find ${request.originalUrl} on this server!`,
  });
});

module.exports = app;
