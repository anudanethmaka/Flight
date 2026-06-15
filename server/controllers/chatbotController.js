const Flight = require('../models/Flight');
const Booking = require('../models/Booking');

exports.handleChatQuery = async (req, res, next) => {
  try {
    const { message } = req.body;

    const upcomingFlights = await Flight.find({ departureTime: { $gte: new Date() } })
      .limit(10)
      .lean();

    let myBookings = [];
    if (req.user) {
      myBookings = await Booking.find({ user: req.user.id })
        .populate('flight')
        .lean();
    }

    const context = {
      upcomingFlights: upcomingFlights.map((f) => ({
        flightNumber: f.flightNumber,
        from: f.departureAirport,
        to: f.arrivalAirport,
        departureTime: f.departureTime,
        status: f.status,
        availableSeats: f.availableSeats,
        price: f.price,
      })),
      myBookings: myBookings.map((b) => ({
        reference: b.bookingReference,
        flightNumber: b.flight?.flightNumber,
        status: b.status,
        seat: b.seatNumber,
      })),
      isLoggedIn: !!req.user,
    };

    const prompt = `
You are a helpful assistant for the SkyLink Flight Management System.
Use ONLY the data below to answer the user's question. If the answer
isn't in the data, say you don't have that information.

If "isLoggedIn" is false, "myBookings" will be empty — in that case,
if the user asks about "my booking", politely tell them to log in
to check their booking status.

DATA:
${JSON.stringify(context)}

USER QUESTION:
${message}
    `.trim();

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text
      || "Sorry, I couldn't process that right now.";

    res.json({ reply });
  } catch (err) {
    next(err);
  }
};
