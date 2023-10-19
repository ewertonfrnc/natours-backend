const User = require('../models/user.model');
const catchAsync = require('../utils/catch-async');

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
