const mongoose = require('mongoose');

const apartmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Apartment title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  propertyType: {
    type: String,
    default: 'Apartment'
  },
  listingType: {
    type: String,
    default: 'Rent'
  },
  price: {
    type: Number,
    required: [true, 'Price is required']
  },
  status: {
    type: String,
    enum: ['Available', 'Rented'],
    default: 'Available'
  },
  advancePayment: {
    type: Number,
    required: [true, 'Advance payment is required']
  },
  address: {
    type: String,
    required: [true, 'Address is required']
  },
  city: {
    type: String,
    required: [true, 'City is required']
  },
  state: {
    type: String,
    required: [true, 'State is required']
  },
  pincode: {
    type: String,
    required: [true, 'Pincode is required']
  },
  landmark: {
    type: String
  },
  googleMap: {
    type: String
  },
  bhkType: {
    type: String, // e.g., 1BHK, 2BHK, 3BHK
    required: [true, 'BHK type is required']
  },
  area: {
    type: Number, // sq.ft
    required: [true, 'Area in sq.ft is required']
  },
  floorNumber: {
    type: Number,
    required: [true, 'Floor number is required']
  },
  roomNumber: {
    type: String,
    required: [true, 'Room number is required']
  },
  furnishingType: {
    type: String,
    enum: ['fully', 'semi', 'unfurnished'],
    required: [true, 'Furnishing type is required']
  },
  bathroomCount: {
    type: Number,
    required: [true, 'Bathroom count is required']
  },
  balconiesCount: {
    type: Number,
    required: [true, 'Balconies count is required']
  },
  parkingAvailability: {
    type: String,
    enum: ['Yes', 'No'],
    required: [true, 'Parking availability is required']
  },
  images: {
    type: [String],
    default: []
  },
  video: {
    type: String
  },
  thumbnail: {
    type: String
  },
  amenities: {
    type: [String],
    default: []
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

const Apartment = mongoose.model('Apartment', apartmentSchema);
module.exports = Apartment;
