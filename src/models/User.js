const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true
  },
  id_type: {
    type: String,
    required: true,
    trim: true
  },
  id_number: {
    type: String,
    required: true,
    trim: true
  },
  additional_attributes: {
    type: Object,
    default: {}
  },
  role: {
    type: String,
    enum: ['user', 'verifier'],
    default: 'user'
  }
}, {
  timestamps: true
});

// Remove password field from JSON responses
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
