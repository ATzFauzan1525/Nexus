const express = require('express');
const router = express.Router();
const suratController = require('../controllers/suratController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(authenticate);

router.get('/', authorize('ADMIN_TU', 'KEPALA_SEKOLAH', 'GURU_STAF', 'WAKASEK'), suratController.getAll);
router.get('/stats', authorize('ADMIN_TU', 'KEPALA_SEKOLAH', 'GURU_STAF', 'WAKASEK'), suratController.getStats);
router.get('/posisi', authorize('ADMIN_TU', 'KEPALA_SEKOLAH', 'WAKASEK'), suratController.getPosisiAll);
router.get('/:id/download', authorize('ADMIN_TU', 'KEPALA_SEKOLAH', 'GURU_STAF', 'WAKASEK'), suratController.downloadFile);
router.get('/:id', authorize('ADMIN_TU', 'KEPALA_SEKOLAH', 'GURU_STAF', 'WAKASEK'), suratController.getById);
router.post('/', authorize('ADMIN_TU'), upload.single('file_scan'), suratController.create);

module.exports = router;
