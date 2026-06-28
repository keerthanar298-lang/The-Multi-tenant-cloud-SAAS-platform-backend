const express = require('express');
const router = express.Router();
const {
  createApartment,
  getAllApartments,
  getApartmentById,
  updateApartment,
  deleteApartment
} = require('../controllers/apartmentController');
const { protect, superAdminOrManager } = require('../middleware/authMiddleware');
const { apartmentUpload } = require('../config/cloudinary');

// Multiple file upload configuration
const apartmentFileFields = [
  { name: 'images', maxCount: 10 },
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
];

// @route   POST /api/apartments
// @access  Private (Superadmin/Manager)
router.post(
  '/',
  protect,
  superAdminOrManager,
  apartmentUpload.fields(apartmentFileFields),
  createApartment
);

// @route   GET /api/apartments
// @access  Public
router.get('/', getAllApartments);

// @route   GET /api/apartments/:id
// @access  Public
router.get('/:id', getApartmentById);

// @route   PATCH /api/apartments/:id
// @access  Private (Superadmin/Manager)
router.patch(
  '/:id',
  protect,
  superAdminOrManager,
  apartmentUpload.fields(apartmentFileFields),
  updateApartment
);

// @route   DELETE /api/apartments/:id
// @access  Private (Superadmin/Manager)
router.delete('/:id', protect, superAdminOrManager, deleteApartment);

module.exports = router;
