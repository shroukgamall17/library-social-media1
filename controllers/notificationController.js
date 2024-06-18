const Notification = require("../models/notificationModel");
const User = require("../models/userModel");

const getNotificationsForUser = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 0;
    const notifications = await Notification.find({
      receiver: req.params.userId,
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const markNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { receiver: req.params.userId, isRead: false },
      { isRead: true }
    );
    res.json({ message: "Notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createNotification = async (senderId, receiverId, type, message) => {
  try {
    // Create a new notification
    const notification = new Notification({
      sender: senderId,
      receiver: receiverId,
      type,
      message,
    });

    await notification.save();

    await User.findByIdAndUpdate(receiverId, {
      $push: { notifications: notification._id },
    });

    console.log("Notification created successfully");
  } catch (err) {
    console.error("Error creating notification:", err);
  }
};
module.exports = {
  getNotificationsForUser,
  markNotificationsAsRead,
  createNotification,
};
