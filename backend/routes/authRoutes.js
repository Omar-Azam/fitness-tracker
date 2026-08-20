import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  uploadProfilePicture,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
} from '../middleware/validator.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { handleProfilePictureUpload } from '../middleware/upload.js';

const router = express.Router();

// Public auth routes with rate limiting
router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);

// Protected user routes
router.get('/me', protect, getMe);
router.put('/profile', protect, validateUpdateProfile, updateProfile);
router.put(
  '/profile/picture',
  protect,
  handleProfilePictureUpload,
  uploadProfilePicture
);

export default router;

