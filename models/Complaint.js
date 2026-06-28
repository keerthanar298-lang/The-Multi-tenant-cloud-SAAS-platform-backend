const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  tenantName: {
    type: String,
    required: true
  },
  flatNumber: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Plumbing', 'Electrical', 'Carpentry', 'Cleaning', 'Security', 'Other'],
    default: 'Other'
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: [
      'Pending',
      'Responded',
      'In Progress',
      'Work Finished',
      'Permission Granted',
      'Completed'
    ],
    default: 'Pending'
  },
  managerResponse: {
    type: String,
    default: ''
  },
  assignedEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Assuming employees are in User model with role 'employee'
  },
  employeeName: {
    type: String,
    default: ''
  },
  trackingStatus: {
    type: String,
    default: 'Waiting for assignment'
  },
  tenantPermission: {
    type: Boolean,
    default: false
  },
  workFinishedAt: {
    type: Date
  },
  permissionGrantedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  appointmentDate: {
    type: Date,
    default: null
  },
  remarks: {
    type: String,
    default: ''
  }
}, { timestamps: true });

const Complaint = mongoose.model('Complaint', complaintSchema);
module.exports = Complaint;
