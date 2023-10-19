const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const AppError = require('../utils/app-error.utils');
const catchAsync = require('../utils/catch-async');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signup = catchAsync(async (request, response) => {
  const newUser = await User.create({
    name: request.body.name,
    email: request.body.email,
    password: request.body.password,
    passwordConfirm: request.body.passwordConfirm,
  });

  const token = signToken(newUser._id);

  response.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (request, response, next) => {
  const { email, password } = request.body;

  //   1 Check if email and password exist
  if (!email || !password)
    return next(new AppError('Please provide email and password', 400));

  //   2 Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError('Incorrect email or password', 401));

  //    3 if everything is ok, send token to client
  const token = signToken(user._id);
  response.status(200).json({
    status: 'success',
    token,
  });
});
