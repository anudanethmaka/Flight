const Flight = require('../models/Flight');

exports.getFlights = async (req, res, next) => {
  try {
    const flights = await Flight.find().sort({ departureTime: 1 });
    res.json(flights);
  } catch (err) {
    next(err);
  }
};

exports.searchFlights = async (req, res, next) => {
  try {
    const { from, to, date } = req.query;
    const query = {};

    if (from) {
      query.departureAirport = new RegExp(from, 'i');
    }
    if (to) {
      query.arrivalAirport = new RegExp(to, 'i');
    }
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      query.departureTime = { $gte: start, $lt: end };
    }

    const flights = await Flight.find(query).sort({ departureTime: 1 });
    res.json(flights);
  } catch (err) {
    next(err);
  }
};

exports.getFlightById = async (req, res, next) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }
    res.json(flight);
  } catch (err) {
    next(err);
  }
};

exports.createFlight = async (req, res, next) => {
  try {
    const {
      flightNumber,
      airline,
      departureAirport,
      arrivalAirport,
      departureTime,
      arrivalTime,
      totalSeats,
      price,
      status,
    } = req.body;

    const flight = await Flight.create({
      flightNumber,
      airline,
      departureAirport,
      arrivalAirport,
      departureTime,
      arrivalTime,
      totalSeats,
      availableSeats: totalSeats, // Available seats is initialized to total seats
      price,
      status: status || 'Scheduled',
    });

    res.status(201).json(flight);
  } catch (err) {
    next(err);
  }
};

exports.updateFlight = async (req, res, next) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    // Keep availableSeats sync correctly if totalSeats changes
    if (req.body.totalSeats !== undefined && req.body.totalSeats !== flight.totalSeats) {
      const difference = req.body.totalSeats - flight.totalSeats;
      req.body.availableSeats = Math.max(0, flight.availableSeats + difference);
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

exports.deleteFlight = async (req, res, next) => {
  try {
    const flight = await Flight.findByIdAndDelete(req.params.id);
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }
    res.json({ message: 'Flight deleted successfully' });
  } catch (err) {
    next(err);
  }
};
