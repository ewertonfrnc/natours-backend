const AppError = require('../utils/app-error.utils');

const handleCastErrorDB = (error) => {
  const message = `Invalid ${error.path}: ${error.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (error) => {
  const value = error.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;

  return new AppError(message, 400);
};

const handleValidationErrorDB = (error) => {
  const errors = Object.values(error.errors).map((err) => err.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired. Please log in again!', 401);

const sendErrorDev = (error, response) => {
  response.status(error.statusCode).json({
    status: error.status,
    error: error,
    message: error.message,
    stack: error.stack,
  });
};

const sendErrorProd = (error, response) => {
  if (error.isOperational) {
    // Operational, trusted error: sendo message to client
    response.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });

    // Programming or other unknown error: don't leak error details
  } else {
    console.log('ERROR 💥', error);

    response.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

module.exports = (error, request, response, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  if (process.env.NODE_ENV === 'development') sendErrorDev(error, response);

  if (process.env.NODE_ENV === 'production') {
    let errorCopy = { ...error, name: error.name };

    if (errorCopy.name === 'CastError') errorCopy = handleCastErrorDB(error);
    if (errorCopy.code === 11000) errorCopy = handleDuplicateFieldsDB(error);
    if (errorCopy.name === 'ValidationError')
      errorCopy = handleValidationErrorDB(error);

    if (errorCopy.name === 'JsonWebTokenError') errorCopy = handleJWTError();
    if (errorCopy.name === 'TokenExpiredError')
      errorCopy = handleJWTExpiredError();

    sendErrorProd(errorCopy, response);
  }
};
