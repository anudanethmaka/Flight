const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_CONFIGURED =
  /^sk_(test|live)_/.test(STRIPE_SECRET_KEY) &&
  !STRIPE_SECRET_KEY.includes('your_') &&
  STRIPE_SECRET_KEY.length > 30;

const stripe = STRIPE_CONFIGURED ? require('stripe')(STRIPE_SECRET_KEY) : null;
const Flight  = require('../models/Flight');

// ─── Create PaymentIntent ─────────────────────────────────────────────────────
// Body: { flightId, passengerCount }
// Returns: { clientSecret, amount, currency }
exports.createPaymentIntent = async (req, res, next) => {
  try {
    if (!stripe) {
      return res.status(503).json({ message: 'Stripe payments are not configured.' });
    }

    const { flightId, passengerCount = 1 } = req.body;

    const flight = await Flight.findById(flightId);
    if (!flight) return res.status(404).json({ message: 'Flight not found' });

    const count = Math.max(1, Math.min(6, Number(passengerCount)));

    if (flight.availableSeats < count) {
      return res.status(400).json({
        message: `Only ${flight.availableSeats} seat(s) available for this flight.`,
      });
    }

    // Amount in cents (Stripe requires smallest currency unit)
    const amountCents = Math.round(flight.price * count * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount:   amountCents,
      currency: 'usd',
      metadata: {
        flightId:       flightId.toString(),
        flightNumber:   flight.flightNumber,
        userId:         req.user.id.toString(),
        passengerCount: count.toString(),
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount:       amountCents,
      currency:     'usd',
      flightNumber: flight.flightNumber,
    });
  } catch (err) {
    next(err);
  }
};
