const express = require('express');
const router = express.Router();
const { registerTenant, loginTenant, getAllTenants, updateTenant, updateTenantById, getTenantProfile, changePasswordTenant } = require('../controllers/tenantController');
const { protect } = require('../middleware/authMiddleware');
const { tenantUpload } = require('../config/cloudinary');

// File upload fields for tenant
const tenantFileFields = [
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'aadharCardPhoto', maxCount: 1 },
  { name: 'panCardPhoto', maxCount: 1 },
  { name: 'agreementUpload', maxCount: 1 }
];

// Register tenant with file uploads
router.post('/register', tenantUpload.fields(tenantFileFields), registerTenant);

// Login tenant
router.post('/login', loginTenant);

// Get all tenants (protected)
router.get('/', protect, getAllTenants);

// Get logged in tenant profile
router.get('/profile', protect, getTenantProfile);

// Change tenant password
router.patch('/change-password', protect, changePasswordTenant);

// Update tenant by email (protected, with file uploads)
router.patch('/update/:email', protect, tenantUpload.fields(tenantFileFields), updateTenant);

// Update tenant by tenantId (protected, with file uploads)
router.patch('/update-by-id/:tenantId', protect, tenantUpload.fields(tenantFileFields), updateTenantById);

module.exports = router;
