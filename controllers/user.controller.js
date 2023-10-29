const User = require('../models/user.model');

const AppError = require('../utils/app-error.utils');
const catchAsync = require('../utils/catch-async');

const filterObj = (requestObj, ...allowedFields) => {
  const newObj = {};
  Object.keys(requestObj).forEach((objField) => {
    if (allowedFields.includes(objField))
      newObj[objField] = requestObj[objField];
  });

  return newObj;
};

exports.getAllUsers = catchAsync(async (request, response) => {
  const users = await User.find();

  response.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.updateMe = catchAsync(async (request, response, next) => {
  // 1 Create error if user POST password data
  if (request.body.password || request.body.passwordConfirm)
    next(
      new AppError(
        'This route is not for password updates. Please use /update-my-password',
        400,
      ),
    );

  // 2 Filter unwanted fields that are not allowed to be updated
  const filteredBody = filterObj(request.body, 'name', 'email');

  // 3 update user document
  const updatedUser = await User.findByIdAndUpdate(
    request.user.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    },
  );

  response.status(200).json({
    status: 'success',
    data: { updatedUser },
  });
});

exports.deleteMe = catchAsync(async (request, response, next) => {
  await User.findByIdAndUpdate(request.user.id, { active: false });

  response.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createUser = (request, response) => {
  response.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

exports.getUser = (request, response) => {
  response.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

exports.updateUser = (request, response) => {
  response.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

exports.deleteUser = (request, response) => {
  response.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};
