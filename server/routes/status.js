const express = require('express');
const router = express.Router();
const statusController = require('../controllers/statusController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.post('/', authorize('GURU_STAF'), statusController.updateStatus);

module.exports = router;
