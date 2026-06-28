const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage for user images
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'users',
    allowedFormats: ['jpg', 'png', 'jpeg']
  }
});

const upload = multer({ storage: storage });

// Storage for tenant files (images + PDFs for agreement)
const tenantStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'tenants',
    allowedFormats: ['jpg', 'png', 'jpeg', 'pdf'],
    resource_type: 'auto'
  }
});

const tenantUpload = multer({ storage: tenantStorage });

// Storage for apartment files (images + videos)
const apartmentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'apartments',
    allowedFormats: ['jpg', 'png', 'jpeg', 'mp4', 'mov', 'avi'],
    resource_type: 'auto'
  }
});

const apartmentUpload = multer({ storage: apartmentStorage });

module.exports = { cloudinary, upload, tenantUpload, apartmentUpload };

