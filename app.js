const morgan = require('morgan');
const express = require('express');

const tourRouter = require('./routes/tour.routes');
const userRouter = require('./routes/user.routes');

const app = express();

// MIDDLEWARE
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use(express.json());
app.use((request, response, next) => {
  console.log('Hello from the middleware 👋');
  next();
});
app.use((request, response, next) => {
  request.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
