const express = require('express');
const fs = require('fs');

const app = express();
app.use(express.json());

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

const getAllTours = (request, response) => {
  response.status(200).json({
    status: 'success',
    results: tours.length,
    data: { tours },
  });
};

const getTour = (request, response) => {
  const tour = tours.find((tour) => tour.id === +request.params.id);
  if (!tour)
    return response.status(404).json({
      status: 'failed',
      message: 'Invalid ID.',
    });

  response.status(200).json({
    status: 'success',
    data: { tour },
  });
};

const createTour = (request, response) => {
  const newID = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newID }, request.body);

  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      response.status(201).json({
        status: 'success',
        data: { tour: newTour },
      });
    }
  );
};

const upddateTour = (request, response) => {
  if (request.params.id > tours.length)
    return response.status(404).json({
      status: 'failed',
      message: 'Invalid ID.',
    });

  response.status(200).json({
    status: 'success',
    data: { tour: '<updated tour here>...' },
  });
};

const deleteTour = (request, response) => {
  response.status(204).json({
    status: 'success',
    data: null,
  });
};

app.route('/api/v1/tours').get(getAllTours).post(createTour);
app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(upddateTour)
  .delete(deleteTour);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`);
});
