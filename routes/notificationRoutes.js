const express = require('express');
const notificationController = require("../controllers/notificationController");
const router = express.Router();


router.get('/:userId',notificationController.getNotificationsForUser)

router.patch('/:userId/read',notificationController.markNotificationsAsRead )

router.post('/create', async (req, res) => {
    const { senderId, receiverId, type, message } = req.body;
  
    try {
      await notificationController.createNotification(senderId, receiverId, type, message);
      res.status(200).json({ message: 'Notification created successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error creating notification', error: err.message });
    }
  });
module.exports = router;