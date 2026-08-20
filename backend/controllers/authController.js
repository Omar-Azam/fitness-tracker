import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isCloudinaryConfigured, uploadBufferToCloudinary } from '../config/cloudinary.js';

/**
 * Generate a signed JWT token for a given user ID
 */
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'fitness_tracker_jwt_secret_dev',
    { expiresIn: '30d' }
  );
};

/**
 * Format user payload without sensitive fields
 */
const sanitizeUser = (user) => {
  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    name: user.name,
    profilePicture: user.profilePicture,
    preferences: user.preferences,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { username, email, password, name, profilePicture, preferences } = req.body;

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim().toLowerCase();

    // Check if email already registered
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Check if username already taken
    const existingUsername = await User.findOne({ username: normalizedUsername });
    if (existingUsername) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    // Create user
    const user = await User.create({
      username: normalizedUsername,
      email: normalizedEmail,
      password,
      name: name ? name.trim() : '',
      profilePicture: profilePicture || '',
      preferences: preferences || undefined,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, username, emailOrUsername, password } = req.body;
    const identifier = (emailOrUsername || email || username).trim().toLowerCase();

    // Find user by either email or username
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid email/username or password' });
    }

    // Verify password match
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email/username or password' });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  return res.status(200).json({
    user: sanitizeUser(req.user),
  });
};

/**
 * @desc    Update user profile (name, profilePicture, preferences)
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { name, profilePicture, preferences } = req.body;

    if (name !== undefined) {
      user.name = name.trim();
    }

    if (profilePicture !== undefined) {
      user.profilePicture = profilePicture.trim();
    }

    if (preferences) {
      if (preferences.units) user.preferences.units = preferences.units;
      if (preferences.theme) user.preferences.theme = preferences.theme;
      if (preferences.notificationsEnabled !== undefined) {
        user.preferences.notificationsEnabled = preferences.notificationsEnabled;
      }
    }

    const updatedUser = await user.save();

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: sanitizeUser(updatedUser),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload user profile picture to Cloudinary
 * @route   PUT /api/auth/profile/picture
 * @access  Private
 */
export const uploadProfilePicture = async (req, res, next) => {
  try {
    // 1. Verify file was provided by multer
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        error: 'No image file uploaded. Please select a JPG, PNG, or WebP file under 2MB.',
      });
    }

    // 2. Verify Cloudinary environment configuration
    if (!isCloudinaryConfigured()) {
      return res.status(503).json({
        error: 'Cloudinary storage is not configured on the server. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment variables.',
      });
    }

    // 3. Find user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 4. Upload buffer to Cloudinary using deterministic public_id
    const publicId = `user_${user._id}`;
    const uploadResult = await uploadBufferToCloudinary(req.file.buffer, {
      public_id: publicId,
    });

    // 5. Update user model with secure_url
    user.profilePicture = uploadResult.secure_url;
    const updatedUser = await user.save();

    return res.status(200).json({
      message: 'Profile picture uploaded successfully',
      profilePicture: updatedUser.profilePicture,
      user: sanitizeUser(updatedUser),
    });
  } catch (error) {
    console.error('[Cloudinary Upload Error]:', error);
    return res.status(500).json({
      error: error.message || 'Failed to upload image to Cloudinary',
    });
  }
};
