const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Type is required'],
    enum: ['Lost', 'Found'],
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  contactInfo: {
    type: String,
    required: [true, 'Contact information is required'],
    trim: true
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Item', itemSchema);
