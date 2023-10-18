const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const catchAsync = require('../utils/catch-async');

exports.signup = catchAsync(async (request, response) => {
  const newUser = await User.create({
    name: request.body.name,
    email: request.body.email,
    password: request.body.password,
    passwordConfirm: request.body.passwordConfirm,
  });

  const token = jwt.sign({ _id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  response.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});
