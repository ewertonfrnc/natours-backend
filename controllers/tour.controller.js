const APIFeatures = require('../utils/api-features.utils');
const Tour = require('../models/tour.model');

exports.aliasTopTours = async (request, response, next) => {
  request.query.limit = '5';
  request.query.sort = '-ratingsAverage,price';
  request.query.fields = 'name,price,ratingsAverage,summary,difficulty';

  next();
};

exports.getAllTours = async (request, response) => {
  try {
    // EXECUTE QUERY
    const features = new APIFeatures(Tour.find(), request.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const tours = await features.query;

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
