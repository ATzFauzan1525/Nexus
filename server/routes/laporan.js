const express = require('express');
const router = express.Router();
const laporanController = require('../controllers/laporanController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('ADMIN_TU'));

router.post('/generate', laporanController.generate);
router.get('/pdf', laporanController.exportPDF);

module.exports = router;
