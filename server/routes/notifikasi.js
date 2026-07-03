const express = require('express');
const router = express.Router();
const notifikasiController = require('../controllers/notifikasiController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', notifikasiController.getAll);
router.get('/unread-count', notifikasiController.getUnreadCount);
router.put('/read-all', notifikasiController.markAllAsRead);
router.put('/:id/read', notifikasiController.markAsRead);

module.exports = router;
