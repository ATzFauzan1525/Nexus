const express = require('express');
const router = express.Router();
const disposisiController = require('../controllers/disposisiController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', authorize('KEPALA_SEKOLAH', 'GURU_STAF', 'WAKASEK'), disposisiController.getAll);
router.get('/:id', authorize('KEPALA_SEKOLAH', 'GURU_STAF', 'WAKASEK'), disposisiController.getById);
router.post('/', authorize('KEPALA_SEKOLAH'), disposisiController.create);

module.exports = router;
