const Flight = require('../models/Flight');
const Booking = require('../models/Booking');

// ─── GET all flights (with pagination) ────────────────────────────────────────
exports.getFlights = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const skip  = (page - 1) * limit;

    const [flights, total] = await Promise.all([
      Flight.find().sort({ departureTime: 1 }).skip(skip).limit(limit),
      Flight.countDocuments(),
    ]);

    res.json({ flights, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// ─── GET distinct airport list (for autocomplete) ─────────────────────────────
exports.getAirports = async (req, res, next) => {
  try {
    const [departures, arrivals] = await Promise.all([
      Flight.distinct('departureAirport'),
      Flight.distinct('arrivalAirport'),
    ]);
    const airports = [...new Set([...departures, ...arrivals])].sort();
    res.json(airports);
  } catch (err) {
    next(err);
  }
};

// ─── GET booked seat numbers for a flight ─────────────────────────────────────
exports.getFlightSeats = async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      flight: req.params.id,
      status: { $ne: 'Cancelled' },
    }).select('seatNumber');
    const bookedSeats = bookings.map((b) => b.seatNumber);
    res.json(bookedSeats);
  } catch (err) {
    next(err);
  }
};

// ─── Search flights ───────────────────────────────────────────────────────────
exports.searchFlights = async (req, res, next) => {
  try {
    const { from, to, date } = req.query;
    const query = {
      status: { $nin: ['Cancelled', 'Completed'] }, // never show cancelled/completed in search
    };

    if (from) query.departureAirport = new RegExp(from, 'i');
    if (to)   query.arrivalAirport   = new RegExp(to,   'i');
    if (date) {
      const start = new Date(date);
      const end   = new Date(date);
      end.setDate(end.getDate() + 1);
      query.departureTime = { $gte: start, $lt: end };
    }

    const flights = await Flight.find(query).sort({ departureTime: 1 });
    res.json(flights);
  } catch (err) {
    next(err);
  }
};

// ─── GET single flight ────────────────────────────────────────────────────────
exports.getFlightById = async (req, res, next) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) return res.status(404).json({ message: 'Flight not found' });
    res.json(flight);
  } catch (err) {
    next(err);
  }
};

// ─── CREATE flight ────────────────────────────────────────────────────────────
exports.createFlight = async (req, res, next) => {
  try {
    const {
      flightNumber, airline, departureAirport, arrivalAirport,
      departureTime, arrivalTime, totalSeats, price, status,
    } = req.body;

    // Basic server-side validation
    if (!flightNumber || !airline || !departureAirport || !arrivalAirport ||
        !departureTime || !arrivalTime || !totalSeats || !price) {
      return res.status(400).json({ message: 'All flight fields are required' });
    }
    if (Number(price) <= 0 || Number(totalSeats) <= 0) {
      return res.status(400).json({ message: 'Price and seats must be positive numbers' });
    }
    if (new Date(arrivalTime) <= new Date(departureTime)) {
      return res.status(400).json({ message: 'Arrival time must be after departure time' });
    }

    const flight = await Flight.create({
      flightNumber, airline, departureAirport, arrivalAirport,
      departureTime, arrivalTime,
      totalSeats: Number(totalSeats),
      availableSeats: Number(totalSeats),
      price: Number(price),
      status: status || 'Scheduled',
    });

    res.status(201).json(flight);
  } catch (err) {
    next(err);
  }
};

// ─── UPDATE flight ────────────────────────────────────────────────────────────
exports.updateFlight = async (req, res, next) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) return res.status(404).json({ message: 'Flight not found' });

    // Keep availableSeats in sync if totalSeats changes
    if (req.body.totalSeats !== undefined && Number(req.body.totalSeats) !== flight.totalSeats) {
      const diff = Number(req.body.totalSeats) - flight.totalSeats;
      req.body.availableSeats = Math.max(0, flight.availableSeats + diff);
    }

    // Validate dates if both provided
    const depTime = req.body.departureTime || flight.departureTime;
    const arrTime = req.body.arrivalTime   || flight.arrivalTime;
    if (new Date(arrTime) <= new Date(depTime)) {
      return res.status(400).json({ message: 'Arrival time must be after departure time' });
    }

    const updatedFlight = await Flight.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json(updatedFlight);
  } catch (err) {
    next(err);
  }
};

// ─── DELETE flight (cascade-deletes related bookings) ─────────────────────────
exports.deleteFlight = async (req, res, next) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) return res.status(404).json({ message: 'Flight not found' });

    // Cascade: remove all bookings tied to this flight
    const { deletedCount } = await Booking.deleteMany({ flight: req.params.id });

    await flight.deleteOne();

    res.json({
      message: 'Flight deleted successfully',
      bookingsRemoved: deletedCount,
    });
  } catch (err) {
    next(err);
  }
};
