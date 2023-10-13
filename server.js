const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({
  path: './config.env',
});

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

// eslint-disable-next-line no-console
mongoose.connect(DB).then(() => console.log('DB connection successful! 🥳'));

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}...`);
});

process.on('unhandledRejection', (error) => {
  console.log(error.name, error.message);
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');

  server.close(() => process.exit(1));
});
