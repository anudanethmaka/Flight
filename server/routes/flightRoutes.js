const express = require('express');
const {
  getFlights,
  getAirports,
  getFlightSeats,
  searchFlights,
  getFlightById,
  createFlight,
  updateFlight,
  deleteFlight,
} = require('../controllers/flightController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/airports', getAirports);          // public — airport autocomplete
router.get('/search', searchFlights);          // public
router.get('/:id/seats', getFlightSeats);      // public — booked seats for a flight
router.get('/', getFlights);                   // public
router.get('/:id', getFlightById);             // public
router.post('/', protect, isAdmin, createFlight);
router.put('/:id', protect, isAdmin, updateFlight);
router.delete('/:id', protect, isAdmin, deleteFlight);

module.exports = router;
