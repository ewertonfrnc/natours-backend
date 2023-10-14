const catchAsync = require('../utils/catch-async');

const User = require('../models/user.model');

exports.signup = catchAsync(async (request, response) => {
  const newUser = await User.create(request.body);

  response.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});
