const Tour = require('../models/tour.model');

exports.aliasTopTours = async (request, response, next) => {
  request.query.limit = '5';
  request.query.sort = '-ratingsAverage,price';
  request.query.fields = 'name,price,ratingsAverage,summary,difficulty';

  next();
};

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

    // 4) Pagination
    const page = +request.query.page || 1;
    const limit = +request.query.limit || 100;
    const skip = (page - 1) * limit;

    // page=3&limit=10, 1-10 page 1, 11-20 page 2, 21-30 page 3
    query = query.skip(skip).limit(limit);

    if (request.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error('This page does not exist.');
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
