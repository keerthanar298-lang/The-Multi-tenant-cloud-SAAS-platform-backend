const User = require("../models/User");
const { getOrSetCache, invalidateCache } = require("../utils/cache");

// @desc    Get all managers
// @route   GET /api/users/managers
// @access  Private/SuperAdmin
const getManagers = async (req, res) => {
  try {
    const managers = await getOrSetCache("users:managers", async () => {
      return await User.find({ role: "manager" }).select("-password");
    });
    res.json(managers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get all employees
// @route   GET /api/users/employees
// @access  Private/SuperAdmin or Manager
const getEmployees = async (req, res) => {
  try {
    const employees = await getOrSetCache("users:employees", async () => {
      return await User.find({ role: "employee" }).select("-password");
    });
    res.json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update a single user's details by email
// @route   PATCH /api/users/update/:email
// @access  Private (Bearer Token required)
const updateUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found with this email" });
    }

    // Fields allowed to be updated (email cannot be changed as it is the unique identifier)
    const { username, phoneNumber, address, status, role } = req.body;

    if (username !== undefined) user.username = username;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (address !== undefined) user.address = address;
    if (status !== undefined) user.status = status;
    if (role !== undefined) user.role = role;

    // If a new image was uploaded, update the Cloudinary URL
    if (req.file && req.file.path) {
      user.image = req.file.path;
    }

    const updatedUser = await user.save();
    await invalidateCache("users:managers", "users:employees");

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      image: updatedUser.image,
      phoneNumber: updatedUser.phoneNumber,
      address: updatedUser.address,
      role: updatedUser.role,
      status: updatedUser.status,
      updatedAt: updatedUser.updatedAt,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { getManagers, getEmployees, updateUserByEmail };
