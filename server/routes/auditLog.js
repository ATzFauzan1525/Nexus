const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLogController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('ADMIN_TU', 'KEPALA_SEKOLAH'));

router.get('/', auditLogController.getAll);

module.exports = router;
