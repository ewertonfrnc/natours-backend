const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please, tell us your name.'],
  },
  email: {
    type: String,
    required: [true, 'Please, provide your email.'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please, provide a valid email.'],
  },
  photo: { type: String },
  password: {
    type: String,
    required: [true, 'Please, provide a password.'],
    minLength: 8,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please, confirm your password.'],
    minLength: 8,
    validate: {
      // This only works on mongoose .create() and .save() method!
      message: 'Passwords are not the same.',
      validator: function (confirmPassword) {
        return confirmPassword === this.password;
      },
    },
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
