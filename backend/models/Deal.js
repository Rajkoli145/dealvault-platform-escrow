const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  // Placeholder fields
  title: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Deal', dealSchema);
