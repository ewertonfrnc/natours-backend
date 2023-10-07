const Tour = require('../models/tour.model');

exports.getAllTours = async (request, response) => {
  try {
    // BUILD QUERY
    // 1.1) Filtering
    const queryObj = { ...request.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((field) => delete queryObj[field]);

    // 1.2) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (matchedString) => `$${matchedString}`,
    );

    let query = Tour.find(JSON.parse(queryStr));

    // 2) Sorting
    if (request.query.sort) {
      const sortBy = request.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // 3) Field limiting
    if (request.query.fields) {
      const fields = request.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // EXECUTE QUERY
    const tours = await query;

    return response.status(200).json({
      status: 'success',
      results: tours.length,
      data: { tours },
    });
  } catch (err) {
    return response.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTour = async (request, response) => {
  try {
    const tour = await Tour.findById(request.params.id);

    return response.status(200).json({
      status: 'success',
      data: { tour },
    });
  } catch (err) {
    return response.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.createTour = async (request, response) => {
  try {
    const newTour = await Tour.create(request.body);

    return response.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    return response.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateTour = async (request, response) => {
  try {
    const tour = await Tour.findByIdAndUpdate(request.params.id, request.body, {
      new: true,
      runValidators: true,
    });

    return response.status(200).json({
      status: 'success',
      data: { tour },
    });
  } catch (err) {
    return response.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteTour = async (request, response) => {
  try {
    await Tour.findByIdAndDelete(request.params.id);

    return response.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    return response.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
