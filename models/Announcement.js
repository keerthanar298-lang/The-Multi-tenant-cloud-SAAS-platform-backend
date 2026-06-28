const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Please add a message']
  },
  category: {
    type: String,
    enum: ['General', 'Urgent', 'Maintenance', 'Event', 'Security'],
    default: 'General'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  target: {
    type: String,
    default: 'Tenants'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;
