const Notification = require('../models/Notification');

// GET /api/notifications  - current user's notifications (newest first)
exports.getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    res.json({ notifications, unreadCount });
  } catch (err) {
    next(err);
  }
};

// PUT /api/notifications/:id/read  - mark a single notification as read
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    notification.isRead = true;
    await notification.save();
    res.json(notification);
  } catch (err) {
    next(err);
  }
};

// PUT /api/notifications/read-all  - mark all of the user's notifications as read
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/notifications/:id  - delete a single notification
exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    next(err);
  }
};
