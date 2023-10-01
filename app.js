const express = require('express');
const fs = require('fs');

const app = express();
app.use(express.json());

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

app.get('/api/v1/tours', (request, response) => {
  response.status(200).json({
    status: 'success',
    results: tours.length,
    data: { tours },
  });
});

app.get('/api/v1/tours/:id', (request, response) => {
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
});

app.post('/api/v1/tours', (request, response) => {
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
});

app.patch('/api/v1/tours/:id', (request, response) => {
  if (request.params.id > tours.length)
    return response.status(404).json({
      status: 'failed',
      message: 'Invalid ID.',
    });

  response.status(200).json({
    status: 'success',
    data: { tour: '<updated tour here>...' },
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`);
});
