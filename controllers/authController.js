const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key_change_me', {
    expiresIn: '30d'
  });
};

// @desc    Register superadmin or user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { username, email, password, phoneNumber, address, role } = req.body;

    // Check if user exists
    let userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Get image from cloudinary if uploaded
    let imageUrl = '';
    if (req.file && req.file.path) {
      imageUrl = req.file.path; // Cloudinary URL provided by multer-storage-cloudinary
    }

    // Determine the role (default to user, but allow passing explicit role for superadmin setup)
    // In a real production app, superadmin registration should be protected. 
    // Allowing it here for the initial setup.
    const userRole = role || 'user';

    const user = await User.create({
      username,
      email,
      password,
      phoneNumber,
      address,
      image: imageUrl,
      role: userRole,
      status: 'active'
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        image: user.image,
        role: user.role,
        status: user.status,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Errors' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Check status
      if (user.status !== 'active') {
        return res.status(403).json({ message: 'Account is not active' });
      }

      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        image: user.image,
        role: user.role,
        status: user.status,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Reset a user's password (Superadmin only)
// @route   POST /api/auth/reset-password
// @access  Private/SuperAdmin
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Email and newPassword are required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    // Assign new plain password — bcrypt pre-save hook will hash it automatically
    user.password = newPassword;
    await user.save();

    res.json({ message: `Password has been reset successfully for ${email}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  resetPassword
};
