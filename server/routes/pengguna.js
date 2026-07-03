const express = require('express');
const router = express.Router();
const penggunaController = require('../controllers/penggunaController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// Guru-staf list — bisa diakses KEPALA_SEKOLAH (untuk buat disposisi)
router.get('/guru-staf', authorize('ADMIN_TU', 'KEPALA_SEKOLAH'), penggunaController.getGuruStaf);

// Semua route di bawah ini hanya ADMIN_TU
router.get('/', authorize('ADMIN_TU'), penggunaController.getAll);
router.get('/:id', authorize('ADMIN_TU'), penggunaController.getById);
router.post('/', authorize('ADMIN_TU'), penggunaController.create);
router.put('/:id', authorize('ADMIN_TU'), penggunaController.update);
router.put('/:id/password', authorize('ADMIN_TU'), penggunaController.updatePassword);
router.delete('/:id', authorize('ADMIN_TU'), penggunaController.delete);

module.exports = router;
