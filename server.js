const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (error) => {
  console.log(error.name, error.message);
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');

  process.exit(1);
});

dotenv.config({
  path: './config.env',
});

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB).then(() => console.log('DB connection successful! 🥳'));

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`);
});

process.on('unhandledRejection', (error) => {
  console.log(error.name, error.message);
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');

  server.close(() => process.exit(1));
});
