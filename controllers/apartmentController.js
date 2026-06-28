const Apartment = require("../models/Apartment");
const { getOrSetCache, invalidateCache } = require("../utils/cache");

// @desc    Create a new apartment
// @route   POST /api/apartments
// @access  Private (Superadmin/Manager)
const createApartment = async (req, res) => {
  try {
    const apartmentData = { ...req.body };

    // Add createdBy from logged in user
    apartmentData.createdBy = req.user._id;

    // Handle file uploads
    if (req.files) {
      // Multiple images
      if (req.files.images) {
        apartmentData.images = req.files.images.map((file) => file.path);
      }

      // Single video
      if (req.files.video && req.files.video[0]) {
        apartmentData.video = req.files.video[0].path;
      }

      // Single thumbnail
      if (req.files.thumbnail && req.files.thumbnail[0]) {
        apartmentData.thumbnail = req.files.thumbnail[0].path;
      }
    }

    // Parse arrays if they come as strings (common with form-data)
    if (typeof apartmentData.amenities === "string") {
      try {
        apartmentData.amenities = JSON.parse(apartmentData.amenities);
      } catch (e) {
        apartmentData.amenities = apartmentData.amenities
          .split(",")
          .map((item) => item.trim());
      }
    }

    const apartment = await Apartment.create(apartmentData);
    await invalidateCache("apartments:all");
    res.status(201).json(apartment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get all apartments
// @route   GET /api/apartments
// @access  Public
const getAllApartments = async (req, res) => {
  try {
    const apartments = await getOrSetCache("apartments:all", async () => {
      return await Apartment.find().populate("createdBy", "name email role");
    });
    res.json(apartments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get apartment by ID
// @route   GET /api/apartments/:id
// @access  Public
const getApartmentById = async (req, res) => {
  try {
    const apartment = await getOrSetCache(
      `apartment:${req.params.id}`,
      async () => {
        return await Apartment.findById(req.params.id).populate(
          "createdBy",
          "name email role",
        );
      },
    );
    if (!apartment) {
      return res.status(404).json({ message: "Apartment not found" });
    }
    res.json(apartment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update apartment
// @route   PATCH /api/apartments/:id
// @access  Private (Superadmin/Manager)
const updateApartment = async (req, res) => {
  try {
    let apartment = await Apartment.findById(req.params.id);
    if (!apartment) {
      return res.status(404).json({ message: "Apartment not found" });
    }

    const updateData = { ...req.body };

    // Handle file uploads
    if (req.files) {
      // Multiple images (if provided, replace current images or append? Usually replace if specified)
      if (req.files.images) {
        updateData.images = req.files.images.map((file) => file.path);
      }

      // Single video
      if (req.files.video && req.files.video[0]) {
        updateData.video = req.files.video[0].path;
      }

      // Single thumbnail
      if (req.files.thumbnail && req.files.thumbnail[0]) {
        updateData.thumbnail = req.files.thumbnail[0].path;
      }
    }

    // Parse amenities if it's a string
    if (updateData.amenities && typeof updateData.amenities === "string") {
      try {
        updateData.amenities = JSON.parse(updateData.amenities);
      } catch (e) {
        updateData.amenities = updateData.amenities
          .split(",")
          .map((item) => item.trim());
      }
    }

    const updatedApartment = await Apartment.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true },
    );

    await invalidateCache("apartments:all", `apartment:${req.params.id}`);
    res.json(updatedApartment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Delete apartment
// @route   DELETE /api/apartments/:id
// @access  Private (Superadmin/Manager)
const deleteApartment = async (req, res) => {
  try {
    const apartment = await Apartment.findById(req.params.id);
    if (!apartment) {
      return res.status(404).json({ message: "Apartment not found" });
    }

    await Apartment.findByIdAndDelete(req.params.id);
    await invalidateCache("apartments:all", `apartment:${req.params.id}`);
    res.json({ message: "Apartment removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  createApartment,
  getAllApartments,
  getApartmentById,
  updateApartment,
  deleteApartment,
};
