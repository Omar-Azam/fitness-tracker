import mongoose from 'mongoose';
import Notification from '../models/Notification.js';

/**
 * @desc    Get all notifications for logged-in user
 * @route   GET /api/notifications
 * @access  Private
 */
export const getNotifications = async (req, res, next) => {
  try {
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(30),
      Notification.countDocuments({ user: req.user._id, read: false }),
    ]);

    return res.status(200).json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
export const markNotificationAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const notification = await Notification.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    notification.read = true;
    const updatedNotification = await notification.save();

    return res.status(200).json({
      message: 'Notification marked as read',
      notification: updatedNotification,
    });
  } catch (error) {
    next(error);
  }
};
