const Flight  = require('../models/Flight');
const Booking = require('../models/Booking');

exports.handleChatQuery = async (req, res, next) => {
  try {
    const { message } = req.body;

    // Guard: cap input length to prevent prompt injection
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ reply: 'Please send a valid message.' });
    }
    const safeMessage = message.slice(0, 500);

    // ─── Gather all non-cancelled flights ─────────────────────────────────────
    const allFlights = await Flight.find({ status: { $ne: 'Cancelled' } })
      .sort({ departureTime: 1 })
      .lean();

    // ─── Gather user's bookings (if logged in) ────────────────────────────────
    let myBookings = [];
    if (req.user) {
      myBookings = await Booking.find({ user: req.user.id })
        .populate('flight')
        .sort({ createdAt: -1 })
        .lean();
    }

    // ─── Build structured context ─────────────────────────────────────────────
    const context = {
      availableFlights: allFlights.map((f) => {
        const dep  = new Date(f.departureTime);
        const arr  = new Date(f.arrivalTime);
        const durationMins = Math.round((arr - dep) / 60000);
        return {
          flightNumber:     f.flightNumber,
          airline:          f.airline,
          from:             f.departureAirport,
          to:               f.arrivalAirport,
          departureTime:    dep.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
          arrivalTime:      arr.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
          durationMins,
          status:           f.status,
          availableSeats:   f.availableSeats,
          totalSeats:       f.totalSeats,
          priceUSD:         f.price,
        };
      }),
      myBookings: myBookings.map((b) => ({
        reference:    b.bookingReference,
        flightNumber: b.flight?.flightNumber,
        from:         b.flight?.departureAirport,
        to:           b.flight?.arrivalAirport,
        departure:    b.flight?.departureTime
          ? new Date(b.flight.departureTime).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
          : 'N/A',
        seat:         b.seatNumber,
        passenger:    b.passengerName,
        status:       b.status,
        price:        b.totalPrice,
      })),
      isLoggedIn: !!req.user,
      userName:   req.user?.name || null,
    };

    // ─── Build prompt ─────────────────────────────────────────────────────────
    const prompt = `
You are SkyLink Assistant, a helpful AI for the SkyLink Flight Management System.

YOUR CAPABILITIES:
- Tell users about available flights (prices, seats, times, routes, duration, status)
- Help users find flights that match their travel needs
- Show users their booking history and status (if logged in)
- Guide users on HOW to book: "Go to the Flights page, click View Details on the flight, then click Book This Flight"
- Answer questions about cancellations: "Go to your Dashboard and click Cancel on the booking"

IMPORTANT RULES:
- You CANNOT directly make or cancel bookings — always guide users to use the website UI
- Use ONLY the data provided below — do not make up flights or prices
- If a user asks about a route and there are flights for it, list them clearly with price and seats
- If no flights match, say so honestly
- If "isLoggedIn" is false and user asks about their bookings, politely ask them to log in first
- Be friendly, concise, and helpful

LIVE DATA:
${JSON.stringify(context, null, 2)}

USER MESSAGE:
${safeMessage}
    `.trim();

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data  = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text
      || "I'm having trouble connecting right now. Please try again in a moment.";

    res.json({ reply });
  } catch (err) {
    next(err);
  }
};
