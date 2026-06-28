const express = require('express');
const router = express.Router();
const {
  createAnnouncement,
  getAnnouncements,
  updateAnnouncement,
  deleteAnnouncement
} = require('../controllers/announcementController');
const { protect, superAdminOrManager } = require('../middleware/authMiddleware');

// Route setup
router.route('/')
  .post(protect, superAdminOrManager, createAnnouncement)
  .get(protect, getAnnouncements);

router.route('/:id')
  .put(protect, superAdminOrManager, updateAnnouncement)
  .delete(protect, superAdminOrManager, deleteAnnouncement);

module.exports = router;
