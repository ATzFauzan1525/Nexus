const express = require('express');
const router = express.Router({ mergeParams: true });
const komentarController = require('../controllers/komentarController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', komentarController.getBySurat);
router.post('/', komentarController.create);
router.delete('/:id', komentarController.delete);

module.exports = router;
