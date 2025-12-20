const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    maxlength: 500
  },
  user: {
    type: String,
    required: true,
    maxlength: 20
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);
