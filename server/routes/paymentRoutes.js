const express = require('express');
const { createPaymentIntent } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/payments/create-intent — create Stripe PaymentIntent (protected)
router.post('/create-intent', protect, createPaymentIntent);

module.exports = router;
