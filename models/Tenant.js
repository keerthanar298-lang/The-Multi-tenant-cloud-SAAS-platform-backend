const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Auto-increment counter schema for tenantId
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

const tenantSchema = new mongoose.Schema({
  tenantId: {
    type: String,
    unique: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: 'male'
  },
  dateOfBirth: {
    type: Date
  },
  phoneNumber: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  profilePhoto: {
    type: String,
    default: ''
  },
  aadharCardNumber: {
    type: String,
    default: ''
  },
  panCardNumber: {
    type: String,
    default: ''
  },
  aadharCardPhoto: {
    type: String,
    default: ''
  },
  panCardPhoto: {
    type: String,
    default: ''
  },
  permanentAddress: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  state: {
    type: String,
    default: ''
  },
  pincode: {
    type: String,
    default: ''
  },
  apartmentName: {
    type: String,
    default: ''
  },
  floorNumber: {
    type: String,
    default: ''
  },
  flatNumber: {
    type: String,
    default: ''
  },
  ownerName: {
    type: String,
    default: ''
  },
  rentAmount: {
    type: Number,
    default: 0
  },
  securityDeposit: {
    type: Number,
    default: 0
  },
  leaseStartDate: {
    type: Date
  },
  leaseEndDate: {
    type: Date
  },
  numberOfMembers: {
    type: Number,
    default: 0
  },
  familyMemberNames: {
    type: [String],
    default: []
  },
  emergencyContactPerson: {
    type: String,
    default: ''
  },
  emergencyContactNumber: {
    type: String,
    default: ''
  },
  vehicleType: {
    type: String,
    enum: ['car', 'bike', 'none'],
    default: 'none'
  },
  vehicleNumber: {
    type: String,
    default: ''
  },
  parkingSlotNumber: {
    type: String,
    default: ''
  },
  occupation: {
    type: String,
    default: ''
  },
  companyName: {
    type: String,
    default: ''
  },
  agreementUpload: {
    type: String,
    default: ''
  },
  remarks: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, { timestamps: true });

// Auto-generate tenantId before saving (e.g., TEN-000001)
tenantSchema.pre('save', async function () {
  if (!this.tenantId) {
    const counter = await Counter.findByIdAndUpdate(
      'tenantId',
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.tenantId = 'TEN-' + String(counter.seq).padStart(6, '0');
  }
});

// Hash password before saving
tenantSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to check password validity
tenantSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Tenant = mongoose.model('Tenant', tenantSchema);
module.exports = Tenant;
