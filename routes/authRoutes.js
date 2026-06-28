const express = require('express');
const router = express.Router();
const { registerUser, loginUser, resetPassword } = require('../controllers/authController');
const { upload } = require('../config/cloudinary');
const { protect, superAdmin, superAdminOrManager } = require('../middleware/authMiddleware');

// Register user with image upload
router.post('/register', upload.single('image'), registerUser);

// Login user
router.post('/login', loginUser);

// Reset a user's password (superadmin or manager)
router.post('/reset-password', protect, superAdminOrManager, resetPassword);

module.exports = router;
