import express from 'express';
import {
  getNotifications,
  markNotificationAsRead,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware
router.use(protect);

router.get('/', getNotifications);
router.put('/:id/read', markNotificationAsRead);

export default router;
