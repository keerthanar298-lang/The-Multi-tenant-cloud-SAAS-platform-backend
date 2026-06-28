const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  respondToComplaint,
  updateTrackingStatus,
  grantPermission,
  finalizeCompletion
} = require('../controllers/complaintController');
const { protect, superAdminOrManager } = require('../middleware/authMiddleware');

// Route to create complaint (Tenant)
router.post('/', protect, createComplaint);

// Route to get complaints (Tenant/Manager/Employee)
router.get('/', protect, getComplaints);

// Route for Manager response and assignment (Manager/Superadmin)
router.put('/:id/respond', protect, superAdminOrManager, respondToComplaint);

// Route for Employee to update tracking status (Employee)
router.put('/:id/tracking', protect, updateTrackingStatus);

// Route for Tenant to grant permission (Tenant)
router.put('/:id/approve', protect, grantPermission);

// Route for Employee to finalize completion (Employee)
router.put('/:id/complete', protect, finalizeCompletion);

module.exports = router;
