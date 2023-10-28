const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const catchAsync = require('../utils/catch-async');
const User = require('../models/user.model');

const sendEmail = require('../utils/email.utils');
const AppError = require('../utils/app-error.utils');

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
    passwordChangedAt: request.body.passwordChangedAt,
    role: request.body.role,
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

exports.protect = catchAsync(async (request, response, next) => {
  let token;

  // 1 Getting token and check if it exists
  if (
    request.headers.authorization &&
    request.headers.authorization.startsWith('Bearer')
  ) {
    token = request.headers.authorization.split(' ')[1];

    if (!token) {
      return next(
        new AppError('You are not logged in! Please log in to get access.'),
        401,
      );
    }
  }

  // 2 Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3 Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401,
      ),
    );

  // 4 Check if user changed password after the token was created
  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401),
    );
  }

  // 5 Grant access to protected route
  request.user = currentUser;
  next();
});

exports.restrictTo = (...roles) =>
  catchAsync(async (request, response, next) => {
    if (!roles.includes(request.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403),
      );
    }

    next();
  });

exports.forgotPassword = catchAsync(async (request, response, next) => {
  // 1 Get user based on posted email
  const user = await User.findOne({ email: request.body.email });

  if (!user) {
    return next(new AppError('There is no user with this email address', 404));
  }

  // Generate random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Send token back to user's email
  const resetURL = `${request.protocol}://${request.get(
    'host',
  )}/api/v1/users/reset-password/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't, forget your password, please ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 minutes)',
      message,
    });

    response.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (error) {
    console.log('error', error);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending email. Try again later!', 500),
    );
  }
});

exports.resetPassword = catchAsync(async (request, response, next) => {
  // 1 Get user based on token

  const hashedToken = crypto
    .createHash('sha256')
    .update(request.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2 If token has not expired, and there is user, set new password

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = request.body.password;
  user.passwordConfirm = request.body.passwordConfirm;

  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3 Update changedPasswordAt property for the user
  // (made in userSchema.pre('save') in user.model.js

  // 4 log the user in, send jwt
  const token = signToken(user._id);
  response.status(200).json({
    status: 'success',
    token,
  });
});
