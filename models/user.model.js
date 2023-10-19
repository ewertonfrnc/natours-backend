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
    select: false,
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
  passwordChangedAt: Date,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  passwordFromRequestBody,
  userHashedPassword,
) {
  return await bcrypt.compare(passwordFromRequestBody, userHashedPassword);
};

userSchema.methods.changePasswordAfter = function (jwtTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );

    // true means the password was changed after the jwt was created
    return jwtTimeStamp < changedTimeStamp;
  }

  // false means the password didn't change
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
