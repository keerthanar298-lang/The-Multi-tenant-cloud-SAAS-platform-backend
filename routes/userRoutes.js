const express = require('express');
const router = express.Router();
const { getManagers, getEmployees, updateUserByEmail } = require('../controllers/userController');
const { protect, superAdmin, superAdminOrManager } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

// Route to get all managers (protected, superadmin only)
router.get('/managers', protect, superAdmin, getManagers);

// Route to get all employees (protected, superadmin or manager)
router.get('/employees', protect, superAdminOrManager, getEmployees);

// Route to update a single user by email (protected, bearer token required)
router.patch('/update/:email', protect, upload.single('image'), updateUserByEmail);

module.exports = router;
