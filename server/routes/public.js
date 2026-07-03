const express = require('express');
const router = express.Router();
const suratController = require('../controllers/suratController');
const rateLimit = require('express-rate-limit');

// Rate limit for public tracking endpoint (BR-17)
const lacakLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per IP per window
  message: { message: 'Terlalu banyak permintaan. Silakan coba lagi dalam 15 menit.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get('/lacak', lacakLimiter, suratController.trackByNomor);

module.exports = router;
