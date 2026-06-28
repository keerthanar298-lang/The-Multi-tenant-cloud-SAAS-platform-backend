const Announcement = require("../models/Announcement");
const { getOrSetCache, invalidateCache } = require("../utils/cache");

// @desc    Create a new announcement
// @route   POST /api/announcements
// @access  Private (Superadmin/Manager)
const createAnnouncement = async (req, res) => {
  try {
    const { title, message, category, target } = req.body;

    if (!title || !message) {
      return res
        .status(400)
        .json({ message: "Title and message are required" });
    }

    const announcement = await Announcement.create({
      title,
      message,
      category,
      target,
      createdBy: req.user._id,
    });

    await invalidateCache("announcements:active");
    res.status(201).json(announcement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get all active announcements
// @route   GET /api/announcements
// @access  Private (Authenticated Users)
const getAnnouncements = async (req, res) => {
  try {
    const announcements = await getOrSetCache(
      "announcements:active",
      async () => {
        return await Announcement.find({ isActive: true })
          .sort({ createdAt: -1 })
          .populate("createdBy", "username email");
      },
    );
    res.status(200).json(announcements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update an announcement
// @route   PUT /api/announcements/:id
// @access  Private (Superadmin/Manager)
const updateAnnouncement = async (req, res) => {
  try {
    const { title, message, category, target, isActive } = req.body;
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    announcement.title = title || announcement.title;
    announcement.message = message || announcement.message;
    announcement.category = category || announcement.category;
    announcement.target = target || announcement.target;
    if (isActive !== undefined) announcement.isActive = isActive;

    const updatedAnnouncement = await announcement.save();
    await invalidateCache("announcements:active");
    res.json(updatedAnnouncement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Delete an announcement (Soft delete)
// @route   DELETE /api/announcements/:id
// @access  Private (Superadmin/Manager)
const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    // Soft delete
    announcement.isActive = false;
    await announcement.save();
    await invalidateCache("announcements:active");

    res.json({ message: "Announcement removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  createAnnouncement,
  getAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
};
