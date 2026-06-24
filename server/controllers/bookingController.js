const Booking  = require('../models/Booking');
const Flight   = require('../models/Flight');
const Notification = require('../models/Notification');
const { generateBookingRef } = require('../utils/generateBookingRef');

// ─── CREATE booking(s) — supports multi-passenger ────────────────────────────
// Body: { flightId, passengers: [{ seatNumber, passengerName, passengerAge }] }
// Legacy single-passenger body still supported for backward compat.
exports.createBooking = async (req, res, next) => {
  try {
    const { flightId, passengers, seatNumber, passengerName, passengerAge } = req.body;

    // Normalise: support both multi-passenger array and legacy single-passenger fields
    const passengerList = Array.isArray(passengers) && passengers.length > 0
      ? passengers
      : [{ seatNumber, passengerName, passengerAge }];

    if (!flightId) {
      return res.status(400).json({ message: 'Flight is required' });
    }

    if (passengerList.length > 6) {
      return res.status(400).json({ message: 'A maximum of 6 passengers can be booked at once' });
    }

    for (let i = 0; i < passengerList.length; i++) {
      const passenger = passengerList[i];
      if (!passenger.passengerName?.trim() || !passenger.seatNumber?.trim()) {
        return res.status(400).json({ message: `Passenger ${i + 1}: name and seat are required` });
      }
      if (passenger.passengerAge !== undefined && passenger.passengerAge !== '') {
        const age = Number(passenger.passengerAge);
        if (!Number.isInteger(age) || age < 1 || age > 120) {
          return res.status(400).json({ message: `Passenger ${i + 1}: age must be between 1 and 120` });
        }
      }
      passenger.passengerName = passenger.passengerName.trim();
      passenger.seatNumber = passenger.seatNumber.trim().toUpperCase();
    }

    const count = passengerList.length;
    const requestedSeats = passengerList.map((p) => p.seatNumber);

    if (new Set(requestedSeats).size !== requestedSeats.length) {
      return res.status(400).json({ message: 'Each passenger must have a different seat.' });
    }

    // ─── Atomic seat decrement — eliminates race condition ────────────────────
    // Only succeeds if availableSeats >= count
    const flight = await Flight.findOneAndUpdate(
      { _id: flightId, availableSeats: { $gte: count } },
      { $inc: { availableSeats: -count } },
      { new: true }
    );

    if (!flight) {
      // Either flight not found or not enough seats
      const check = await Flight.findById(flightId);
      if (!check) return res.status(404).json({ message: 'Flight not found' });
      return res.status(400).json({
        message: `Not enough seats. Only ${check.availableSeats} seat(s) available.`,
      });
    }

    // ─── Duplicate seat check ─────────────────────────────────────────────────
    const existingSeats  = await Booking.find({
      flight: flightId,
      seatNumber: { $in: requestedSeats },
      status: { $ne: 'Cancelled' },
    }).select('seatNumber');

    if (existingSeats.length > 0) {
      // Roll back seat count
      await Flight.findByIdAndUpdate(flightId, { $inc: { availableSeats: count } });
      const takenSeats = existingSeats.map((b) => b.seatNumber).join(', ');
      return res.status(400).json({ message: `Seat(s) ${takenSeats} already booked. Please choose different seats.` });
    }

    // ─── Create one booking per passenger ────────────────────────────────────
    const createdBookings = [];
    for (const p of passengerList) {
      const bookingReference = generateBookingRef();
      const booking = await Booking.create({
        user: req.user.id,
        flight: flightId,
        seatNumber: p.seatNumber,
        passengerName: p.passengerName,
        passengerAge: p.passengerAge ? Number(p.passengerAge) : undefined,
        bookingReference,
        totalPrice: flight.price,
        status: 'Confirmed',
      });
      createdBookings.push(booking);
    }

    // ─── Single confirmation notification (listing all refs) ─────────────────
    const refs = createdBookings.map((b) => b.bookingReference).join(', ');
    const seats = passengerList.map((p) => p.seatNumber).join(', ');
    await Notification.create({
      user: req.user.id,
      message: `Booking confirmed for flight ${flight.flightNumber} to ${flight.arrivalAirport}. Seat(s): ${seats}. Reference(s): ${refs}.`,
      type: 'booking_confirmation',
      isRead: false,
    });

    res.status(201).json(createdBookings);
  } catch (err) {
    next(err);
  }
};

// ─── GET my bookings ──────────────────────────────────────────────────────────
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('flight')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

// ─── GET single booking ───────────────────────────────────────────────────────
exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email')
      .populate('flight');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(booking);
  } catch (err) {
    next(err);
  }
};

// ─── CANCEL booking ───────────────────────────────────────────────────────────
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    booking.status = 'Cancelled';
    await booking.save();

    // Restore seat
    await Flight.findByIdAndUpdate(booking.flight, { $inc: { availableSeats: 1 } });

    await Notification.create({
      user: booking.user,
      message: `Your booking (${booking.bookingReference}) has been cancelled.`,
      type: 'booking_cancellation',
      isRead: false,
    });

    res.json(booking);
  } catch (err) {
    next(err);
  }
};

// ─── GET all bookings (admin, with pagination) ────────────────────────────────
exports.getAllBookings = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const skip  = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      Booking.find()
        .populate('user', 'name email')
        .populate('flight')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(),
    ]);

    res.json({ bookings, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};
