const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const Notification = require('../models/Notification');
const { generateBookingRef } = require('../utils/generateBookingRef');

exports.createBooking = async (req, res, next) => {
  try {
    const { flightId, seatNumber, passengerName, passengerAge } = req.body;

    const flight = await Flight.findById(flightId);
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    if (flight.availableSeats <= 0) {
      return res.status(400).json({ message: 'No seats available on this flight' });
    }

    // Create the booking reference
    const bookingReference = generateBookingRef();

    const booking = await Booking.create({
      user: req.user.id,
      flight: flightId,
      seatNumber,
      passengerName,
      passengerAge: passengerAge ? Number(passengerAge) : undefined,
      bookingReference,
      totalPrice: flight.price,
      status: 'Confirmed',
    });

    // Decrement available seats on the flight
    flight.availableSeats = Math.max(0, flight.availableSeats - 1);
    await flight.save();

    // Create a confirmation notification
    await Notification.create({
      user: req.user.id,
      message: `Your booking (${bookingReference}) for flight ${flight.flightNumber} to ${flight.arrivalAirport} has been confirmed.`,
      type: 'booking_confirmation',
      isRead: false,
    });

    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
};

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

exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email')
      .populate('flight');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check ownership: owner or admin
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(booking);
  } catch (err) {
    next(err);
  }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check ownership
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    booking.status = 'Cancelled';
    await booking.save();

    // Revert available seat count
    const flight = await Flight.findById(booking.flight);
    if (flight) {
      flight.availableSeats = Math.min(flight.totalSeats, flight.availableSeats + 1);
      await flight.save();
    }

    // Create a cancellation notification
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

exports.getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('flight')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};
