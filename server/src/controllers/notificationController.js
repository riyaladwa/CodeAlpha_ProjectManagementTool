import { Notification } from '../models/Notification.js';

export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    return res.status(200).json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found.',
      });
    }

    const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });

    return res.status(200).json({
      success: true,
      notification,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read.',
      unreadCount: 0,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Notification.findOneAndDelete({ _id: id, userId: req.user._id });

    const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });

    return res.status(200).json({
      success: true,
      message: 'Notification removed.',
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};
